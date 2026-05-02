import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import BottomNav from '../components/BottomNav'
import { ChevronRight, Moon, Sun, LogOut, ChefHat, ShoppingCart, Utensils, X, Check, Send, Globe, Users } from 'lucide-react'

const DIETARY_OPTIONS: { label: string; emoji: string }[] = [
  { label: 'Vegetarian', emoji: '🥬' },
  { label: 'Non-Vegetarian', emoji: '🍗' },
  { label: 'Eggetarian', emoji: '🥚' },
  { label: 'Vegan', emoji: '🌱' },
]
const AVOID_OPTIONS: { label: string; emoji: string }[] = [
  { label: 'Dairy', emoji: '🥛' },
  { label: 'Gluten', emoji: '🌾' },
  { label: 'Nuts', emoji: '🥜' },
  { label: 'Spicy food', emoji: '🌶️' },
  { label: 'Onion & Garlic', emoji: '🧅' },
  { label: 'Seafood', emoji: '🦐' },
]
const GROCERY_APPS: { id: 'blinkit' | 'zepto' | 'swiggy' | 'bigbasket' | 'dunzo'; name: string; emoji: string }[] = [
  { id: 'blinkit', name: 'Blinkit', emoji: '⚡' },
  { id: 'zepto', name: 'Zepto', emoji: '🟣' },
  { id: 'swiggy', name: 'Swiggy Instamart', emoji: '🧡' },
  { id: 'bigbasket', name: 'BigBasket', emoji: '🟢' },
  { id: 'dunzo', name: 'Dunzo', emoji: '📦' },
]
const LANGUAGE_LABELS: Record<'english' | 'hindi' | 'hinglish', string> = {
  english: 'English',
  hindi: 'Hindi',
  hinglish: 'Hinglish',
}

export default function Profile() {
  const navigate = useNavigate()
  const { preferences, setPreferences, signOut, groupMembers } = useStore()
  const [editModal, setEditModal] = useState<'dietary' | 'avoidances' | 'cook' | 'grocery' | 'language' | null>(null)

  // Editable state
  const [dietary, setDietary] = useState<string[]>(preferences.dietaryPreferences)
  const [avoidances, setAvoidances] = useState<string[]>(preferences.avoidances)
  const [hasCook, setHasCook] = useState(preferences.hasCook)
  const [cookName, setCookName] = useState(preferences.cookName)
  const [cookPhone, setCookPhone] = useState(preferences.cookPhone)
  const [groceryApp, setGroceryApp] = useState(preferences.preferredGroceryApp)
  const [msgLang, setMsgLang] = useState<'english' | 'hindi' | 'hinglish'>((preferences as any).cookMessageLanguage || 'hinglish')

  const toggleDark = () => setPreferences({ darkMode: !preferences.darkMode })

  const toggle = (arr: string[], item: string, setter: (v: string[]) => void) =>
    setter(arr.includes(item) ? arr.filter((d) => d !== item) : [...arr, item])

  const saveModal = () => {
    if (editModal === 'dietary') setPreferences({ dietaryPreferences: dietary })
    if (editModal === 'avoidances') setPreferences({ avoidances })
    if (editModal === 'cook') setPreferences({ hasCook, cookName, cookPhone })
    if (editModal === 'grocery') setPreferences({ preferredGroceryApp: groceryApp })
    if (editModal === 'language') setPreferences({ cookMessageLanguage: msgLang } as any)
    setEditModal(null)
  }

  const handleSignOut = () => {
    signOut()
    navigate('/onboarding', { replace: true })
  }

  const groceryAppName = preferences.preferredGroceryApp
    ? preferences.preferredGroceryApp.charAt(0).toUpperCase() + preferences.preferredGroceryApp.slice(1)
    : 'Not set'
  const lightColors = {
    accent: '#4A1F23',
    accentLight: 'rgba(74, 31, 35, 0.06)',
    accentBorder: 'rgba(74, 31, 35, 0.22)',
    accentText: '#4A1F23',
    surface: '#F5F3F1',
    pageSurface: '#F5F3F1',
    card: '#FBFAF8',
    border: '#E7E3DF',
    elevated: '#EDE9E4',
    textPrimary: '#1C1C1C',
    textSecondary: '#6F6B66',
    textTertiary: '#6F6B66',
  }
  const darkColors = {
    accent: '#9A4D5A',
    accentLight: 'rgba(154, 77, 90, 0.18)',
    accentBorder: '#6A2B34',
    surface: '#121212',
    pageSurface: '#121212',
    card: '#1B1B1B',
    border: '#2E2E2E',
    elevated: '#111111',
    textPrimary: '#FEFEFE',
    textSecondary: '#D6D1D3',
    textTertiary: '#A9A0A3',
    accentText: '#F0C7CF',
  }
  const colors = preferences.darkMode ? darkColors : lightColors

  return (
    <div className="min-h-screen pb-24" style={{ background: colors.pageSurface }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-6">
        <div className="flex items-center gap-4">
          {preferences.profileImage ? (
            <img src={preferences.profileImage} alt="" style={{ width: 56, height: 56, borderRadius: 28, objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: 56, height: 56, borderRadius: 28,
              background: preferences.darkMode ? colors.accentLight : colors.accentLight,
              border: preferences.darkMode ? `1px solid ${colors.accentBorder}` : `1px solid ${colors.border}`,
              boxShadow: preferences.darkMode ? '0 6px 18px rgba(0,0,0,0.18)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: 700, color: colors.accentText,
            }}>
              {(preferences.name || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: colors.textPrimary, margin: 0, letterSpacing: '-0.02em' }}>
              {preferences.name || 'User'}
            </h1>
            {preferences.email && (
              <p style={{ fontSize: '13px', color: colors.textTertiary, margin: '2px 0 0 0' }}>
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
                {preferences.darkMode ? <Moon size={18} style={{ color: colors.accentText }} /> : <Sun size={18} style={{ color: colors.textTertiary }} />}
                <span style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary }}>Dark mode</span>
              </div>
              <div style={{
                width: 44, height: 26, borderRadius: 13, padding: 3,
                background: preferences.darkMode ? colors.accent : '#ECE8E4',
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
              style={{ borderBottom: `1px solid ${colors.border}` }}>
              <div className="flex items-center gap-3">
                <Utensils size={18} style={{ color: colors.textTertiary }} />
                <div className="text-left">
                  <span style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary, display: 'block' }}>Dietary style</span>
                  <span style={{ fontSize: '12px', color: colors.textTertiary }}>
                    {preferences.dietaryPreferences.length > 0 ? preferences.dietaryPreferences.join(', ') : 'Not set'}
                  </span>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: colors.textTertiary }} />
            </button>
            <button onClick={() => { setAvoidances(preferences.avoidances); setEditModal('avoidances') }}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-transparent border-none cursor-pointer">
              <div className="flex items-center gap-3">
                <span style={{ fontSize: '18px' }}>🚫</span>
                <div className="text-left">
                  <span style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary, display: 'block' }}>Avoidances</span>
                  <span style={{ fontSize: '12px', color: colors.textTertiary }}>
                    {preferences.avoidances.length > 0 ? preferences.avoidances.join(', ') : 'None'}
                  </span>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: colors.textTertiary }} />
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
                <ChefHat size={18} style={{ color: colors.textTertiary }} />
                <div className="text-left">
                  <span style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary, display: 'block' }}>
                    {preferences.hasCook ? preferences.cookName || 'Cook' : 'No cook'}
                  </span>
                  <span style={{ fontSize: '12px', color: colors.textTertiary }}>
                    {preferences.hasCook && preferences.cookPhone ? `+91 ${preferences.cookPhone}` : 'Tap to edit'}
                  </span>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: colors.textTertiary }} />
            </button>
          </div>
        </div>

        {/* Meal Group */}
        <div className="mb-6">
          <p className="section-label" style={{ margin: '0 0 10px 0' }}>Meal group</p>
          <div className="card">
            <button onClick={() => navigate('/group')}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-transparent border-none cursor-pointer">
              <div className="flex items-center gap-3">
                <Users size={18} style={{ color: colors.textTertiary }} />
                <div className="text-left">
                  <span style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary, display: 'block' }}>
                    {preferences.groupEnabled ? preferences.groupName || 'Home food circle' : 'No group'}
                  </span>
                  <span style={{ fontSize: '12px', color: colors.textTertiary }}>
                    {preferences.groupEnabled ? `${groupMembers.length || 1} member${(groupMembers.length || 1) === 1 ? '' : 's'}` : 'Create a shared recipe circle'}
                  </span>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: colors.textTertiary }} />
            </button>
          </div>
        </div>

        {/* Message Language — E: moved from Home screen */}
        <div className="mb-6">
          <p className="section-label" style={{ margin: '0 0 10px 0' }}>Message language</p>
          <div className="card">
            <button onClick={() => { setMsgLang((preferences as any).cookMessageLanguage || 'hinglish'); setEditModal('language') }}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-transparent border-none cursor-pointer">
              <div className="flex items-center gap-3">
                <Globe size={18} style={{ color: colors.textTertiary }} />
                <div className="text-left">
                  <span style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary, display: 'block' }}>Cook message language</span>
                  <span style={{ fontSize: '12px', color: colors.textTertiary }}>
                    {LANGUAGE_LABELS[(preferences.cookMessageLanguage || 'hinglish') as 'english' | 'hindi' | 'hinglish']}
                  </span>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: colors.textTertiary }} />
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
                <ShoppingCart size={18} style={{ color: colors.textTertiary }} />
                <div className="text-left">
                  <span style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary, display: 'block' }}>Preferred app</span>
                  <span style={{ fontSize: '12px', color: colors.textTertiary }}>{groceryAppName}</span>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: colors.textTertiary }} />
            </button>
          </div>
        </div>

        {/* Sign Out */}
        <button onClick={handleSignOut}
          className="flex items-center gap-1 bg-transparent border cursor-pointer px-4 py-2 rounded-full mb-8"
          style={{ color: preferences.darkMode ? colors.accentText : colors.accent, borderColor: colors.border, fontSize: '13px', fontWeight: 600 }}>
          <LogOut size={16} /> Sign out
        </button>
      </div>

      {/* ===== EDIT MODALS ===== */}
      {editModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-5"
          onClick={() => setEditModal(null)}>
          <div className="w-full max-w-sm rounded-3xl p-6 max-h-[80vh] overflow-y-auto"
            style={{ background: colors.card }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: colors.textPrimary }}>
                {editModal === 'dietary' && 'Dietary style'}
                {editModal === 'avoidances' && 'Avoidances'}
                {editModal === 'cook' && 'Cook details'}
                {editModal === 'language' && 'Message language'}
                {editModal === 'grocery' && 'Grocery app'}
              </h3>
              <button onClick={() => setEditModal(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer"
                style={{ background: colors.elevated, color: colors.textSecondary }}>
                <X size={16} />
              </button>
            </div>

            {editModal === 'dietary' && (
              <div className="space-y-2.5">
                {DIETARY_OPTIONS.map((opt) => {
                  const sel = dietary.includes(opt.label)
                  return (
                    <button key={opt.label} onClick={() => toggle(dietary, opt.label, setDietary)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer transition-smooth"
                      style={{
                        background: sel ? 'rgba(74, 31, 35, 0.06)' : '#FFFFFF',
                        border: sel ? '1.5px solid rgba(74, 31, 35, 0.22)' : `1px solid ${colors.border}`,
                      }}>
                      <span style={{ fontSize: '22px', lineHeight: 1, flexShrink: 0 }}>{opt.emoji}</span>
                      <span className="flex-1 text-left" style={{ fontSize: '14px', fontWeight: 600, color: sel ? (preferences.darkMode ? colors.accentText : colors.accent) : colors.textPrimary }}>{opt.label}</span>
                      {sel && <Check size={16} style={{ color: colors.accent }} />}
                    </button>
                  )
                })}
              </div>
            )}

            {editModal === 'avoidances' && (
              <div className="space-y-2.5">
                {AVOID_OPTIONS.map((opt) => {
                  const sel = avoidances.includes(opt.label)
                  return (
                    <button key={opt.label} onClick={() => toggle(avoidances, opt.label, setAvoidances)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer transition-smooth"
                      style={{
                        background: sel ? 'rgba(74, 31, 35, 0.06)' : '#FFFFFF',
                        border: sel ? '1.5px solid rgba(74, 31, 35, 0.22)' : `1px solid ${colors.border}`,
                      }}>
                      <span style={{ fontSize: '22px', lineHeight: 1, flexShrink: 0 }}>{opt.emoji}</span>
                      <span className="flex-1 text-left" style={{ fontSize: '14px', fontWeight: 600, color: sel ? (preferences.darkMode ? colors.accentText : colors.accent) : colors.textPrimary }}>{opt.label}</span>
                      {sel && <Check size={16} style={{ color: colors.accent }} />}
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
                        background: hasCook === val ? colors.accent : colors.card,
                        borderColor: hasCook === val ? colors.accent : colors.border, borderWidth: '1.5px',
                        color: hasCook === val ? '#FFF' : colors.textPrimary, fontSize: '14px', fontWeight: 600,
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
                        style={{ width: '100%', padding: '12px 16px', borderRadius: 14, border: `1.5px solid ${colors.border}`, fontSize: '15px', outline: 'none', background: colors.elevated, color: colors.textPrimary }}
                        onFocus={(e) => e.target.style.borderColor = colors.accentBorder} onBlur={(e) => e.target.style.borderColor = colors.border} />
                    </div>
                    <div>
                      <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>WhatsApp number</label>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-3 rounded-xl" style={{ background: colors.elevated, border: `1px solid ${colors.border}` }}>
                          <Send size={14} style={{ color: '#25D366' }} />
                          <span style={{ fontSize: '14px', color: colors.textSecondary }}>+91</span>
                        </div>
                        <input type="tel" value={cookPhone} onChange={(e) => setCookPhone(e.target.value)} placeholder="9876543210"
                          style={{ flex: 1, padding: '12px 16px', borderRadius: 14, border: `1.5px solid ${colors.border}`, fontSize: '15px', outline: 'none', background: colors.elevated, color: colors.textPrimary }}
                          onFocus={(e) => e.target.style.borderColor = colors.accentBorder} onBlur={(e) => e.target.style.borderColor = colors.border} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {editModal === 'language' && (
              <div className="space-y-2.5">
                {([
                  { id: 'english' as const, label: 'English', desc: 'Today\'s Meal Plan — Breakfast, Lunch, Dinner' },
                  { id: 'hindi' as const, label: 'Hindi', desc: 'Aaj ka Khana — Nashta, Dopahar ka khana, Raat ka khana' },
                  { id: 'hinglish' as const, label: 'Hinglish', desc: 'Aaj ka Meal Plan — Breakfast, Lunch, Dinner' },
                ]).map((opt) => {
                  const sel = msgLang === opt.id
                  return (
                    <button key={opt.id} onClick={() => setMsgLang(opt.id)}
                      className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border cursor-pointer transition-smooth"
                      style={{ background: sel ? colors.accentLight : colors.card, borderColor: sel ? colors.accentBorder : colors.border, borderWidth: '1.5px' }}>
                      <div className="text-left">
                        <span style={{ fontSize: '14px', fontWeight: 600, color: sel ? (preferences.darkMode ? colors.accentText : colors.accent) : colors.textPrimary, display: 'block' }}>{opt.label}</span>
                        <span style={{ fontSize: '11px', color: colors.textTertiary, display: 'block', marginTop: 2 }}>{opt.desc}</span>
                      </div>
                      {sel && <Check size={16} style={{ color: colors.accent, flexShrink: 0 }} />}
                    </button>
                  )
                })}
              </div>
            )}

            {editModal === 'grocery' && (
              <div className="space-y-2.5">
                {GROCERY_APPS.map((app) => {
                  const sel = groceryApp === app.id
                  return (
                    <button key={app.id} onClick={() => setGroceryApp(app.id)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer transition-smooth"
                      style={{
                        background: sel ? 'rgba(74, 31, 35, 0.06)' : '#FFFFFF',
                        border: sel ? '1.5px solid rgba(74, 31, 35, 0.22)' : `1px solid ${colors.border}`,
                      }}>
                      <span style={{ fontSize: '22px', lineHeight: 1, flexShrink: 0 }}>{app.emoji}</span>
                      <span className="flex-1 text-left" style={{ fontSize: '14px', fontWeight: 600, color: sel ? (preferences.darkMode ? colors.accentText : colors.accent) : colors.textPrimary }}>{app.name}</span>
                      {sel && <Check size={16} style={{ color: colors.accent }} />}
                    </button>
                  )
                })}
              </div>
            )}

            <button onClick={saveModal}
              className="w-full border-none cursor-pointer mt-5"
              style={{ height: 46, borderRadius: 18, background: colors.accent, color: '#FFF', fontSize: '14px', fontWeight: 600 }}>
              Save
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
