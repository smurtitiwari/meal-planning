import { useMemo, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useStore, DEFAULT_MEALS } from '../store/useStore'
import type { Meal, Recipe, SharedRecipe } from '../store/useStore'
import { ArrowLeft, Clock, Flame, ShoppingCart, ExternalLink, CheckSquare2, Square, X, Check } from 'lucide-react'

export default function MealDetail() {
  const { date, type } = useParams<{ date: string; type: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { weeklyPlan, setDayPlan, preferences } = useStore()
  const [showReplace, setShowReplace] = useState(false)
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([])
  const recipeState = location.state as { recipe?: Recipe | SharedRecipe; source?: 'mine' | 'shared' } | null

  const mealType = type as 'breakfast' | 'lunch' | 'dinner'
  const dayPlan = useMemo(() => weeklyPlan.find((d) => d.date === date), [weeklyPlan, date])
  const planMeal = dayPlan?.[mealType]
  const meal = useMemo<Meal | null>(() => {
    if (planMeal) return planMeal
    if (!recipeState?.recipe) return null
    return {
      id: `recipe-view:${recipeState.recipe.id}`,
      name: recipeState.recipe.name,
      type: ((recipeState.recipe.mealType as 'breakfast' | 'lunch' | 'dinner') || 'lunch'),
      ingredients: recipeState.recipe.ingredients,
      image: recipeState.recipe.image || '',
      videoLink: recipeState.recipe.link,
      tags: recipeState.recipe.tags,
    }
  }, [planMeal, recipeState])
  const isRecipePreview = Boolean(recipeState?.recipe && !planMeal)
  const resolvedMealType = (planMeal ? mealType : meal?.type) as 'breakfast' | 'lunch' | 'dinner'

  if (!meal) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFFFF' }}>
        <p style={{ color: colors.textSecondary }}>Meal not found</p>
      </div>
    )
  }

  const handleSwap = (newMeal: Meal) => {
    if (!date || !resolvedMealType) return
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
  const dm = preferences.darkMode
  const colors = {
    page:          dm ? '#121212' : '#FFFFFF',
    card:          dm ? '#1B1B1B' : '#F6F6F6',
    border:        dm ? '#2E2E2E' : '#ECE8E4',
    text:          dm ? '#FEFEFE' : '#111111',
    textSecondary: dm ? '#A9A0A3' : '#7A746D',
    textTertiary:  dm ? '#A9A0A3' : '#7A746D',
    accent:        dm ? '#9A4D5A' : '#4A1F23',
    accentLight:   dm ? 'rgba(154,77,90,0.18)' : '#F2EEE9',
    sheetBg:       dm ? '#181818' : '#FFFFFF',
    sheetHeader:   dm ? '#1B1B1B' : '#FFFFFF',
    closeBtn:      dm ? '#252525' : '#F1F2F4',
  }

  const toggleIngredient = (ingredient: string) => {
    setCheckedIngredients((current) =>
      current.includes(ingredient) ? current.filter((item) => item !== ingredient) : [...current, ingredient]
    )
  }

  return (
    <div className="min-h-screen" style={{ background: colors.page }}>
      {/* Hero Image */}
      <div style={{ position: 'relative', height: '44vh', minHeight: 300 }}>
        <img src={meal.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80'} alt={meal.name}
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
          <ArrowLeft size={18} color="#111111" />
        </button>
      </div>

      {/* Content */}
      <div style={{ marginTop: -28, position: 'relative', zIndex: 10 }}>
        <div style={{
          background: colors.page,
          borderRadius: '24px 24px 0 0',
          padding: '30px 20px 96px',
        }}>
          <div className="flex items-center gap-3 mb-3">
            <span className="chip chip-accent">{mealLabel[resolvedMealType]}</span>
            {meal.cookTime && (
              <span className="flex items-center gap-1" style={{ fontSize: '13px', color: colors.textTertiary }}>
                <Clock size={13} /> {meal.cookTime}
              </span>
            )}
            {meal.calories && (
              <span className="flex items-center gap-1" style={{ fontSize: '13px', color: colors.textTertiary }}>
                <Flame size={13} /> {meal.calories} kcal
              </span>
            )}
          </div>

          <h1 style={{
            fontSize: '28px', fontWeight: 800, color: colors.text,
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

          <div style={{ height: 1, background: colors.border, margin: '0 0 24px 0' }} />

          <div className="mb-6">
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 14px 0', color: '#111111' }}>
              Ingredients
            </h3>
            <div className="space-y-2">
              {meal.ingredients.map((ing, i) => (
                <button
                  key={i}
                  onClick={() => toggleIngredient(ing)}
                  className="w-full flex items-center justify-between gap-3 py-3 px-4 rounded-xl border cursor-pointer text-left"
                  style={{ background: colors.card, border: `1px solid ${colors.border}` }}
                >
                  <div className="flex items-center gap-3">
                    {checkedIngredients.includes(ing) ? (
                      <CheckSquare2 size={18} style={{ color: colors.accent }} />
                    ) : (
                      <Square size={18} style={{ color: colors.textSecondary }} />
                    )}
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#111111' }}>{ing}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {!isRecipePreview && (
            <div style={{ marginBottom: 20 }}>
              <button
                onClick={() => setShowReplace(true)}
                className="bg-transparent border-none cursor-pointer p-0"
                style={{ color: colors.accent, fontSize: '13px', fontWeight: 600 }}
              >
                Change meal
              </button>
            </div>
          )}

          {meal.videoLink && (
            <div style={{ marginBottom: 20 }}>
              <a
                href={meal.videoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 no-underline"
                style={{ color: colors.accent, fontSize: '13px', fontWeight: 600 }}
              >
                <ExternalLink size={14} />
                View source
              </a>
            </div>
          )}

          <button onClick={() => window.open(getGroceryUrl(), '_blank')}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl cursor-pointer mb-6"
            style={{ background: '#F6F6F6', color: colors.text, border: '1px solid #ECE8E4', fontSize: '14px', fontWeight: 600 }}>
            <ShoppingCart size={15} style={{ color: colors.textSecondary }} />
            Order on {preferences.preferredGroceryApp
              ? preferences.preferredGroceryApp.charAt(0).toUpperCase() + preferences.preferredGroceryApp.slice(1)
              : 'Blinkit'}
          </button>

          {preferences.hasCook && (
            <div className="mb-6">
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 10px 0', color: '#111111' }}>
                Note for cook
              </h3>
              <div style={{
                padding: '14px 16px', borderRadius: 16,
                background: colors.card, border: `1px solid ${colors.border}`,
                fontSize: '13px', color: colors.textSecondary, lineHeight: 1.6,
              }}>
                Prepare {meal.name.toLowerCase()} with fresh ingredients. Serve hot.
                {meal.cookTime && ` Estimated cook time: ${meal.cookTime}.`}
              </div>
              <button
                onClick={sendMealToCook}
                className="mt-3 bg-transparent border-none cursor-pointer p-0"
                style={{ color: colors.accent, fontSize: '13px', fontWeight: 600 }}
              >
                Message sent to this person
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Replace Bottom Sheet */}
      {showReplace && !isRecipePreview && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(28,27,31,0.4)' }} onClick={() => setShowReplace(false)}>
          <div className="w-full max-w-md mx-auto max-h-[70vh] overflow-y-auto animate-slide-up"
            style={{ background: colors.sheetBg, borderRadius: '24px 24px 0 0', boxShadow: '0 -4px 24px rgba(28,27,31,0.1)' }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: colors.border, margin: '10px auto 0' }} />
            <div className="px-5 pt-4 pb-3 flex items-center justify-between sticky top-0 z-10" style={{ background: colors.sheetBg }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: colors.text }}>
                Replace {mealLabel[resolvedMealType].toLowerCase()}
              </h3>
              <button onClick={() => setShowReplace(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer"
                style={{ background: colors.closeBtn, color: colors.textSecondary }}>
                <X size={16} />
              </button>
            </div>
            <div className="px-5 pb-8 space-y-2">
              {DEFAULT_MEALS[resolvedMealType].map((m) => (
                <button key={m.id} onClick={() => handleSwap(m)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl cursor-pointer border transition-smooth"
                  style={{
                    background: m.id === meal.id ? colors.accentLight : colors.page,
                    borderColor: m.id === meal.id ? colors.accent : colors.border,
                    borderWidth: m.id === meal.id ? 1.5 : 1,
                  }}>
                  <div style={{ width: 60, height: 60, borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}>
                    <img src={m.image} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="flex-1 text-left">
                    <p style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 2px 0', color: '#111111' }}>{m.name}</p>
                    <div className="flex items-center gap-2">
                      {m.cookTime && <span style={{ fontSize: '11px', color: colors.textSecondary }}>{m.cookTime}</span>}
                      {m.calories && <span style={{ fontSize: '11px', color: colors.textSecondary }}>{m.calories} kcal</span>}
                    </div>
                  </div>
                  {m.id === meal.id && (
                      <div style={{ width: 22, height: 22, borderRadius: 11, background: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
