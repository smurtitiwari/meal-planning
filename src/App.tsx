import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import { supabase } from './lib/supabase'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import MealDetail from './pages/MealDetail'
import Planner from './pages/Planner'
import Recipes from './pages/Recipes'
import Profile from './pages/Profile'
import AskChef from './pages/AskChef'
import RecipeDetail from './pages/RecipeDetail'
import Group from './pages/Group'
import AuthCallback from './pages/AuthCallback'

export default function App() {
  const onboardingComplete = useStore((s) => s.preferences.onboardingComplete)
  const darkMode = useStore((s) => s.preferences.darkMode)
  const loadUserData = useStore((s) => s.loadUserData)

  useEffect(() => {
    // Load data for any existing session on first render
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData(session.user.id)
      }
    })

    // Keep in sync whenever auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserData(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [loadUserData])

  return (
    <div
      className={`max-w-md mx-auto min-h-screen ${darkMode ? 'dark-mode' : ''}`}
      style={{ background: darkMode ? '#121212' : '#F7F4EF' }}
    >
      <Routes>
        <Route path="/" element={<Navigate to={onboardingComplete ? '/home' : '/onboarding'} replace />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/home" element={<Home />} />
        <Route path="/meal/:date/:type" element={<MealDetail />} />
        <Route path="/recipe-view" element={<MealDetail />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/group" element={<Group />} />
        <Route path="/ask" element={<AskChef />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  )
}
