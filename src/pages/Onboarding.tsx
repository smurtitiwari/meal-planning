import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { supabase, signInWithGoogle } from '../lib/supabase'
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

  // ── Email magic link state ──────────────────────────────────
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailError, setEmailError] = useState('')

  const toggle = (arr: string[], item: string, setter: (v: string[]) => void) =>
    setter(arr.includes(item) ? arr.filter((d) => d !== item) : [...arr, item])

  const handleSendMagicLink = async () => {
    const cleaned = email.trim().toLowerCase()
    if (!cleaned || !cleaned.includes('@')) {
      setEmailError('Enter a valid email address')
      return
    }
    setEmailLoading(true)
    setEmailError('')
    const { error } = await supabase.auth.signInWithOtp({
      email: cleaned,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setEmailLoading(false)
    if (error) {
      setEmailError(error.message)
    } else {
      setEmailSent(true)
    }
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

            {/* Google sign-in */}
            <button
              onClick={() => signInWithGoogle()}
              style={{
                width: '100%', height: 46,
                background: '#FFF', border: `1px solid ${T.border}`, borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                cursor: 'pointer', marginBottom: 16,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span style={{ fontSize: '15px', fontWeight: 600, color: T.textPrimary }}>
                Continue with Google
              </span>
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: T.border }} />
              <span style={{ fontSize: '12px', color: T.textSecondary }}>or</span>
              <div style={{ flex: 1, height: 1, background: T.border }} />
            </div>

            {/* Email magic link */}
            {!emailSent ? (
              <>
                <input
                  type="email"
                  inputMode="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%', height: 46, padding: '0 14px',
                    border: `1px solid ${T.border}`, borderRadius: 14,
                    background: T.card, fontSize: '15px', color: T.textPrimary,
                    outline: 'none', marginBottom: 10, boxSizing: 'border-box',
                  }}
                />
                <button
                  onClick={handleSendMagicLink}
                  disabled={emailLoading}
                  style={{
                    width: '100%', height: 46,
                    background: T.accent, border: 'none', borderRadius: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    cursor: emailLoading ? 'not-allowed' : 'pointer',
                    opacity: emailLoading ? 0.7 : 1,
                    marginBottom: 10,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#FFF' }}>
                    {emailLoading ? 'Sending…' : 'Send Magic Link'}
                  </span>
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: '36px', marginBottom: 12 }}>📬</div>
                <p style={{ fontSize: '15px', fontWeight: 600, color: T.textPrimary, margin: '0 0 8px 0' }}>
                  Check your inbox!
                </p>
                <p style={{ fontSize: '13px', color: T.textSecondary, lineHeight: 1.55, margin: '0 0 16px 0' }}>
                  We sent a magic link to <strong>{email}</strong>.<br />
                  Click it to sign in — no password needed.
                </p>
                <button
                  onClick={() => { setEmailSent(false); setEmail(''); setEmailError('') }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <span style={{ fontSize: '13px', color: T.textSecondary }}>Use a different email</span>
                </button>
              </div>
            )}

            {emailError && (
              <p style={{ fontSize: '12px', color: '#C62828', margin: '4px 0 0 0', textAlign: 'center' }}>
                {emailError}
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
