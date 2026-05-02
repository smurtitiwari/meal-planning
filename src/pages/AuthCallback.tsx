import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

/**
 * Landing page for OAuth redirects (Google, Apple).
 * Supabase exchanges the URL code for a session automatically (detectSessionInUrl: true).
 * We then save the user's OAuth profile data to the profiles table and route them.
 */
export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        navigate('/onboarding', { replace: true })
        return
      }

      const user = session.user
      const googleName   = user.user_metadata?.full_name   || user.user_metadata?.name    || ''
      const googleEmail  = user.email                      || ''
      const googleAvatar = user.user_metadata?.avatar_url  || user.user_metadata?.picture || ''

      try {
        // Check whether a profile row already exists for this user
        const { data: existing } = await supabase
          .from('profiles')
          .select('onboarding_complete, name, email, profile_image')
          .eq('id', user.id)
          .single()

        if (!existing) {
          // ── New user ── create profile row with Google data + sensible defaults
          await supabase.from('profiles').insert({
            id:                      user.id,
            name:                    googleName,
            email:                   googleEmail,
            profile_image:           googleAvatar,
            dietary_preferences:     [],
            avoidances:              [],
            meal_count:              3,
            has_cook:                false,
            cook_name:               null,
            cook_phone:              null,
            preferred_grocery_app:   null,
            preferred_grocery_apps:  [],
            onboarding_complete:     false,
            dark_mode:               false,
            cook_message_language:   'hinglish',
            share_recipes_with_group: true,
          })
          navigate('/onboarding', { replace: true })
        } else {
          // ── Returning user ── patch any missing Google metadata fields
          const patch: { name?: string; email?: string; profile_image?: string } = {}
          if (!existing.name          && googleName)   patch.name          = googleName
          if (!existing.email         && googleEmail)  patch.email         = googleEmail
          if (!existing.profile_image && googleAvatar) patch.profile_image = googleAvatar

          if (Object.keys(patch).length > 0) {
            await supabase.from('profiles').update(patch).eq('id', user.id)
          }

          navigate(existing.onboarding_complete ? '/home' : '/onboarding', { replace: true })
        }
      } catch {
        navigate('/onboarding', { replace: true })
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F3F1' }}>
      <div style={{ textAlign: 'center', color: '#6F6B66', fontSize: 14 }}>
        Signing you in…
      </div>
    </div>
  )
}
