import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Check } from 'lucide-react'

const DIETARY_OPTIONS = [
  { label: 'Vegetarian', emoji: '🥬' },
  { label: 'Non-Vegetarian', emoji: '🍗' },
  { label: 'Eggetarian', emoji: '🥚' },
  { label: 'Vegan', emoji: '🌱' },
]

const AVOID_OPTIONS = [
  { label: 'Dairy', emoji: '🥛' },
  { label: 'Gluten', emoji: '🌾' },
  { label: 'Nuts', emoji: '🥜' },
  { label: 'Spicy food', emoji: '🌶️' },
  { label: 'Onion & Garlic', emoji: '🧅' },
  { label: 'Seafood', emoji: '🦐' },
]

const MEAL_OPTIONS = [
  { val: 2, label: '2 meals', desc: 'Lunch & Dinner', emoji: '🍽️' },
  { val: 3, label: '3 meals', desc: 'Breakfast, Lunch & Dinner', emoji: '🍳' },
  { val: 4, label: '4 meals', desc: 'Includes a snack', emoji: '🥗' },
]

const GROCERY_APPS = [
  { id: 'blinkit', name: 'Blinkit', emoji: '⚡', color: '#F8CE46' },
  { id: 'zepto', name: 'Zepto', emoji: '🟣', color: '#7B2D8E' },
  { id: 'swiggy', name: 'Swiggy Instamart', emoji: '🧡', color: '#FC8019' },
  { id: 'bigbasket', name: 'BigBasket', emoji: '🟢', color: '#84C225' },
  { id: 'dunzo', name: 'Dunzo Daily', emoji: '📦', color: '#00D290' },
]

const TOTAL_STEPS = 7
const serifStyle = { fontFamily: "'DM Serif Display', Georgia, serif" }

/* Design tokens */
const T = {
  bg: '#F7F4EF',
  card: '#FFFFFF',
  secondary: '#F2EEE9',
  border: '#E6E0D8',
  accent: '#4A1F23',
  selBg: 'rgba(74, 31, 35, 0.06)',
  selBorder: 'rgba(74, 31, 35, 0.22)',
  textPrimary: '#1C1B1F',
  textSecondary: '#6F6B73',
  disabled: '#BDB7C3',
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { setPreferences, createGroup, completeOnboarding, initWeeklyPlan } = useStore()
  const [step, setStep] = useState(0)
  const [dietary, setDietary] = useState<string[]>([])
  const [avoidances, setAvoidances] = useState<string[]>([])
  const [mealCount, setMealCount] = useState(3)
  const [hasCook, setHasCook] = useState<boolean | null>(null)
  const [cookName, setCookName] = useState('')
  const [cookPhone, setCookPhone] = useState('')
  const [groupEnabled, setGroupEnabled] = useState(false)
  const [groupName, setGroupName] = useState('Flat 503 Kitchen')
  const [groupCookName, setGroupCookName] = useState('')
  const [groceryApps, setGroceryApps] = useState<string[]>([])

  // ── WhatsApp OTP state ──────────────────────────────────────
  const [phone, setPhone] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState('')

  const toggle = (arr: string[], item: string, setter: (v: string[]) => void) =>
    setter(arr.includes(item) ? arr.filter((d) => d !== item) : [...arr, item])

  const handleSendOtp = async () => {
    const cleaned = phone.replace(/\s/g, '')
    if (!cleaned || cleaned.length < 10) {
      setOtpError('Enter a valid phone number')
      return
    }
    setOtpLoading(true)
    setOtpError('')
    const full = cleaned.startsWith('+') ? cleaned : `+91${cleaned}`
    const { error } = await supabase.auth.signInWithOtp({ phone: full })
    setOtpLoading(false)
    if (error) {
      setOtpError(error.message)
    } else {
      setOtpSent(true)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 4) {
      setOtpError('Enter the OTP you received')
      return
    }
    setOtpLoading(true)
    setOtpError('')
    const full = phone.startsWith('+') ? phone : `+91${phone.replace(/\s/g, '')}`
    const { error } = await supabase.auth.verifyOtp({
      phone: full,
      token: otpCode,
      type: 'sms',
    })
    setOtpLoading(false)
    if (error) {
      setOtpError(error.message)
    }
    // On success, App.tsx auth listener fires → loadUserData → skips step 0 automatically
  }

  // If user already has a session (returned from OAuth), skip step 0
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const prefs = useStore.getState().preferences
        if (prefs.onboardingComplete) {
          navigate('/home', { replace: true })
        } else {
          setStep(1)
        }
      }
    })
  }, [navigate])

  const handleFinish = () => {
    setPreferences({
      dietaryPreferences: dietary,
      avoidances,
      mealCount,
      hasCook: hasCook ?? false,
      cookName,
      cookPhone,
      preferredGroceryApp: groceryApps[0] as any || '',
      preferredGroceryApps: groceryApps,
    })
    if (groupEnabled) createGroup(groupName, groupCookName)
    completeOnboarding()
    initWeeklyPlan()
    navigate('/home', { replace: true })
  }

  const canProceed = () => {
    if (step === 0) return false
    if (step === 1) return dietary.length > 0
    if (step === 4) {
      if (hasCook === null) return false
      if (hasCook === true) return cookName.trim().length > 0 && cookPhone.trim().length >= 10
      return true
    }
    if (step === 5 && groupEnabled) return groupName.trim().length > 0
    return true
  }

  /* ─── Reusable list card ─── */
  const ListCard = ({
    emoji, label, desc, selected, onClick, trailing,
  }: {
    emoji: string; label: string; desc?: string; selected: boolean
    onClick: () => void; trailing?: React.ReactNode
  }) => (
    <button onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl cursor-pointer transition-smooth"
      style={{
        background: selected ? T.selBg : T.card,
        border: selected ? `1.5px solid ${T.selBorder}` : `1px solid ${T.border}`,
      }}>
      <span style={{ fontSize: '26px', lineHeight: 1, flexShrink: 0 }}>{emoji}</span>
      <div className="flex-1 text-left">
        <span style={{ fontSize: '15px', fontWeight: 600, color: selected ? T.accent : T.textPrimary, display: 'block' }}>
          {label}
        </span>
        {desc && (
          <span style={{ fontSize: '12px', color: T.textSecondary, marginTop: 2, display: 'block' }}>{desc}</span>
        )}
      </div>
      {trailing || (selected && (
        <div style={{
          width: 22, height: 22, borderRadius: 11,
          background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Check size={13} color="#FFF" />
        </div>
      ))}
    </button>
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ background: T.bg }}>

      {/* ========= STEP 0: Sign-In ========= */}
      {step === 0 && (
        <div className="flex-1 flex flex-col px-6" style={{ paddingTop: 60, paddingBottom: 40 }}>
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: '13px', color: T.textSecondary, fontWeight: 500, margin: '0 0 10px 0', letterSpacing: '0.01em' }}>
              Meal plans, sorted ✨
            </p>
            <h1 style={{ ...serifStyle, fontSize: '34px', fontWeight: 400, color: T.textPrimary, lineHeight: 1.2, margin: '0 0 32px 0' }}>
              No more "aaj kya<br />banega?" 🍲
            </h1>
          </div>

          <div style={{
            background: T.card, borderRadius: 24,
            padding: '28px 24px',
            border: `1px solid ${T.border}`,
            marginBottom: 'auto',
          }}>
            <h2 style={{ ...serifStyle, fontSize: '22px', fontWeight: 400, color: T.textPrimary, margin: '0 0 6px 0' }}>
              Let's sort your meals
            </h2>
            <p style={{ fontSize: '13px', color: T.textSecondary, lineHeight: 1.55, margin: '0 0 22px 0' }}>
              Plan your week, share meals with your cook, and order groceries in minutes.
            </p>

            {/* WhatsApp OTP */}
            {!otpSent ? (
              <>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  {/* Country code */}
                  <div style={{
                    height: 46, padding: '0 12px',
                    border: `1px solid ${T.border}`, borderRadius: 14,
                    background: T.secondary,
                    display: 'flex', alignItems: 'center', gap: 6,
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: '16px' }}>🇮🇳</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: T.textPrimary }}>+91</span>
                  </div>
                  {/* Phone input */}
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="WhatsApp number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d\s]/g, ''))}
                    maxLength={12}
                    style={{
                      flex: 1, height: 46, padding: '0 14px',
                      border: `1px solid ${T.border}`, borderRadius: 14,
                      background: T.card, fontSize: '15px', color: T.textPrimary,
                      outline: 'none',
                    }}
                  />
                </div>
                <button
                  onClick={handleSendOtp}
                  disabled={otpLoading}
                  style={{
                    width: '100%', height: 46,
                    background: '#25D366', border: 'none', borderRadius: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    cursor: otpLoading ? 'not-allowed' : 'pointer',
                    opacity: otpLoading ? 0.7 : 1,
                    marginBottom: 10,
                  }}
                >
                  {/* WhatsApp icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#FFF' }}>
                    {otpLoading ? 'Sending…' : 'Send OTP on WhatsApp'}
                  </span>
                </button>
              </>
            ) : (
              <>
                <p style={{ fontSize: '13px', color: T.textSecondary, margin: '0 0 10px 0', textAlign: 'center' }}>
                  OTP sent to <strong>+91 {phone}</strong> on WhatsApp
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 6-digit OTP"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={{
                    width: '100%', height: 46, padding: '0 14px',
                    border: `1.5px solid ${T.accent}`, borderRadius: 14,
                    background: T.card, fontSize: '18px', color: T.textPrimary,
                    outline: 'none', letterSpacing: '0.2em', textAlign: 'center',
                    marginBottom: 10, boxSizing: 'border-box',
                  }}
                />
                <button
                  onClick={handleVerifyOtp}
                  disabled={otpLoading}
                  style={{
                    width: '100%', height: 46,
                    background: T.accent, border: 'none', borderRadius: 14,
                    cursor: otpLoading ? 'not-allowed' : 'pointer',
                    opacity: otpLoading ? 0.7 : 1,
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#FFF' }}>
                    {otpLoading ? 'Verifying…' : 'Verify OTP'}
                  </span>
                </button>
                <button
                  onClick={() => { setOtpSent(false); setOtpCode(''); setOtpError('') }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', marginBottom: 6 }}
                >
                  <span style={{ fontSize: '13px', color: T.textSecondary }}>Change number</span>
                </button>
              </>
            )}

            {otpError && (
              <p style={{ fontSize: '12px', color: '#C62828', margin: '4px 0 0 0', textAlign: 'center' }}>
                {otpError}
              </p>
            )}

            <p style={{ fontSize: '11px', color: T.textSecondary, textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
              By continuing, you agree to our Terms & Privacy Policy
            </p>
          </div>
        </div>
      )}

      {/* ========= STEPS 1-6 ========= */}
      {step > 0 && (
        <>
          {/* Progress bar */}
          <div className="px-6 pt-14 pb-2">
            <div className="flex gap-1.5 mb-6">
              {Array.from({ length: TOTAL_STEPS - 1 }).map((_, i) => (
                <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{
                  background: i < step ? T.accent : T.border,
                }} />
              ))}
            </div>
          </div>

          <div className="flex-1 px-6 pb-32 overflow-y-auto">
            {/* STEP 1: Dietary */}
            {step === 1 && (
              <div>
                <h1 style={{ ...serifStyle, fontSize: '28px', fontWeight: 400, color: T.textPrimary, lineHeight: 1.2, margin: '0 0 8px 0' }}>
                  What's your food style?
                </h1>
                <p style={{ fontSize: '14px', color: T.textSecondary, lineHeight: 1.55, margin: '0 0 24px 0' }}>
                  Pick all that match. We'll use this to suggest recipes you'll love.
                </p>
                <div className="space-y-2.5">
                  {DIETARY_OPTIONS.map((opt) => (
                    <ListCard
                      key={opt.label}
                      emoji={opt.emoji}
                      label={opt.label}
                      selected={dietary.includes(opt.label)}
                      onClick={() => toggle(dietary, opt.label, setDietary)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Avoidances */}
            {step === 2 && (
              <div>
                <h1 style={{ ...serifStyle, fontSize: '28px', fontWeight: 400, color: T.textPrimary, lineHeight: 1.2, margin: '0 0 8px 0' }}>
                  Anything you'd rather skip?
                </h1>
                <p style={{ fontSize: '14px', color: T.textSecondary, lineHeight: 1.55, margin: '0 0 24px 0' }}>
                  We'll keep these out of your meal plans. Select none if you eat everything.
                </p>
                <div className="space-y-2.5">
                  {AVOID_OPTIONS.map((opt) => (
                    <ListCard
                      key={opt.label}
                      emoji={opt.emoji}
                      label={opt.label}
                      selected={avoidances.includes(opt.label)}
                      onClick={() => toggle(avoidances, opt.label, setAvoidances)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Meal Count */}
            {step === 3 && (
              <div>
                <h1 style={{ ...serifStyle, fontSize: '28px', fontWeight: 400, color: T.textPrimary, lineHeight: 1.2, margin: '0 0 8px 0' }}>
                  How many meals a day?
                </h1>
                <p style={{ fontSize: '14px', color: T.textSecondary, lineHeight: 1.55, margin: '0 0 24px 0' }}>
                  We'll plan your week around this. You can always change it later.
                </p>
                <div className="space-y-2.5">
                  {MEAL_OPTIONS.map((opt) => (
                    <ListCard
                      key={opt.val}
                      emoji={opt.emoji}
                      label={opt.label}
                      desc={opt.desc}
                      selected={mealCount === opt.val}
                      onClick={() => setMealCount(opt.val)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: Cook Details */}
            {step === 4 && (
              <div>
                <h1 style={{ ...serifStyle, fontSize: '28px', fontWeight: 400, color: T.textPrimary, lineHeight: 1.2, margin: '0 0 8px 0' }}>
                  Do you have a cook at home?
                </h1>
                <p style={{ fontSize: '14px', color: T.textSecondary, lineHeight: 1.55, margin: '0 0 24px 0' }}>
                  We'll send your meal plan straight to them on WhatsApp.
                </p>
                <div className="flex gap-3 mb-5">
                  <button onClick={() => setHasCook(true)}
                    className="flex-1 flex flex-col items-center gap-2 py-6 rounded-2xl cursor-pointer transition-smooth"
                    style={{
                      background: hasCook === true ? T.selBg : T.card,
                      border: hasCook === true ? `1.5px solid ${T.selBorder}` : `1px solid ${T.border}`,
                    }}>
                    <span style={{ fontSize: '30px', lineHeight: 1 }}>👨‍🍳</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: hasCook === true ? T.accent : T.textPrimary }}>
                      Yes, lifesaver!
                    </span>
                  </button>
                  <button onClick={() => setHasCook(false)}
                    className="flex-1 flex flex-col items-center gap-2 py-6 rounded-2xl cursor-pointer transition-smooth"
                    style={{
                      background: hasCook === false ? T.selBg : T.card,
                      border: hasCook === false ? `1.5px solid ${T.selBorder}` : `1px solid ${T.border}`,
                    }}>
                    <span style={{ fontSize: '30px', lineHeight: 1 }}>🧑‍🍳</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: hasCook === false ? T.accent : T.textPrimary }}>
                      I cook myself
                    </span>
                  </button>
                </div>

                {hasCook === true && (
                  <div style={{
                    background: T.card, borderRadius: 20, padding: '20px 18px',
                    border: `1px solid ${T.border}`,
                  }}>
                    <p style={{ fontSize: '13px', color: T.textSecondary, margin: '0 0 16px 0' }}>
                      Great! Add their details so we can send meal plans via WhatsApp.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: T.textSecondary, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Cook's name <span style={{ color: '#D9534F' }}>*</span>
                        </label>
                        <input type="text" value={cookName} onChange={(e) => setCookName(e.target.value)}
                          placeholder="What do you call them?"
                          style={{
                            width: '100%', padding: '11px 14px', borderRadius: 12,
                            border: `1.5px solid ${cookName.trim() === '' ? T.border : T.accent}`,
                            background: T.bg, fontSize: '14px', outline: 'none',
                            fontFamily: 'inherit', color: T.textPrimary,
                          }}
                          onFocus={(e) => e.target.style.borderColor = T.accent}
                          onBlur={(e) => e.target.style.borderColor = cookName.trim() ? T.accent : T.border} />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: T.textSecondary, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Their WhatsApp number <span style={{ color: '#D9534F' }}>*</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center px-3 py-3 rounded-xl" style={{ background: T.secondary, border: `1px solid ${T.border}` }}>
                            <span style={{ fontSize: '13px', color: T.textSecondary, fontWeight: 500 }}>+91</span>
                          </div>
                          <input type="tel" value={cookPhone} onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                            setCookPhone(val)
                          }} placeholder="9876543210"
                            maxLength={10}
                            style={{
                              flex: 1, padding: '11px 14px', borderRadius: 12,
                              border: `1.5px solid ${cookPhone.trim().length >= 10 ? T.accent : T.border}`,
                              background: T.bg, fontSize: '14px', outline: 'none',
                              fontFamily: 'inherit', color: T.textPrimary,
                            }}
                            onFocus={(e) => e.target.style.borderColor = T.accent}
                            onBlur={(e) => e.target.style.borderColor = cookPhone.trim().length >= 10 ? T.accent : T.border} />
                        </div>
                        <p style={{ fontSize: '11px', color: T.textSecondary, margin: '6px 0 0 0', lineHeight: 1.4 }}>
                          {cookPhone.trim().length > 0 && cookPhone.trim().length < 10
                            ? `Enter ${10 - cookPhone.trim().length} more digit${10 - cookPhone.trim().length > 1 ? 's' : ''} — `
                            : ''}
                          We'll open WhatsApp on your phone — never send messages ourselves.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: Group */}
            {step === 5 && (
              <div>
                <h1 style={{ ...serifStyle, fontSize: '28px', fontWeight: 400, color: T.textPrimary, lineHeight: 1.2, margin: '0 0 8px 0' }}>
                  Use alone or with group?
                </h1>
                <p style={{ fontSize: '14px', color: T.textSecondary, lineHeight: 1.55, margin: '0 0 24px 0' }}>
                  Keep setup light now. You can invite friends after onboarding.
                </p>

                <div className="flex gap-3 mb-5">
                  <button onClick={() => setGroupEnabled(true)}
                    className="flex-1 flex flex-col items-start gap-3 rounded-2xl cursor-pointer transition-smooth text-left"
                    style={{
                      minHeight: 136,
                      padding: '16px 14px',
                      background: groupEnabled ? T.selBg : T.card,
                      border: groupEnabled ? `1.5px solid ${T.selBorder}` : `1px solid ${T.border}`,
                    }}>
                    <div className="flex items-center justify-between w-full">
                      <span style={{ fontSize: 30, lineHeight: 1 }}>👥</span>
                      {groupEnabled && (
                        <span style={{ width: 22, height: 22, borderRadius: 11, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={12} color="#FFFFFF" />
                        </span>
                      )}
                    </div>
                    <div>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: groupEnabled ? T.accent : T.textPrimary, display: 'block' }}>
                        Group
                      </span>
                      <span style={{ fontSize: '12px', lineHeight: 1.35, color: T.textSecondary, display: 'block', marginTop: 4 }}>
                        Shared recipes with flatmates or family.
                      </span>
                    </div>
                  </button>
                  <button onClick={() => setGroupEnabled(false)}
                    className="flex-1 flex flex-col items-start gap-3 rounded-2xl cursor-pointer transition-smooth text-left"
                    style={{
                      minHeight: 136,
                      padding: '16px 14px',
                      background: !groupEnabled ? T.selBg : T.card,
                      border: !groupEnabled ? `1.5px solid ${T.selBorder}` : `1px solid ${T.border}`,
                    }}>
                    <div className="flex items-center justify-between w-full">
                      <span style={{ fontSize: 30, lineHeight: 1 }}>🍽️</span>
                      {!groupEnabled && (
                        <span style={{ width: 22, height: 22, borderRadius: 11, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={12} color="#FFFFFF" />
                        </span>
                      )}
                    </div>
                    <div>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: !groupEnabled ? T.accent : T.textPrimary, display: 'block' }}>
                        Use alone
                      </span>
                      <span style={{ fontSize: '12px', lineHeight: 1.35, color: T.textSecondary, display: 'block', marginTop: 4 }}>
                        Personal meal planning for now.
                      </span>
                    </div>
                  </button>
                </div>

                {groupEnabled && (
                  <div style={{
                    background: T.card, borderRadius: 20, padding: '20px 18px',
                    border: `1px solid ${T.border}`,
                  }}>
                    <div className="space-y-4">
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: T.textSecondary, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Group name
                        </label>
                        <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)}
                          placeholder="e.g. Flat 503 Kitchen"
                          style={{
                            width: '100%', padding: '11px 14px', borderRadius: 12,
                            border: `1.5px solid ${groupName.trim() ? T.accent : T.border}`,
                            background: T.bg, fontSize: '14px', outline: 'none',
                            fontFamily: 'inherit', color: T.textPrimary,
                          }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: T.textSecondary, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Cook name (optional)
                        </label>
                        <input type="text" value={groupCookName} onChange={(e) => setGroupCookName(e.target.value)}
                          placeholder={cookName || 'e.g. Ramu bhaiya'}
                          style={{
                            width: '100%', padding: '11px 14px', borderRadius: 12,
                            border: `1px solid ${T.border}`, background: T.bg, fontSize: '14px',
                            outline: 'none', fontFamily: 'inherit', color: T.textPrimary,
                          }} />
                        <p style={{ fontSize: '11px', color: T.textSecondary, margin: '6px 0 0 0', lineHeight: 1.4 }}>
                          Invites happen after setup from the Group tab.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 6: Grocery Apps */}
            {step === 6 && (
              <div>
                <h1 style={{ ...serifStyle, fontSize: '28px', fontWeight: 400, color: T.textPrimary, lineHeight: 1.2, margin: '0 0 8px 0' }}>
                  Where do you order groceries?
                </h1>
                <p style={{ fontSize: '14px', color: T.textSecondary, lineHeight: 1.55, margin: '0 0 24px 0' }}>
                  Pick all the apps you use. We'll link them from your meal plan for quick ordering.
                </p>
                <div className="space-y-2.5">
                  {GROCERY_APPS.map((app) => {
                    const sel = groceryApps.includes(app.id)
                    return (
                      <button key={app.id} onClick={() => toggle(groceryApps, app.id, setGroceryApps)}
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl cursor-pointer transition-smooth"
                        style={{
                          background: sel ? T.selBg : T.card,
                          border: sel ? `1.5px solid ${T.selBorder}` : `1px solid ${T.border}`,
                        }}>
                        <span style={{ fontSize: '26px', lineHeight: 1, flexShrink: 0 }}>{app.emoji}</span>
                        <span className="flex-1 text-left" style={{ fontSize: '15px', fontWeight: 600, color: sel ? T.accent : T.textPrimary }}>
                          {app.name}
                        </span>
                        {sel && (
                          <div style={{
                            width: 22, height: 22, borderRadius: 11,
                            background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <Check size={13} color="#FFF" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bottom CTA bar */}
          <div className="fixed bottom-0 left-0 right-0 px-5 py-4" style={{
            background: 'rgba(247,244,239,0.97)',
            backdropFilter: 'blur(16px)',
            borderTop: `1px solid ${T.border}`,
          }}>
            <div className="max-w-md mx-auto flex gap-3">
              <button onClick={() => setStep(step - 1)}
                className="flex items-center justify-center cursor-pointer transition-smooth"
                style={{
                  width: 46, height: 46, borderRadius: 16, flexShrink: 0,
                  background: T.card, border: `1px solid ${T.border}`,
                }}>
                <ArrowLeft size={17} color={T.textPrimary} />
              </button>
              <button onClick={() => {
                if (step === 2 && avoidances.length === 0) {
                  setStep(step + 1)
                } else if (step < TOTAL_STEPS - 1) {
                  setStep(step + 1)
                } else {
                  handleFinish()
                }
              }}
                disabled={!canProceed() && !(step === 2) && !(step === 6)}
                className="flex-1 font-semibold flex items-center justify-center border-none cursor-pointer transition-smooth"
                style={{
                  height: 46, borderRadius: 18,
                  background: (canProceed() || step === 2 || step === 6) ? T.accent : T.border,
                  color: (canProceed() || step === 2 || step === 6) ? '#FFFFFF' : T.disabled,
                  fontSize: '15px',
                }}>
                {step === 2 && avoidances.length === 0
                  ? 'None'
                  : step === 5 && groupEnabled
                    ? 'Create & continue'
                  : step < TOTAL_STEPS - 1
                    ? 'Continue'
                    : "Let's eat"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
