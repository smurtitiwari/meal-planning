import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, getCurrentMealType } from '../store/useStore'
import BottomNav from '../components/BottomNav'

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })
}

function formatDateUpper(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()
}

const mealLabel: Record<string, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' }
const mealRoman: Record<string, string> = { breakfast: 'I', lunch: 'II', dinner: 'III' }
const allMealTypes: ('breakfast' | 'lunch' | 'dinner')[] = ['breakfast', 'lunch', 'dinner']
const serifFont = "'DM Serif Display', Georgia, serif"

export default function Home() {
  const navigate = useNavigate()
  const { preferences, weeklyPlan, initWeeklyPlan } = useStore()
  const today = new Date().toISOString().split('T')[0]
  const currentType = getCurrentMealType()

  useEffect(() => { initWeeklyPlan() }, [initWeeklyPlan])

  const todayPlan = useMemo(() => weeklyPlan.find((d) => d.date === today), [weeklyPlan, today])

  // Calculate total calories
  const totalCalories = useMemo(() => {
    if (!todayPlan) return 0
    return allMealTypes.reduce((sum, type) => {
      const meal = todayPlan[type]
      return sum + (meal?.calories || 0)
    }, 0)
  }, [todayPlan])

  const sendToCook = () => {
    if (!todayPlan) return
    const lines = [`*Meal Plan - ${formatDate(todayPlan.date)}*`, '',
      todayPlan.breakfast ? `*Breakfast:* ${todayPlan.breakfast.name}\n${todayPlan.breakfast.ingredients.join(', ')}` : '',
      '', todayPlan.lunch ? `*Lunch:* ${todayPlan.lunch.name}\n${todayPlan.lunch.ingredients.join(', ')}` : '',
      '', todayPlan.dinner ? `*Dinner:* ${todayPlan.dinner.name}\n${todayPlan.dinner.ingredients.join(', ')}` : '',
    ]
    const msg = encodeURIComponent(lines.filter(Boolean).join('\n'))
    const phone = preferences.cookPhone.replace(/\D/g, '')
    window.open(phone ? `https://wa.me/91${phone}?text=${msg}` : `https://wa.me/?text=${msg}`, '_blank')
  }

  const getGroceryUrl = () => {
    const urls: Record<string, string> = { blinkit: 'https://blinkit.com', zepto: 'https://www.zeptonow.com', swiggy: 'https://www.swiggy.com/instamart', bigbasket: 'https://www.bigbasket.com', dunzo: 'https://www.dunzo.com' }
    return urls[preferences.preferredGroceryApp] || urls.blinkit
  }

  const groceryAppName = preferences.preferredGroceryApp
    ? preferences.preferredGroceryApp.charAt(0).toUpperCase() + preferences.preferredGroceryApp.slice(1)
    : 'Blinkit'

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F7F3EE' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-1 flex items-end justify-between">
        <div>
          <p style={{
            fontSize: '11px', color: '#A09DAB', fontWeight: 600, margin: 0,
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            {formatDateUpper(today)}
          </p>
          <h1 style={{
            fontFamily: serifFont, fontSize: '32px', fontWeight: 400,
            color: '#1F1E2E', margin: '8px 0 0 0', lineHeight: 1.15,
          }}>
            Your Daily<br />
            <span style={{ fontStyle: 'italic', color: '#B8A6E6' }}>Nourishment</span>
          </h1>
          {totalCalories > 0 && (
            <div className="flex items-baseline gap-2 mt-2">
              <span style={{ fontFamily: serifFont, fontSize: '28px', fontWeight: 400, color: '#1F1E2E' }}>
                {totalCalories.toLocaleString()}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#A09DAB', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                kcal planned
              </span>
            </div>
          )}
        </div>
        <button onClick={() => navigate('/profile')} className="bg-transparent border-none p-0 cursor-pointer" style={{ marginBottom: 8 }}>
          {preferences.profileImage ? (
            <img src={preferences.profileImage} alt="" style={{ width: 40, height: 40, borderRadius: 20, objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: 40, height: 40, borderRadius: 20, background: '#EFEAFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '15px', fontWeight: 700, color: '#8B74D3',
            }}>
              {(preferences.name || 'U').charAt(0).toUpperCase()}
            </div>
          )}
        </button>
      </div>

      {/* ========= MEAL CARDS ========= */}
      {todayPlan && (
        <div className="px-5 mt-6 space-y-4">
          {allMealTypes.map((type) => {
            const meal = todayPlan[type]
            if (!meal) return null
            const isCurrent = type === currentType
            const isDone = todayPlan.done?.[type]
            const isSkipped = todayPlan.skipped?.[type]

            return (
              <MealCard
                key={type}
                type={type}
                name={meal.name}
                calories={meal.calories}
                ingredients={meal.ingredients}
                image={meal.image}
                cookTime={meal.cookTime}
                tags={meal.tags}
                isCurrent={isCurrent}
                isDone={isDone}
                isSkipped={isSkipped}
                onClick={() => navigate(`/meal/${today}/${type}`)}
              />
            )
          })}
        </div>
      )}

      {/* ========= CTAs ========= */}
      <div className="px-5 mt-6 space-y-2.5 pb-2">
        {preferences.hasCook && (
          <button onClick={sendToCook}
            className="w-full flex items-center justify-center px-5 py-4 rounded-2xl border-none cursor-pointer"
            style={{ background: '#26233A', color: '#FFF' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>
              Send plan to {preferences.cookName || 'cook'}
            </span>
          </button>
        )}

        <button onClick={() => window.open(getGroceryUrl(), '_blank')}
          className="w-full flex items-center justify-center px-5 py-4 rounded-2xl cursor-pointer"
          style={{ background: '#FFF', color: '#1F1E2E', border: '1px solid #EAE4DC' }}>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>
            Order ingredients on {groceryAppName}
          </span>
        </button>
      </div>

      <BottomNav />
    </div>
  )
}

/* ─── MEAL CARD COMPONENT ─── */
function MealCard({
  type, name, calories, ingredients, image, cookTime, tags,
  isCurrent, isDone, isSkipped, onClick,
}: {
  type: string; name: string; calories?: number; ingredients: string[]
  image: string; cookTime?: string; tags?: string[]
  isCurrent: boolean; isDone?: boolean; isSkipped?: boolean
  onClick: () => void
}) {
  const [imgError, setImgError] = useState(false)
  const showImage = image && !imgError

  return (
    <button
      onClick={onClick}
      className="w-full bg-transparent border-none p-0 cursor-pointer text-left"
      style={{ opacity: isSkipped ? 0.5 : 1 }}
    >
      <div style={{
        background: '#FFFFFF',
        borderRadius: 22,
        border: isCurrent ? '2px solid #B8A6E6' : '1px solid #EAE4DC',
        overflow: 'hidden',
        boxShadow: isCurrent ? '0 2px 16px rgba(184,166,230,0.12)' : '0 1px 3px rgba(31,30,46,0.03)',
      }}>
        {/* Text content */}
        <div style={{ padding: '20px 22px 0' }}>
          {/* Top row: meal label + calories */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-1.5">
              {isDone && (
                <span style={{
                  fontSize: '9px', fontWeight: 700, color: '#FFF', background: '#5FB07A',
                  padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>Done</span>
              )}
              <span style={{
                fontSize: '11px', fontWeight: 700, color: isCurrent ? '#B8A6E6' : '#A09DAB',
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>
                {isCurrent && '  '}
                {mealLabel[type].toUpperCase()}
              </span>
            </div>
            {calories && (
              <div className="text-right" style={{ flexShrink: 0 }}>
                <span style={{
                  fontFamily: serifFont, fontSize: '26px', fontWeight: 400,
                  color: '#1F1E2E', lineHeight: 1,
                }}>{calories}</span>
                <span style={{
                  fontSize: '10px', fontWeight: 600, color: '#A09DAB',
                  display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 1,
                }}>kcal</span>
              </div>
            )}
          </div>

          {/* Meal name */}
          <h2 style={{
            fontFamily: serifFont, fontSize: '24px', fontWeight: 400,
            color: '#1F1E2E', margin: '0 0 8px 0', lineHeight: 1.15,
            maxWidth: calories ? '65%' : '100%',
          }}>
            {name}
          </h2>

          {/* Ingredients as italic text */}
          <p style={{
            fontSize: '13px', color: '#A09DAB', fontStyle: 'italic',
            margin: '0 0 4px 0', lineHeight: 1.5,
          }}>
            {ingredients.slice(0, 4).join(', ')}
            {ingredients.length > 4 ? '...' : ''}
          </p>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {tags.slice(0, 3).map((tag) => (
                <span key={tag} style={{
                  fontSize: '10px', fontWeight: 600, color: '#7A768A',
                  padding: '4px 10px', borderRadius: 100,
                  border: '1px solid #EAE4DC', background: '#FAFAF8',
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Image */}
        {showImage ? (
          <div style={{
            marginTop: 16,
            height: 200,
            overflow: 'hidden',
            position: 'relative',
          }}>
            <img
              src={image}
              alt={name}
              onError={() => setImgError(true)}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        ) : (
          /* Fallback: no image — just add bottom padding */
          <div style={{ height: 16 }} />
        )}
      </div>
    </button>
  )
}
