import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore, DEFAULT_MEALS } from '../store/useStore'
import type { Meal } from '../store/useStore'
import { ArrowLeft, Clock, Flame, X, RefreshCw, MessageCircle, Check, ShoppingCart } from 'lucide-react'

export default function MealDetail() {
  const { date, type } = useParams<{ date: string; type: string }>()
  const navigate = useNavigate()
  const { weeklyPlan, rotateMeal, skipMeal, markDone, setDayPlan, preferences } = useStore()
  const [showReplace, setShowReplace] = useState(false)

  const mealType = type as 'breakfast' | 'lunch' | 'dinner'
  const dayPlan = useMemo(() => weeklyPlan.find((d) => d.date === date), [weeklyPlan, date])
  const meal = dayPlan?.[mealType]
  const isDone = dayPlan?.done?.[mealType]
  const isSkipped = dayPlan?.skipped?.[mealType]

  if (!meal || !date) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F7F3EE' }}>
        <p style={{ color: '#A09DAB' }}>Meal not found</p>
      </div>
    )
  }

  const handleSkip = () => { skipMeal(date, mealType); navigate(-1) }
  const handleDone = () => { markDone(date, mealType); navigate(-1) }

  const handleSwap = (newMeal: Meal) => {
    setDayPlan(date, { [mealType]: newMeal })
    setShowReplace(false)
  }

  const sendMealToCook = () => {
    const msg = encodeURIComponent(`*${meal.name}*\n\nIngredients:\n${meal.ingredients.map(i => `- ${i}`).join('\n')}\n\n${meal.cookTime ? `Cook time: ${meal.cookTime}` : ''}`)
    const phone = preferences.cookPhone.replace(/\D/g, '')
    // Opens WhatsApp from user's installed app — we never send messages ourselves
    window.open(phone ? `https://wa.me/91${phone}?text=${msg}` : `https://wa.me/?text=${msg}`, '_blank')
  }

  const getGroceryUrl = () => {
    const urls: Record<string, string> = { blinkit: 'https://blinkit.com', zepto: 'https://www.zeptonow.com', swiggy: 'https://www.swiggy.com/instamart', bigbasket: 'https://www.bigbasket.com', dunzo: 'https://www.dunzo.com' }
    return urls[preferences.preferredGroceryApp] || urls.blinkit
  }

  const mealLabel: Record<string, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' }

  return (
    <div className="min-h-screen" style={{ background: '#F7F3EE' }}>
      {/* Hero Image */}
      <div style={{ position: 'relative', height: '44vh', minHeight: 300 }}>
        <img src={meal.image} alt={meal.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 120,
          background: 'linear-gradient(rgba(31,30,46,0.35), transparent)',
        }} />
        <button onClick={() => navigate(-1)}
          style={{
            position: 'absolute', top: 52, left: 16,
            width: 40, height: 40, borderRadius: 20,
            background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          <ArrowLeft size={18} color="#1F1E2E" />
        </button>
        {(isDone || isSkipped) && (
          <div style={{
            position: 'absolute', top: 56, right: 16,
            padding: '6px 14px', borderRadius: 20,
            background: isDone ? '#5FB07A' : '#A09DAB',
            color: '#FFF', fontSize: '12px', fontWeight: 600,
          }}>
            {isDone ? 'Done' : 'Skipped'}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ marginTop: -28, position: 'relative', zIndex: 10 }}>
        <div style={{
          background: '#F7F3EE',
          borderRadius: '28px 28px 0 0',
          padding: '30px 22px 120px',
        }}>
          <div className="flex items-center gap-3 mb-3">
            <span className="chip chip-accent">{mealLabel[mealType]}</span>
            {meal.cookTime && (
              <span className="flex items-center gap-1" style={{ fontSize: '13px', color: '#A09DAB' }}>
                <Clock size={13} /> {meal.cookTime}
              </span>
            )}
            {meal.calories && (
              <span className="flex items-center gap-1" style={{ fontSize: '13px', color: '#A09DAB' }}>
                <Flame size={13} /> {meal.calories} kcal
              </span>
            )}
          </div>

          <h1 style={{
            fontSize: '28px', fontWeight: 800, color: '#1F1E2E',
            margin: '0 0 14px 0', letterSpacing: '-0.03em', lineHeight: 1.15,
          }}>
            {meal.name}
          </h1>

          {meal.tags && meal.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {meal.tags.map((tag) => (
                <span key={tag} className="chip">{tag}</span>
              ))}
            </div>
          )}

          <div style={{ height: 1, background: '#EAE4DC', margin: '0 0 24px 0' }} />

          <div className="mb-6">
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 14px 0', color: '#1F1E2E' }}>
              Ingredients
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {meal.ingredients.map((ing, i) => (
                <div key={i} className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl"
                  style={{ background: '#FFFFFF', border: '1px solid #EAE4DC' }}>
                  <div style={{ width: 5, height: 5, borderRadius: 3, background: '#B8A6E6', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#1F1E2E' }}>{ing}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order ingredients CTA */}
          <button onClick={() => window.open(getGroceryUrl(), '_blank')}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl cursor-pointer mb-6"
            style={{ background: '#FFF', color: '#1F1E2E', border: '1px solid #EAE4DC', fontSize: '14px', fontWeight: 600 }}>
            <ShoppingCart size={15} style={{ color: '#7A768A' }} />
            Order ingredients on {preferences.preferredGroceryApp
              ? preferences.preferredGroceryApp.charAt(0).toUpperCase() + preferences.preferredGroceryApp.slice(1)
              : 'Blinkit'}
          </button>

          {preferences.hasCook && (
            <div className="mb-6">
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 10px 0', color: '#1F1E2E' }}>
                Note for {preferences.cookName || 'cook'}
              </h3>
              <div style={{
                padding: '14px 16px', borderRadius: 16,
                background: '#FFF', border: '1px solid #EAE4DC',
                fontSize: '13px', color: '#7A768A', lineHeight: 1.6,
              }}>
                Prepare {meal.name.toLowerCase()} with fresh ingredients. Serve hot.
                {meal.cookTime && ` Estimated cook time: ${meal.cookTime}.`}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="float-bar">
        <div className="max-w-md mx-auto flex gap-2">
          <button onClick={handleSkip}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border-none cursor-pointer"
            style={{ background: '#EFE9E0', color: '#7A768A', fontSize: '13px', fontWeight: 600 }}>
            <X size={15} /> Skip
          </button>
          <button onClick={() => setShowReplace(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border-none cursor-pointer"
            style={{ background: '#EFEAFF', color: '#8B74D3', fontSize: '13px', fontWeight: 600 }}>
            <RefreshCw size={15} /> Change
          </button>
          {preferences.hasCook && (
            <button onClick={sendMealToCook}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border-none cursor-pointer"
              style={{ background: '#EBF7EF', color: '#5FB07A', fontSize: '13px', fontWeight: 600 }}>
              <MessageCircle size={15} /> Send
            </button>
          )}
          <button onClick={handleDone}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border-none cursor-pointer"
            style={{ background: '#26233A', color: '#FFF', fontSize: '13px', fontWeight: 600 }}>
            <Check size={15} /> Done
          </button>
        </div>
      </div>

      {/* Replace Bottom Sheet */}
      {showReplace && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={() => setShowReplace(false)}>
          <div className="w-full max-w-md mx-auto bg-white rounded-t-3xl max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#1F1E2E' }}>
                Replace {mealLabel[mealType].toLowerCase()}
              </h3>
              <button onClick={() => setShowReplace(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer"
                style={{ background: '#EFE9E0' }}>
                <X size={16} />
              </button>
            </div>
            <div className="px-5 pb-8 space-y-2">
              {DEFAULT_MEALS[mealType].map((m) => (
                <button key={m.id} onClick={() => handleSwap(m)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl cursor-pointer bg-white border transition-smooth"
                  style={{
                    borderColor: m.id === meal.id ? '#B8A6E6' : '#EAE4DC',
                    borderWidth: m.id === meal.id ? 2 : 1,
                  }}>
                  <div style={{ width: 60, height: 60, borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}>
                    <img src={m.image} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="flex-1 text-left">
                    <p style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 2px 0', color: '#1F1E2E' }}>{m.name}</p>
                    <div className="flex items-center gap-2">
                      {m.cookTime && <span style={{ fontSize: '11px', color: '#A09DAB' }}>{m.cookTime}</span>}
                      {m.calories && <span style={{ fontSize: '11px', color: '#A09DAB' }}>{m.calories} kcal</span>}
                    </div>
                  </div>
                  {m.id === meal.id && (
                    <div style={{ width: 22, height: 22, borderRadius: 11, background: '#B8A6E6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={13} color="#FFF" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
    </div>
  )
}
