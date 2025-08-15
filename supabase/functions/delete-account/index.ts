import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    // Create client with service role for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    // Create client with user token to get user info
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: {
        headers: { Authorization: authHeader }
      }
    })

    // Get the current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    console.log(`Deleting account for user: ${user.id}`)

    // Delete user data in the correct order (respecting foreign key constraints)
    
    // 1. Delete from contact_activities (references contacts)
    await supabaseAdmin
      .from('contact_activities')
      .delete()
      .eq('contact_id', user.id)
    
    // 2. Delete from contacts
    await supabaseAdmin
      .from('contacts')
      .delete()
      .eq('email', user.email)
    
    // 3. Delete from newsletter_subscribers
    await supabaseAdmin
      .from('newsletter_subscribers')
      .delete()
      .eq('email', user.email)
    
    // 4. Delete from lead_magnet_downloads
    await supabaseAdmin
      .from('lead_magnet_downloads')
      .delete()
      .eq('email', user.email)
    
    // 5. Delete from orders
    await supabaseAdmin
      .from('orders')
      .delete()
      .eq('user_email', user.email)
    
    // 6. Delete from subscribers
    await supabaseAdmin
      .from('subscribers')
      .delete()
      .eq('user_id', user.id)
    
    // 7. Delete from profiles
    await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user.id)
    
    // 8. Finally delete the auth user (this will cascade to auth-related tables)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    if (deleteError) {
      throw deleteError
    }

    console.log(`Successfully deleted account for user: ${user.id}`)

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error deleting account:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to delete account',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})