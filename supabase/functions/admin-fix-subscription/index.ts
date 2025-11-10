import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ADMIN_SECRET = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, action, planName, subscriptionEnd, adminKey, adminUserId } = await req.json();
    
    // STRENGTHENED AUTHENTICATION: Require full admin secret
    if (!adminKey || adminKey !== ADMIN_SECRET) {
      console.error('❌ Unauthorized admin access attempt');
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Invalid admin credentials.' }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 403,
        }
      );
    }
    
    console.log(`✅ Admin authenticated: ${adminUserId || 'system'}`);

    if (!email || !action) {
      throw new Error('Missing email or action');
    }

    console.log(`Admin action: ${action} for ${email}`);

    // Get user ID
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users?.users?.find(u => u.email === email);

    if (!user) {
      throw new Error('User not found');
    }

    if (action === 'restore_subscription') {
      // Enable manual override for protected subscriptions
      await supabase.rpc('set_config', {
        setting_name: 'app.allow_manual_override',
        setting_value: 'true'
      });
      
      // Set change source for audit log
      await supabase.rpc('set_config', {
        setting_name: 'app.change_source',
        setting_value: `admin_restore_by_${adminUserId || 'system'}`
      });
      
      // Restore subscription with manual flag
      const { error: subError } = await supabase
        .from('subscribers')
        .upsert({
          email: email,
          user_id: user.id,
          subscribed: true,
          subscription_tier: planName || 'Starter Plan',
          subscription_end: subscriptionEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          manual_subscription: true, // CRITICAL: Mark as manual to protect from overwrites
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });

      if (subError) throw subError;

      console.log(`✅ Restored subscription to ${planName} for ${email} (PROTECTED)`);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Subscription restored to ${planName}`,
          userId: user.id,
        }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 200,
        }
      );
    }

    if (action === 'remove_invalid_credits') {
      // Remove the invalid credit transaction
      const { transactionId } = await req.json();
      
      if (!transactionId) {
        throw new Error('Missing transaction ID');
      }

      // Get transaction details first
      const { data: transaction } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Delete the transaction
      const { error: deleteError } = await supabase
        .from('credit_transactions')
        .delete()
        .eq('id', transactionId);

      if (deleteError) throw deleteError;

      // Update user credits balance
      const { error: creditsError } = await supabase
        .from('user_credits')
        .update({
          credits_balance: supabase.sql`credits_balance - ${transaction.credits_amount}`,
          total_credits_purchased: supabase.sql`total_credits_purchased - ${transaction.credits_amount}`,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (creditsError) throw creditsError;

      console.log(`✅ Removed invalid credits for ${email}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Invalid credits removed',
          creditsRemoved: transaction.credits_amount,
        }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 200,
        }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Admin fix error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 400,
      }
    );
  }
});
