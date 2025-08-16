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
    // Try to reuse existing profile id from subscribers by email, otherwise generate a new UUID
    let profileId: string | null = null

    if (user.email) {
      const { data: existingSub, error: subLookupError } = await supabase
        .from('subscribers')
        .select('user_id')
        .eq('email', user.email)
        .maybeSingle()

      if (subLookupError) {
        console.warn('Subscriber lookup error (non-fatal):', subLookupError)
      }

      profileId = existingSub?.user_id ?? null
    }

    if (!profileId) {
      // Generate a UUID for our profiles table (it expects uuid, not Auth0 id)
      profileId = crypto.randomUUID()
    }

    // Upsert profile in Supabase using the UUID profileId
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: profileId,
        display_name: user.name || user.email?.split('@')[0] || '',
        avatar_url: user.picture || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      throw profileError
    }

    // Create or update subscriber record, linking to the same profileId
    const { error: subscriberError } = await supabase
      .from('subscribers')
      .upsert({
        user_id: profileId,
        email: user.email,
        subscribed: false,
        subscription_tier: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'email' })

    if (subscriberError) {
      console.error('Subscriber creation error:', subscriberError)
      // Don't throw here, profile creation is more important
    }

    console.log('Successfully created/linked profile and subscriber for:', user.user_id, 'profileId:', profileId)
    
  } catch (error) {
    console.error('Error in handleUserCreated:', error)
    throw error
  }
}

async function handleUserUpdated(supabase: any, user: Auth0User) {
  console.log('Updating profile for user:', user.user_id)
  
  try {
    // Find linked profileId via subscribers by email
    let profileId: string | null = null

    if (user.email) {
      const { data: existingSub, error: subLookupError } = await supabase
        .from('subscribers')
        .select('user_id')
        .eq('email', user.email)
        .maybeSingle()

      if (subLookupError) {
        console.warn('Subscriber lookup error (non-fatal):', subLookupError)
      }

      profileId = existingSub?.user_id ?? null
    }

    if (!profileId) {
      // If we can't find a profile, create it now to keep things consistent
      console.log('No existing profile found, creating one...')
      await handleUserCreated(supabase, user)
      return
    }
    
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: user.name || user.email?.split('@')[0] || '',
        avatar_url: user.picture || '',
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId)

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
        .eq('user_id', profileId)
        
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
    // Resolve profileId via subscribers by email
    let profileId: string | null = null

    if (user.email) {
      const { data: existingSub } = await supabase
        .from('subscribers')
        .select('user_id')
        .eq('email', user.email)
        .maybeSingle()
      profileId = existingSub?.user_id ?? null
    }

    // Delete user-related data
    // Orders: match by user_email
    if (user.email) {
      const { error: ordersError } = await supabase
        .from('orders')
        .delete()
        .eq('user_email', user.email)
      if (ordersError) {
        console.error('Error deleting from orders:', ordersError)
      }

      // Contacts by email
      const { error: contactsError } = await supabase
        .from('contacts')
        .delete()
        .eq('email', user.email)
      if (contactsError) {
        console.error('Error deleting from contacts:', contactsError)
      }
    }

    // Subscribers by profileId or email
    if (profileId) {
      const { error: subByIdError } = await supabase
        .from('subscribers')
        .delete()
        .eq('user_id', profileId)
      if (subByIdError) {
        console.error('Error deleting subscriber by user_id:', subByIdError)
      }
    }
    if (user.email) {
      const { error: subByEmailError } = await supabase
        .from('subscribers')
        .delete()
        .eq('email', user.email)
      if (subByEmailError) {
        console.error('Error deleting subscriber by email:', subByEmailError)
      }
    }

    // Profiles by id
    if (profileId) {
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId)
      if (profileError) {
        console.error('Error deleting profile:', profileError)
      }
    }

    console.log('Successfully deleted data for:', user.user_id)
    
  } catch (error) {
    console.error('Error in handleUserDeleted:', error)
    throw error
  }
}