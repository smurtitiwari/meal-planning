import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import MealDetail from './pages/MealDetail'
import Planner from './pages/Planner'
import Recipes from './pages/Recipes'
import Profile from './pages/Profile'
import AskJulienne from './pages/AskJulienne'

export default function App() {
  const onboardingComplete = useStore((s) => s.preferences.onboardingComplete)
  const darkMode = useStore((s) => s.preferences.darkMode)

  return (
    <div
      className={`max-w-md mx-auto min-h-screen ${darkMode ? 'dark-mode' : ''}`}
      style={{ background: darkMode ? '#121212' : '#FFFFFF' }}
    >
      <Routes>
        <Route path="/" element={<Navigate to={onboardingComplete ? '/home' : '/onboarding'} replace />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/home" element={<Home />} />
        <Route path="/meal/:date/:type" element={<MealDetail />} />
        <Route path="/recipe-view" element={<MealDetail />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/ask" element={<AskJulienne />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  )
}
