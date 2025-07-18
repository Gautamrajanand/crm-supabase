import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailPayload {
  to: string
  role: string
  invitationId: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload: EmailPayload = await req.json()
    const { to, role, invitationId } = payload

    // Create accept URL with invitation ID
    const acceptUrl = `${Deno.env.get('SITE_URL')}/accept-invitation?id=${invitationId}`

    // For local testing, just log the email details
    console.log('Would send email:', {
      to,
      subject: 'Team Invitation',
      html: `
        <h2>You've been invited!</h2>
        <p>You've been invited to join the team as a ${role}.</p>
        <p>Click the link below to accept the invitation:</p>
        <p><a href="http://localhost:3000/accept-invitation?id=${invitationId}">Accept Invitation</a></p>
        <p>If you did not expect this invitation, you can safely ignore this email.</p>
      `
    })
    
    // In development, we'll simulate success
    const error = null

    if (error) throw error

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
