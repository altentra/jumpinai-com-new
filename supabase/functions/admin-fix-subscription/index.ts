import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      throw new Error('Missing environment variables');
    }

    // Create client with user's JWT for role checking
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('❌ Failed to get authenticated user:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Check if user has admin role using the has_role RPC
    const { data: isAdmin, error: roleError } = await supabaseClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (roleError || !isAdmin) {
      console.error('❌ Admin role check failed:', roleError);
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    console.log(`✅ Admin authenticated: ${user.email}`);

    // Now use service role client for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, action, planName, subscriptionEnd, creditsToAdd } = await req.json();

    if (!email || !action) {
      throw new Error('Missing email or action');
    }

    console.log(`Admin action: ${action} for ${email}`);

    // Get user ID
    const { data: users } = await supabase.auth.admin.listUsers();
    const targetUser = users?.users?.find(u => u.email === email);

    if (!targetUser) {
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
        setting_value: `admin_restore_by_${user.email}`
      });
      
      // Restore subscription with manual flag
      const { error: subError } = await supabase
        .from('subscribers')
        .upsert({
          email: email,
          user_id: targetUser.id,
          subscribed: true,
          subscription_tier: planName || 'Starter Plan',
          subscription_end: subscriptionEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          manual_subscription: true, // CRITICAL: Mark as manual to protect from overwrites
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });

      if (subError) throw subError;

      console.log(`✅ Restored subscription to ${planName} for ${email} (PROTECTED)`);

      // Add credits if specified
      let creditsAdded = 0;
      if (creditsToAdd && creditsToAdd > 0) {
        const { error: creditsError } = await supabase.rpc('add_user_credits', {
          p_user_id: targetUser.id,
          p_credits: creditsToAdd,
          p_description: `Admin granted ${creditsToAdd} credits with ${planName} subscription`,
          p_reference_id: `admin_grant_${Date.now()}`
        });

        if (creditsError) {
          console.error('Failed to add credits:', creditsError);
          throw new Error(`Subscription restored but failed to add credits: ${creditsError.message}`);
        }
        
        creditsAdded = creditsToAdd;
        console.log(`✅ Added ${creditsToAdd} credits for ${email}`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Subscription restored to ${planName}${creditsAdded > 0 ? ` and ${creditsAdded} credits added` : ''}`,
          userId: targetUser.id,
          creditsAdded,
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
        .eq('user_id', targetUser.id);

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
