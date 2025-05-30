import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'

interface EmailRequest {
  template_name: string
  to: string
  data: Record<string, any>
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

    const { template_name, to, data } = await req.json() as EmailRequest

    // Get email template
    const { data: template, error: templateError } = await supabaseClient
      .from('auth.email_templates')
      .select('*')
      .eq('template_name', template_name)
      .single()

    if (templateError) throw templateError
    if (!template) throw new Error('Email template not found')

    // Replace variables in template
    let subject = template.subject
    let html = template.content_html
    let text = template.content_text

    // Replace all variables in the format {{ variable.path }}
    const replaceVariables = (content: string) => {
      return content.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, path) => {
        const value = path.split('.').reduce((obj: any, key: string) => obj?.[key], data)
        return value ?? match
      })
    }

    subject = replaceVariables(subject)
    html = replaceVariables(html)
    text = replaceVariables(text)

    // Send email using Resend
    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) throw new Error('RESEND_API_KEY not found')

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'CRM <noreply@yourdomain.com>',
        to: [to],
        subject,
        html,
        text
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message)
    }

    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
