import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Auth0User {
  user_id: string
  email: string
  name?: string
  picture?: string
  email_verified?: boolean
  created_at?: string
  updated_at?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Auth0 sync webhook received:', req.method)
    
    // Verify webhook secret for security
    const webhookSecret = Deno.env.get('AUTH0_WEBHOOK_SECRET')
    const authHeader = req.headers.get('authorization')
    
    if (!authHeader || !webhookSecret) {
      console.error('Missing auth header or webhook secret')
      return new Response('Unauthorized', { 
        status: 401, 
        headers: corsHeaders 
      })
    }

    // Extract the secret from the authorization header
    const providedSecret = authHeader.replace('Bearer ', '')
    if (providedSecret !== webhookSecret) {
      console.error('Invalid webhook secret')
      return new Response('Unauthorized', { 
        status: 401, 
        headers: corsHeaders 
      })
    }

    const body = await req.json()
    console.log('Webhook payload:', JSON.stringify(body, null, 2))

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle different Auth0 events
    const eventType = body.event || body.type
    const user: Auth0User = body.user || body

    console.log('Processing event:', eventType, 'for user:', user.user_id)

    switch (eventType) {
      case 'post_user_registration':
      case 'user_created':
      case 's:user:created':
        await handleUserCreated(supabase, user)
        break
        
      case 'post_user_profile_update':
      case 'user_updated': 
      case 's:user:updated':
        await handleUserUpdated(supabase, user)
        break
        
      case 'post_user_deletion':
      case 'user_deleted':
      case 's:user:deleted':
        await handleUserDeleted(supabase, user)
        break
        
      default:
        console.log('Unhandled event type:', eventType)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Auth0 sync error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

async function handleUserCreated(supabase: any, user: Auth0User) {
  console.log('Creating profile for user:', user.user_id)
  
  try {
    // Extract Auth0 user ID (remove auth0| prefix if present)
    const userId = user.user_id.replace(/^auth0\|/, '')
    
    // Create profile in Supabase
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        display_name: user.name || user.email?.split('@')[0] || '',
        avatar_url: user.picture || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      throw profileError
    }

    // Create subscriber record (free tier by default)
    const { error: subscriberError } = await supabase
      .from('subscribers')
      .upsert({
        user_id: userId,
        email: user.email,
        subscribed: false,
        subscription_tier: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (subscriberError) {
      console.error('Subscriber creation error:', subscriberError)
      // Don't throw here, profile creation is more important
    }

    console.log('Successfully created profile and subscriber for:', user.user_id)
    
  } catch (error) {
    console.error('Error in handleUserCreated:', error)
    throw error
  }
}

async function handleUserUpdated(supabase: any, user: Auth0User) {
  console.log('Updating profile for user:', user.user_id)
  
  try {
    const userId = user.user_id.replace(/^auth0\|/, '')
    
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: user.name || user.email?.split('@')[0] || '',
        avatar_url: user.picture || '',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Profile update error:', error)
      throw error
    }

    // Update subscriber email if needed
    if (user.email) {
      const { error: emailError } = await supabase
        .from('subscribers')
        .update({
          email: user.email,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        
      if (emailError) {
        console.error('Subscriber email update error:', emailError)
        // Don't throw here
      }
    }

    console.log('Successfully updated profile for:', user.user_id)
    
  } catch (error) {
    console.error('Error in handleUserUpdated:', error)
    throw error
  }
}

async function handleUserDeleted(supabase: any, user: Auth0User) {
  console.log('Deleting profile for user:', user.user_id)
  
  try {
    const userId = user.user_id.replace(/^auth0\|/, '')
    
    // Delete user data in correct order (respecting foreign keys)
    const tables = ['contact_activities', 'contacts', 'orders', 'subscribers', 'profiles']
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq(table === 'contacts' ? 'email' : 'user_id', table === 'contacts' ? user.email : userId)
        
      if (error && !error.message.includes('No rows found')) {
        console.error(`Error deleting from ${table}:`, error)
      }
    }

    console.log('Successfully deleted profile for:', user.user_id)
    
  } catch (error) {
    console.error('Error in handleUserDeleted:', error)
    throw error
  }
}