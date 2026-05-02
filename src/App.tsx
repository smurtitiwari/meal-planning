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
import AddRecipe from './pages/AddRecipe'
import SelectGroup from './pages/SelectGroup'

export default function App() {
  const onboardingComplete = useStore((s) => s.preferences.onboardingComplete)
  const darkMode = useStore((s) => s.preferences.darkMode)
  const loadUserData = useStore((s) => s.loadUserData)

  useEffect(() => {
    const syncUser = (
      event: string,
      user: { id: string; email?: string; user_metadata?: Record<string, string> },
    ) => {
      const googleName   = user.user_metadata?.full_name   || user.user_metadata?.name    || ''
      const googleEmail  = user.email                      || ''
      const googleAvatar = user.user_metadata?.avatar_url  || user.user_metadata?.picture || ''

      // Immediately hydrate the store with OAuth metadata so UI renders correctly
      useStore.getState().setPreferences({
        userId: user.id,
        name: googleName,
        email: googleEmail,
        profileImage: googleAvatar,
      })

      // On a fresh OAuth sign-in, also write metadata to DB so it is always recorded.
      // We use upsert with ignoreDuplicates so we never overwrite existing onboarding prefs.
      if (event === 'SIGNED_IN' && googleName) {
        supabase
          .from('profiles')
          .upsert(
            {
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
            },
            { onConflict: 'id', ignoreDuplicates: true },
          )
          .then(null, console.error)
      }

      loadUserData(user.id)
    }

    // Load data for any existing session on first render
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) syncUser('INITIAL_SESSION', session.user)
    })

    // Keep in sync whenever auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) syncUser(event, session.user)
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
        <Route path="/recipes/new" element={<AddRecipe />} />
        <Route path="/recipes/new/group" element={<SelectGroup />} />
        <Route path="/group" element={<Group />} />
        <Route path="/ask" element={<AskChef />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  )
}
