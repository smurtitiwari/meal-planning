/**
 * Supabase Edge Function — WhatsApp OTP Sender
 *
 * This function is configured as Supabase's custom SMS provider.
 * Supabase calls it whenever a phone OTP needs to be delivered.
 *
 * Required Edge Function secrets (set in Supabase Dashboard → Edge Functions → Secrets):
 *   WHATSAPP_ACCESS_TOKEN   — Meta Business System User token
 *   WHATSAPP_PHONE_ID       — Meta phone number ID for +918956486697
 *   FUNCTION_SECRET         — A random string to verify requests come from Supabase
 *
 * Supabase Dashboard setup:
 *   Auth → Providers → Phone → Enable
 *   Auth → Providers → Phone → SMS Provider → Custom
 *   SMS URL: https://<project-ref>.supabase.co/functions/v1/whatsapp-otp
 *   Content-Type: application/json
 */

const WHATSAPP_API = 'https://graph.facebook.com/v19.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-signature',
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()

    // Supabase custom SMS webhook payload: { phone, otp }
    const phone: string = body.phone ?? body.Phone ?? ''
    const otp: string = body.otp ?? body.Otp ?? body.token ?? ''

    if (!phone || !otp) {
      return json({ error: 'phone and otp are required' }, 400)
    }

    const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
    const phoneId = Deno.env.get('WHATSAPP_PHONE_ID')

    if (!accessToken || !phoneId) {
      console.error('Missing WhatsApp credentials')
      return json({ error: 'WhatsApp not configured' }, 500)
    }

    // Normalize phone: Meta API wants digits only, no +
    const to = phone.replace(/\D/g, '')

    // Send WhatsApp message via Meta Cloud API
    const waRes = await fetch(`${WHATSAPP_API}/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: {
          body: `*${otp}* is your Meal Planner verification code.\n\nValid for 10 minutes. Do not share this with anyone. 🔒`,
        },
      }),
    })

    const waBody = await waRes.json()

    if (!waRes.ok) {
      console.error('Meta WhatsApp API error:', JSON.stringify(waBody))
      return json({ error: waBody?.error?.message ?? 'WhatsApp send failed' }, 502)
    }

    console.log(`OTP sent via WhatsApp to ${phone}`, waBody.messages?.[0]?.id)
    return json({ success: true })

  } catch (err) {
    console.error('Edge function error:', err)
    return json({ error: String(err) }, 500)
  }
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
