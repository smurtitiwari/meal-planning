import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { ArrowLeft, Check } from 'lucide-react'

const DIETARY_OPTIONS = [
  { label: 'Vegetarian', emoji: '🥬' },
  { label: 'Non-Vegetarian', emoji: '🍗' },
  { label: 'Eggetarian', emoji: '🥚' },
  { label: 'Vegan', emoji: '🌱' },
  { label: 'High Protein', emoji: '💪' },
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
  { id: 'zepto', name: 'Zepto', emoji: '🟣', color: '##7B2D8E' },
  { id: 'swiggy', name: 'Swiggy Instamart', emoji: '🧡', color: '#FC8019' },
  { id: 'bigbasket', name: 'BigBasket', emoji: '🟢', color: '#84C225' },
  { id: 'dunzo', name: 'Dunzo Daily', emoji: '📦', color: '#00D290' },
]

const TOTAL_STEPS = 6
const serifStyle = { fontFamily: "'DM Serif Display', Georgia, serif" }

export default function Onboarding() {
  const navigate = useNavigate()
  const { setPreferences, completeOnboarding, initWeeklyPlan } = useStore()
  const [step, setStep] = useState(0)
  const [dietary, setDietary] = useState<string[]>([])
  const [avoidances, setAvoidances] = useState<string[]>([])
  const [mealCount, setMealCount] = useState(3)
  const [hasCook, setHasCook] = useState<boolean | null>(null)
  const [cookName, setCookName] = useState('')
  const [cookPhone, setCookPhone] = useState('')
  const [groceryApps, setGroceryApps] = useState<string[]>([])

  const toggle = (arr: string[], item: string, setter: (v: string[]) => void) =>
    setter(arr.includes(item) ? arr.filter((d) => d !== item) : [...arr, item])

  const handleSignIn = () => {
    setPreferences({ name: 'Ayush', email: 'ayush@gmail.com', profileImage: '' })
    setStep(1)
  }

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
    return true
  }

  /* ─── Reusable vertical list card ─── */
  const ListCard = ({
    emoji, label, desc, selected, onClick, trailing,
  }: {
    emoji: string; label: string; desc?: string; selected: boolean
    onClick: () => void; trailing?: React.ReactNode
  }) => (
    <button onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl cursor-pointer transition-smooth"
      style={{
        background: selected ? '#F5EEEA' : '#FFF',
        border: selected ? '2px solid #E8D8D2' : '1.5px solid #EAE4DC',
      }}>
      <span style={{ fontSize: '28px', lineHeight: 1, flexShrink: 0 }}>{emoji}</span>
      <div className="flex-1 text-left">
        <span style={{ fontSize: '15px', fontWeight: 600, color: selected ? '#6B2E3A' : '#1F1E2E', display: 'block' }}>
          {label}
        </span>
        {desc && (
          <span style={{ fontSize: '12px', color: '#A09DAB', marginTop: 2, display: 'block' }}>{desc}</span>
        )}
      </div>
      {trailing || (selected && (
        <div style={{
          width: 24, height: 24, borderRadius: 12,
          background: '#6B2E3A', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Check size={14} color="#FFF" />
        </div>
      ))}
    </button>
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F7F3EE' }}>

      {/* ========= STEP 0: Sign-In ========= */}
      {step === 0 && (
        <div className="flex-1 flex flex-col px-6" style={{ paddingTop: 60, paddingBottom: 40 }}>
          {/* Text at top-center */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: '14px', color: '#A09DAB', fontWeight: 500, margin: '0 0 10px 0' }}>
              Meal plans, sorted ✨
            </p>
            <h1 style={{ ...serifStyle, fontSize: '34px', fontWeight: 400, color: '#1F1E2E', lineHeight: 1.2, margin: '0 0 32px 0' }}>
              No more "aaj kya<br />banega?" 🍲
            </h1>
          </div>

          {/* Card in center */}
          <div style={{
            background: '#F6F6F6', borderRadius: 24,
            padding: '28px 24px',
            boxShadow: '0 4px 24px rgba(31,30,46,0.06)',
            border: '1px solid #EAE4DC',
            marginBottom: 'auto',
          }}>
            <h2 style={{ ...serifStyle, fontSize: '22px', fontWeight: 400, color: '#1F1E2E', margin: '0 0 6px 0' }}>
              Let's sort your meals
            </h2>
            <p style={{ fontSize: '13px', color: '#A09DAB', lineHeight: 1.5, margin: '0 0 22px 0' }}>
              Plan your week, share meals with your cook, and order groceries in minutes.
            </p>

            {/* Continue with Apple */}
            <button onClick={handleSignIn}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl cursor-pointer transition-smooth"
              style={{ background: '#1F1E2E', border: 'none', marginBottom: 10 }}>
              <svg width="17" height="20" viewBox="0 0 17 21" fill="white">
                <path d="M13.34 10.95c-.02-2.16 1.76-3.2 1.84-3.25-1-1.47-2.57-1.67-3.12-1.7-1.33-.13-2.59.78-3.27.78-.67 0-1.72-.76-2.82-.74-1.45.02-2.79.85-3.54 2.15-1.51 2.62-.39 6.51 1.08 8.64.72 1.04 1.58 2.21 2.71 2.17 1.09-.04 1.5-.7 2.81-.7 1.32 0 1.69.7 2.83.68 1.17-.02 1.91-1.06 2.62-2.11.83-1.21 1.17-2.38 1.19-2.44-.03-.01-2.28-.87-2.33-3.48zM11.18 4.36c.6-.72 1-1.73.89-2.73-.86.04-1.9.57-2.52 1.29-.55.64-1.03 1.66-.9 2.64.96.07 1.94-.49 2.53-1.2z"/>
              </svg>
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#FFF' }}>Continue with Apple</span>
            </button>

            {/* Continue with Google */}
            <button onClick={handleSignIn}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl cursor-pointer transition-smooth"
              style={{ background: '#FFF', border: '1.5px solid #EAE4DC', marginBottom: 16 }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#1F1E2E' }}>Continue with Google</span>
            </button>

            <p style={{ fontSize: '11px', color: '#A09DAB', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
              By continuing, you agree to our Terms & Privacy Policy
            </p>
          </div>
        </div>
      )}

      {/* ========= STEPS 1-5 ========= */}
      {step > 0 && (
        <>
          {/* Progress bar */}
          <div className="px-6 pt-14 pb-2">
            <div className="flex gap-1.5 mb-6">
              {Array.from({ length: TOTAL_STEPS - 1 }).map((_, i) => (
                <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{
                  background: i < step ? '#6B2E3A' : '#E0DAD2',
                }} />
              ))}
            </div>
          </div>

          <div className="flex-1 px-6 pb-32 overflow-y-auto">
            {/* STEP 1: Dietary */}
            {step === 1 && (
              <div>
                <h1 style={{ ...serifStyle, fontSize: '28px', fontWeight: 400, color: '#1F1E2E', lineHeight: 1.2, margin: '0 0 8px 0' }}>
                  What's your food style?
                </h1>
                <p style={{ fontSize: '14px', color: '#A09DAB', lineHeight: 1.5, margin: '0 0 24px 0' }}>
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
                <h1 style={{ ...serifStyle, fontSize: '28px', fontWeight: 400, color: '#1F1E2E', lineHeight: 1.2, margin: '0 0 8px 0' }}>
                  Anything you'd rather skip?
                </h1>
                <p style={{ fontSize: '14px', color: '#A09DAB', lineHeight: 1.5, margin: '0 0 24px 0' }}>
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
                <h1 style={{ ...serifStyle, fontSize: '28px', fontWeight: 400, color: '#1F1E2E', lineHeight: 1.2, margin: '0 0 8px 0' }}>
                  How many meals a day?
                </h1>
                <p style={{ fontSize: '14px', color: '#A09DAB', lineHeight: 1.5, margin: '0 0 24px 0' }}>
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
                <h1 style={{ ...serifStyle, fontSize: '28px', fontWeight: 400, color: '#1F1E2E', lineHeight: 1.2, margin: '0 0 8px 0' }}>
                  Do you have a cook at home?
                </h1>
                <p style={{ fontSize: '14px', color: '#A09DAB', lineHeight: 1.5, margin: '0 0 24px 0' }}>
                  We'll send your meal plan straight to them on WhatsApp.
                </p>
                {/* Yes / No side by side */}
                <div className="flex gap-3 mb-5">
                  <button onClick={() => setHasCook(true)}
                    className="flex-1 flex flex-col items-center gap-2 py-6 rounded-2xl cursor-pointer transition-smooth"
                    style={{
                      background: hasCook === true ? '#F5EEEA' : '#FFF',
                      border: hasCook === true ? '2px solid #E8D8D2' : '1.5px solid #EAE4DC',
                    }}>
                    <span style={{ fontSize: '32px', lineHeight: 1 }}>👨‍🍳</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: hasCook === true ? '#6B2E3A' : '#1F1E2E' }}>
                      Yes, lifesaver!
                    </span>
                  </button>
                  <button onClick={() => setHasCook(false)}
                    className="flex-1 flex flex-col items-center gap-2 py-6 rounded-2xl cursor-pointer transition-smooth"
                    style={{
                      background: hasCook === false ? '#F5EEEA' : '#FFF',
                      border: hasCook === false ? '2px solid #E8D8D2' : '1.5px solid #EAE4DC',
                    }}>
                    <span style={{ fontSize: '32px', lineHeight: 1 }}>🧑‍🍳</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: hasCook === false ? '#6B2E3A' : '#1F1E2E' }}>
                      I cook myself
                    </span>
                  </button>
                </div>

                {/* Cook details — shown below when "Yes" is selected */}
                {hasCook === true && (
                  <div style={{
                    background: '#FFF', borderRadius: 20, padding: '20px 18px',
                    border: '1.5px solid #EAE4DC',
                  }}>
                    <p style={{ fontSize: '13px', color: '#A09DAB', margin: '0 0 16px 0' }}>
                      Great! Add their details so we can send meal plans via WhatsApp.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#7A768A', display: 'block', marginBottom: 6 }}>
                          Cook's name <span style={{ color: '#E05A33' }}>*</span>
                        </label>
                        <input type="text" value={cookName} onChange={(e) => setCookName(e.target.value)}
                          placeholder="What do you call them?"
                          style={{
                            width: '100%', padding: '12px 14px', borderRadius: 12,
                            border: `1.5px solid ${cookName.trim() === '' ? '#E0DAD2' : '#E8D8D2'}`,
                            background: '#F8F8F8', fontSize: '14px', outline: 'none',
                            fontFamily: 'inherit',
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#E8D8D2'} onBlur={(e) => e.target.style.borderColor = cookName.trim() ? '#E8D8D2' : '#EAE4DC'} />
                        {cookName.trim() === '' && (
                          <p style={{ fontSize: '11px', color: '#A09DAB', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                            Required — helps identify your cook's meals
                          </p>
                        )}
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#7A768A', display: 'block', marginBottom: 6 }}>
                          Their WhatsApp number <span style={{ color: '#E05A33' }}>*</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center px-3 py-3 rounded-xl" style={{ background: '#F0ECE6', border: '1px solid #EAE4DC' }}>
                            <span style={{ fontSize: '13px', color: '#7A768A', fontWeight: 500 }}>+91</span>
                          </div>
                          <input type="tel" value={cookPhone} onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                            setCookPhone(val)
                          }} placeholder="9876543210"
                            maxLength={10}
                            style={{
                              flex: 1, padding: '12px 14px', borderRadius: 12,
                              border: `1.5px solid ${cookPhone.trim().length >= 10 ? '#E8D8D2' : '#EAE4DC'}`,
                              background: '#F8F8F8', fontSize: '14px', outline: 'none',
                              fontFamily: 'inherit',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#E8D8D2'} onBlur={(e) => e.target.style.borderColor = cookPhone.trim().length >= 10 ? '#E8D8D2' : '#EAE4DC'} />
                        </div>
                        <p style={{ fontSize: '11px', color: '#A09DAB', margin: '6px 0 0 0', lineHeight: 1.4 }}>
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

            {/* STEP 5: Grocery Apps (multi-select) */}
            {step === 5 && (
              <div>
                <h1 style={{ ...serifStyle, fontSize: '28px', fontWeight: 400, color: '#1F1E2E', lineHeight: 1.2, margin: '0 0 8px 0' }}>
                  Where do you order groceries?
                </h1>
                <p style={{ fontSize: '14px', color: '#A09DAB', lineHeight: 1.5, margin: '0 0 24px 0' }}>
                  Pick all the apps you use. We'll link them from your meal plan for quick ordering.
                </p>
                <div className="space-y-2.5">
                  {GROCERY_APPS.map((app) => {
                    const sel = groceryApps.includes(app.id)
                    return (
                      <button key={app.id} onClick={() => toggle(groceryApps, app.id, setGroceryApps)}
                        className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl cursor-pointer transition-smooth"
                        style={{
                          background: sel ? '#F5EEEA' : '#FFF',
                          border: sel ? '2px solid #E8D8D2' : '1.5px solid #EAE4DC',
                        }}>
                        <span style={{ fontSize: '28px', lineHeight: 1, flexShrink: 0 }}>{app.emoji}</span>
                        <span className="flex-1 text-left" style={{ fontSize: '15px', fontWeight: 600, color: sel ? '#6B2E3A' : '#1F1E2E' }}>
                          {app.name}
                        </span>
                        {sel ? (
                          <div style={{
                            width: 24, height: 24, borderRadius: 12,
                            background: '#6B2E3A', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <Check size={14} color="#FFF" />
                          </div>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bottom CTA bar */}
          <div className="fixed bottom-0 left-0 right-0 p-5" style={{
            background: 'rgba(247,243,238,0.96)',
            backdropFilter: 'blur(12px)',
          }}>
            <div className="max-w-md mx-auto flex gap-3">
              <button onClick={() => setStep(step - 1)}
                className="w-14 h-14 rounded-2xl flex items-center justify-center cursor-pointer transition-smooth"
                style={{ background: '#FFF', border: '1.5px solid #EAE4DC', flexShrink: 0 }}>
                <ArrowLeft size={18} color="#1F1E2E" />
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
                disabled={!canProceed() && !(step === 2) && !(step === 5)}
                className="flex-1 h-14 rounded-2xl font-semibold flex items-center justify-center border-none cursor-pointer transition-smooth"
                style={{
                  background: (canProceed() || step === 2 || step === 5) ? '#1F1E2E' : '#D5D1DC',
                  color: '#FFF',
                  fontSize: '15px',
                  opacity: (canProceed() || step === 2 || step === 5) ? 1 : 0.5,
                }}>
                {step === 2 && avoidances.length === 0
                  ? 'None'
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
