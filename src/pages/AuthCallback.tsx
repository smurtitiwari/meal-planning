import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

/**
 * Landing page for OAuth redirects.
 * Supabase exchanges the code in the URL for a session automatically.
 * We then redirect the user to the right screen.
 */
export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // Check if onboarding is complete
        supabase
          .from('profiles')
          .select('onboarding_complete')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data?.onboarding_complete) {
              navigate('/', { replace: true })
            } else {
              navigate('/onboarding', { replace: true })
            }
          })
      } else {
        navigate('/onboarding', { replace: true })
      }
    })
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F7F4EF' }}>
      <div style={{ textAlign: 'center', color: '#6F6B73', fontSize: 14 }}>
        Signing you in…
      </div>
    </div>
  )
}
