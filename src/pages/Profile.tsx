import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import BottomNav from '../components/BottomNav'
import { ChevronRight, Moon, Sun, LogOut, User, Mail, ChefHat, ShoppingCart, Utensils, X, Check, Send } from 'lucide-react'

const DIETARY_OPTIONS = ['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan', 'High Protein']
const AVOID_OPTIONS = ['Dairy', 'Gluten', 'Nuts', 'Spicy food', 'Onion & Garlic', 'Seafood']
const GROCERY_APPS: { id: 'blinkit' | 'zepto' | 'swiggy' | 'bigbasket' | 'dunzo'; name: string }[] = [
  { id: 'blinkit', name: 'Blinkit' },
  { id: 'zepto', name: 'Zepto' },
  { id: 'swiggy', name: 'Swiggy Instamart' },
  { id: 'bigbasket', name: 'BigBasket' },
  { id: 'dunzo', name: 'Dunzo' },
]

export default function Profile() {
  const navigate = useNavigate()
  const { preferences, setPreferences, signOut } = useStore()
  const [editModal, setEditModal] = useState<'dietary' | 'avoidances' | 'cook' | 'grocery' | null>(null)

  // Editable state
  const [dietary, setDietary] = useState<string[]>(preferences.dietaryPreferences)
  const [avoidances, setAvoidances] = useState<string[]>(preferences.avoidances)
  const [hasCook, setHasCook] = useState(preferences.hasCook)
  const [cookName, setCookName] = useState(preferences.cookName)
  const [cookPhone, setCookPhone] = useState(preferences.cookPhone)
  const [groceryApp, setGroceryApp] = useState(preferences.preferredGroceryApp)

  const toggleDark = () => setPreferences({ darkMode: !preferences.darkMode })

  const toggle = (arr: string[], item: string, setter: (v: string[]) => void) =>
    setter(arr.includes(item) ? arr.filter((d) => d !== item) : [...arr, item])

  const saveModal = () => {
    if (editModal === 'dietary') setPreferences({ dietaryPreferences: dietary })
    if (editModal === 'avoidances') setPreferences({ avoidances })
    if (editModal === 'cook') setPreferences({ hasCook, cookName, cookPhone })
    if (editModal === 'grocery') setPreferences({ preferredGroceryApp: groceryApp })
    setEditModal(null)
  }

  const handleSignOut = () => {
    signOut()
    navigate('/onboarding', { replace: true })
  }

  const groceryAppName = preferences.preferredGroceryApp
    ? preferences.preferredGroceryApp.charAt(0).toUpperCase() + preferences.preferredGroceryApp.slice(1)
    : 'Not set'

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F7F3EE' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-6">
        <div className="flex items-center gap-4">
          {preferences.profileImage ? (
            <img src={preferences.profileImage} alt="" style={{ width: 56, height: 56, borderRadius: 28, objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: 56, height: 56, borderRadius: 28, background: '#EFEAFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: 700, color: '#8B74D3',
            }}>
              {(preferences.name || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1F1E2E', margin: 0, letterSpacing: '-0.02em' }}>
              {preferences.name || 'User'}
            </h1>
            {preferences.email && (
              <p style={{ fontSize: '13px', color: '#A09DAB', margin: '2px 0 0 0' }}>
                {preferences.email}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="px-5">
        {/* Appearance */}
        <div className="mb-6">
          <p className="section-label" style={{ margin: '0 0 10px 0' }}>Appearance</p>
          <div className="card">
            <button onClick={toggleDark}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-transparent border-none cursor-pointer">
              <div className="flex items-center gap-3">
                {preferences.darkMode ? <Moon size={18} style={{ color: '#8B74D3' }} /> : <Sun size={18} style={{ color: '#A09DAB' }} />}
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1F1E2E' }}>Dark mode</span>
              </div>
              <div style={{
                width: 44, height: 26, borderRadius: 13, padding: 3,
                background: preferences.darkMode ? '#B8A6E6' : '#EAE4DC',
                transition: 'background 0.2s',
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 10, background: '#FFF',
                  transform: preferences.darkMode ? 'translateX(18px)' : 'translateX(0)',
                  transition: 'transform 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }} />
              </div>
            </button>
          </div>
        </div>

        {/* Food Preferences */}
        <div className="mb-6">
          <p className="section-label" style={{ margin: '0 0 10px 0' }}>Food preferences</p>
          <div className="card overflow-hidden">
            <button onClick={() => { setDietary(preferences.dietaryPreferences); setEditModal('dietary') }}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-transparent border-none cursor-pointer"
              style={{ borderBottom: '1px solid #EAE4DC' }}>
              <div className="flex items-center gap-3">
                <Utensils size={18} style={{ color: '#A09DAB' }} />
                <div className="text-left">
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#1F1E2E', display: 'block' }}>Dietary style</span>
                  <span style={{ fontSize: '12px', color: '#A09DAB' }}>
                    {preferences.dietaryPreferences.length > 0 ? preferences.dietaryPreferences.join(', ') : 'Not set'}
                  </span>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: '#D5D1DC' }} />
            </button>
            <button onClick={() => { setAvoidances(preferences.avoidances); setEditModal('avoidances') }}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-transparent border-none cursor-pointer">
              <div className="flex items-center gap-3">
                <span style={{ fontSize: '18px' }}>🚫</span>
                <div className="text-left">
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#1F1E2E', display: 'block' }}>Avoidances</span>
                  <span style={{ fontSize: '12px', color: '#A09DAB' }}>
                    {preferences.avoidances.length > 0 ? preferences.avoidances.join(', ') : 'None'}
                  </span>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: '#D5D1DC' }} />
            </button>
          </div>
        </div>

        {/* Cook Details */}
        <div className="mb-6">
          <p className="section-label" style={{ margin: '0 0 10px 0' }}>Cook</p>
          <div className="card">
            <button onClick={() => { setHasCook(preferences.hasCook); setCookName(preferences.cookName); setCookPhone(preferences.cookPhone); setEditModal('cook') }}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-transparent border-none cursor-pointer">
              <div className="flex items-center gap-3">
                <ChefHat size={18} style={{ color: '#A09DAB' }} />
                <div className="text-left">
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#1F1E2E', display: 'block' }}>
                    {preferences.hasCook ? preferences.cookName || 'Cook' : 'No cook'}
                  </span>
                  <span style={{ fontSize: '12px', color: '#A09DAB' }}>
                    {preferences.hasCook && preferences.cookPhone ? `+91 ${preferences.cookPhone}` : 'Tap to edit'}
                  </span>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: '#D5D1DC' }} />
            </button>
          </div>
        </div>

        {/* Grocery App */}
        <div className="mb-6">
          <p className="section-label" style={{ margin: '0 0 10px 0' }}>Grocery</p>
          <div className="card">
            <button onClick={() => { setGroceryApp(preferences.preferredGroceryApp); setEditModal('grocery') }}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-transparent border-none cursor-pointer">
              <div className="flex items-center gap-3">
                <ShoppingCart size={18} style={{ color: '#A09DAB' }} />
                <div className="text-left">
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#1F1E2E', display: 'block' }}>Preferred app</span>
                  <span style={{ fontSize: '12px', color: '#A09DAB' }}>{groceryAppName}</span>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: '#D5D1DC' }} />
            </button>
          </div>
        </div>

        {/* Sign Out */}
        <button onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border cursor-pointer mb-8"
          style={{ background: 'transparent', borderColor: '#EAE4DC', color: '#D9534F', fontSize: '14px', fontWeight: 600 }}>
          <LogOut size={16} /> Sign out
        </button>
      </div>

      {/* ===== EDIT MODALS ===== */}
      {editModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-5"
          onClick={() => setEditModal(null)}>
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#1F1E2E' }}>
                {editModal === 'dietary' && 'Dietary style'}
                {editModal === 'avoidances' && 'Avoidances'}
                {editModal === 'cook' && 'Cook details'}
                {editModal === 'grocery' && 'Grocery app'}
              </h3>
              <button onClick={() => setEditModal(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer"
                style={{ background: '#EFE9E0' }}>
                <X size={16} />
              </button>
            </div>

            {editModal === 'dietary' && (
              <div className="space-y-2.5">
                {DIETARY_OPTIONS.map((opt) => {
                  const sel = dietary.includes(opt)
                  return (
                    <button key={opt} onClick={() => toggle(dietary, opt, setDietary)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border cursor-pointer transition-smooth"
                      style={{ background: sel ? '#EFEAFF' : '#FFF', borderColor: sel ? '#B8A6E6' : '#EAE4DC', borderWidth: '1.5px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: sel ? '#8B74D3' : '#1F1E2E' }}>{opt}</span>
                      {sel && <Check size={16} style={{ color: '#8B74D3' }} />}
                    </button>
                  )
                })}
              </div>
            )}

            {editModal === 'avoidances' && (
              <div className="space-y-2.5">
                {AVOID_OPTIONS.map((opt) => {
                  const sel = avoidances.includes(opt)
                  return (
                    <button key={opt} onClick={() => toggle(avoidances, opt, setAvoidances)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border cursor-pointer transition-smooth"
                      style={{ background: sel ? '#EFEAFF' : '#FFF', borderColor: sel ? '#B8A6E6' : '#EAE4DC', borderWidth: '1.5px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: sel ? '#8B74D3' : '#1F1E2E' }}>{opt}</span>
                      {sel && <Check size={16} style={{ color: '#8B74D3' }} />}
                    </button>
                  )
                })}
              </div>
            )}

            {editModal === 'cook' && (
              <div className="space-y-4">
                <div className="flex gap-3">
                  {[{ val: true, label: 'Yes' }, { val: false, label: 'No' }].map(({ val, label }) => (
                    <button key={String(val)} onClick={() => setHasCook(val)}
                      className="flex-1 py-3 rounded-xl border cursor-pointer transition-smooth"
                      style={{
                        background: hasCook === val ? '#26233A' : '#FFF',
                        borderColor: hasCook === val ? '#26233A' : '#EAE4DC', borderWidth: '1.5px',
                        color: hasCook === val ? '#FFF' : '#1F1E2E', fontSize: '14px', fontWeight: 600,
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
                {hasCook && (
                  <>
                    <div>
                      <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Cook's name</label>
                      <input type="text" value={cookName} onChange={(e) => setCookName(e.target.value)} placeholder="e.g. Ramu bhaiya"
                        style={{ width: '100%', padding: '12px 16px', borderRadius: 14, border: '1.5px solid #EAE4DC', fontSize: '15px', outline: 'none' }}
                        onFocus={(e) => e.target.style.borderColor = '#B8A6E6'} onBlur={(e) => e.target.style.borderColor = '#EAE4DC'} />
                    </div>
                    <div>
                      <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>WhatsApp number</label>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-3 rounded-xl" style={{ background: '#EFE9E0' }}>
                          <Send size={14} style={{ color: '#25D366' }} />
                          <span style={{ fontSize: '14px', color: '#7A768A' }}>+91</span>
                        </div>
                        <input type="tel" value={cookPhone} onChange={(e) => setCookPhone(e.target.value)} placeholder="9876543210"
                          style={{ flex: 1, padding: '12px 16px', borderRadius: 14, border: '1.5px solid #EAE4DC', fontSize: '15px', outline: 'none' }}
                          onFocus={(e) => e.target.style.borderColor = '#B8A6E6'} onBlur={(e) => e.target.style.borderColor = '#EAE4DC'} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {editModal === 'grocery' && (
              <div className="space-y-2.5">
                {GROCERY_APPS.map((app) => {
                  const sel = groceryApp === app.id
                  return (
                    <button key={app.id} onClick={() => setGroceryApp(app.id)}
                      className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border cursor-pointer transition-smooth"
                      style={{ background: sel ? '#EFEAFF' : '#FFF', borderColor: sel ? '#B8A6E6' : '#EAE4DC', borderWidth: '1.5px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: sel ? '#8B74D3' : '#1F1E2E' }}>{app.name}</span>
                      {sel && <Check size={16} style={{ color: '#8B74D3' }} />}
                    </button>
                  )
                })}
              </div>
            )}

            <button onClick={saveModal}
              className="w-full py-3.5 rounded-xl border-none cursor-pointer mt-5"
              style={{ background: '#26233A', color: '#FFF', fontSize: '14px', fontWeight: 600 }}>
              Save
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
