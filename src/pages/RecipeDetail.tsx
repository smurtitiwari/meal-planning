import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, ExternalLink, ShoppingCart, Sparkles, Check, Square, CheckSquare2 } from 'lucide-react'
import { useStore, DEFAULT_MEALS, generateId } from '../store/useStore'
import CookMessage from '../components/CookMessage'

const light = {
  page: '#FFFFFF',
  card: '#F6F6F6',
  border: '#F4F4F4',
  text: '#111111',
  muted: '#7A746D',
  accent: '#3C151A',
  kcalBg: '#F8F6F3',
}
const dark = {
  page: '#121212',
  card: '#1B1B1B',
  border: '#2E2E2E',
  text: '#FEFEFE',
  muted: '#A9A0A3',
  accent: '#F0C7CF',
  kcalBg: 'rgba(154, 77, 90, 0.18)',
}

export default function RecipeDetail() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id = '' } = useParams<{ id: string }>()
  const { recipes, sharedRecipes, weeklyPlan, addRecipe, preferences } = useStore()
  const colors = preferences.darkMode ? dark : light
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([])
  const [scrollY, setScrollY] = useState(0)
  const [showCookModal, setShowCookModal] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const recipe = useMemo<any>(() => {
    const own = recipes.find((r) => r.id === id)
    if (own) return { ...own, source: 'mine' as const }
    const shared = sharedRecipes.find((r) => r.id === id)
    if (shared) return { ...shared, category: 'main' as const, source: 'shared' as const }

    const flattenedPlan = weeklyPlan.flatMap((day) => [day.breakfast, day.lunch, day.dinner]).filter(Boolean)
    const mealInPlan = flattenedPlan.find((meal) => meal?.id === id || meal?.id === `recipe:${id}` || meal?.id === `recipe-view:${id}`)
    if (mealInPlan) return { ...mealInPlan, mealType: mealInPlan.type, source: 'plan' as const }

    const defaults = [...DEFAULT_MEALS.breakfast, ...DEFAULT_MEALS.lunch, ...DEFAULT_MEALS.dinner]
    const defaultMeal = defaults.find((meal) => meal.id === id)
    if (defaultMeal) return { ...defaultMeal, mealType: defaultMeal.type, source: 'default' as const }
    const stateRecipe = (location.state as any)?.recipe
    if (stateRecipe) {
      return {
        id,
        name: stateRecipe.name,
        image: stateRecipe.thumbnail || stateRecipe.image,
        ingredients: stateRecipe.ingredients || [],
        cookTime: stateRecipe.cookTime,
        calories: stateRecipe.calories,
        link: stateRecipe.videoUrl || stateRecipe.link,
        category: 'main',
        mealType: 'lunch',
        source: 'chat',
      }
    }
    return null
  }, [id, recipes, sharedRecipes, weeklyPlan, location.state])

  if (!recipe) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: colors.page, color: colors.muted }}>Recipe not found</div>
  }

  const addSharedToMine = () => {
    addRecipe({
      id: generateId(),
      name: recipe.name,
      link: recipe.link || recipe.videoLink,
      ingredients: recipe.ingredients || [],
      category: 'main',
      note: recipe.note,
      mealType: recipe.mealType || 'lunch',
      image: recipe.image,
    })
  }

  const toggleIngredient = (ing: string) => {
    setCheckedIngredients((prev) => prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing])
  }

  const getGroceryUrl = () => {
    const urls: Record<string, string> = {
      blinkit: 'https://blinkit.com',
      zepto: 'https://www.zeptonow.com',
      swiggy: 'https://www.swiggy.com/instamart',
      bigbasket: 'https://www.bigbasket.com',
      dunzo: 'https://www.dunzo.com',
    }
    return urls[preferences.preferredGroceryApp] || urls.blinkit
  }

  // Zoom image on scroll
  const HERO_HEIGHT = 360
  const zoomProgress = Math.min(Math.max(-scrollY / 260, 0), 0.6)
  const imgScale = 1 + zoomProgress

  const heroSrc = recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80'

  // Parallax translate for image as user scrolls
  const imgTranslate = Math.min(scrollY * 0.3, 80)

  // Construct a "fake cook day plan" so CookMessage can be reused for a single recipe
  const mealTypeForCook: 'breakfast' | 'lunch' | 'dinner' = (recipe.mealType === 'breakfast' || recipe.mealType === 'lunch' || recipe.mealType === 'dinner') ? recipe.mealType : 'lunch'
  const singleDayPlan = {
    date: new Date().toISOString().split('T')[0],
    breakfast: null,
    lunch: null,
    dinner: null,
    [mealTypeForCook]: {
      id: recipe.id,
      name: recipe.name,
      type: mealTypeForCook,
      ingredients: recipe.ingredients || [],
      image: recipe.image || '',
      videoLink: recipe.link || recipe.videoLink,
      cookTime: recipe.cookTime,
      calories: recipe.calories,
      tags: recipe.tags,
    },
  } as any

  return (
    <div className="min-h-screen" style={{ background: colors.page }}>
      {/* ── Hero image (parallax + scroll-zoom) ── */}
      <div
        style={{
          position: 'relative',
          height: HERO_HEIGHT,
          overflow: 'hidden',
          background: colors.card,
        }}
      >
        <img
          src={heroSrc}
          alt={recipe.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${imgScale}) translateY(${imgTranslate}px)`,
            transformOrigin: 'center center',
            transition: 'transform 0.08s linear',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.28) 100%)',
            pointerEvents: 'none',
          }}
        />
        {/* Floating back button */}
        <button
          onClick={() => navigate(-1)}
          className="rounded-full border-none cursor-pointer flex items-center justify-center"
          style={{
            position: 'fixed',
            top: 52,
            left: 18,
            width: 42,
            height: 42,
            background: 'rgba(255,255,255,0.94)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 6px 14px rgba(17,17,17,0.14)',
            zIndex: 40,
          }}
          aria-label="Back"
        >
          <ArrowLeft size={18} color="#111111" />
        </button>
      </div>

      {/* ── Content ── */}
      <div
        style={{
          background: colors.page,
          borderRadius: '28px 28px 0 0',
          marginTop: -28,
          position: 'relative',
          zIndex: 2,
          padding: '26px 22px 120px',
        }}
      >
        <h1 style={{
          margin: 0,
          fontSize: '26px',
          fontWeight: 800,
          color: colors.text,
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
        }}>
          {recipe.name}
        </h1>

        {/* Meta row: cook time + kcal pill */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          {recipe.cookTime && (
            <span className="flex items-center gap-1" style={{ fontSize: '13px', color: colors.muted, fontWeight: 500 }}>
              <Clock size={14} />
              {recipe.cookTime}
            </span>
          )}
          {recipe.calories && (
            <span
              style={{
                padding: '5px 11px',
                borderRadius: 999,
                fontSize: '12px',
                fontWeight: 700,
                background: colors.kcalBg,
                border: `1px solid ${preferences.darkMode ? 'rgba(240, 199, 207, 0.24)' : 'rgba(60, 21, 26, 0.14)'}`,
                color: preferences.darkMode ? '#F0C7CF' : colors.accent,
                letterSpacing: '0.01em',
              }}
            >
              {recipe.calories} kcal
            </span>
          )}
        </div>

        {/* Tags (if any) — kept, 'main' chip removed per spec */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {recipe.tags.map((tag: string) => (
              <span
                key={tag}
                style={{
                  padding: '4px 10px',
                  borderRadius: 999,
                  fontSize: '11px',
                  fontWeight: 600,
                  background: colors.card,
                  border: `1px solid ${colors.border}`,
                  color: colors.muted,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div style={{ height: 1, background: colors.border, margin: '22px 0 18px 0' }} />

        {/* ── Ingredients checklist (no card layout) ── */}
        <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 12px 0', color: colors.text }}>
          Ingredients
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {(recipe.ingredients || []).length > 0 ? (
            (recipe.ingredients as string[]).map((ing, i) => {
              const sel = checkedIngredients.includes(ing)
              return (
                <button
                  key={`${ing}-${i}`}
                  onClick={() => toggleIngredient(ing)}
                  className="w-full flex items-center gap-3 cursor-pointer bg-transparent border-none outline-none text-left"
                  style={{
                    padding: '12px 4px',
                    borderBottom: i < (recipe.ingredients.length - 1) ? `1px solid ${colors.border}` : 'none',
                  }}
                >
                  {sel ? (
                    <CheckSquare2 size={19} style={{ color: colors.accent, flexShrink: 0 }} />
                  ) : (
                    <Square size={19} style={{ color: colors.muted, flexShrink: 0 }} />
                  )}
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: sel ? colors.muted : colors.text,
                    textDecoration: sel ? 'line-through' : 'none',
                  }}>
                    {ing}
                  </span>
                </button>
              )
            })
          ) : (
            <p style={{ fontSize: '13px', color: colors.muted, margin: 0 }}>No ingredients listed.</p>
          )}
        </div>

        {/* Order grocery CTA at end of ingredient list */}
        {(recipe.ingredients || []).length > 0 && (
          <button
            onClick={() => window.open(getGroceryUrl(), '_blank')}
            className="w-full flex items-center justify-center gap-2 rounded-2xl cursor-pointer border-none outline-none mt-5"
            style={{
              background: colors.accent,
              color: preferences.darkMode ? '#111111' : '#FFFFFF',
              height: 52,
              fontSize: '14px',
              fontWeight: 700,
              boxShadow: preferences.darkMode ? 'none' : '0 10px 24px rgba(60,21,26,0.16)',
            }}
          >
            <ShoppingCart size={16} />
            Order grocery
          </button>
        )}

        {/* View source CTA */}
        {(recipe.link || recipe.videoLink) && (
          <a
            href={recipe.link || recipe.videoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 no-underline"
            style={{ color: colors.accent, fontSize: '13px', fontWeight: 700 }}
          >
            <ExternalLink size={14} />
            View source
          </a>
        )}

        {/* Message cook CTA (tertiary) */}
        {preferences.hasCook && (
          <div className="mt-5">
            <button
              onClick={() => setShowCookModal(true)}
              className="inline-flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0 outline-none"
              style={{ color: colors.accent, fontSize: '13px', fontWeight: 700 }}
            >
              <Sparkles size={14} />
              Generate message to cook
            </button>
          </div>
        )}

        {/* Add to my recipes (shared source only) */}
        {recipe.source === 'shared' && (
          <button
            onClick={addSharedToMine}
            className="mt-5 bg-transparent border-none cursor-pointer p-0 inline-flex items-center gap-1.5"
            style={{ color: colors.muted, fontSize: '13px', fontWeight: 700 }}
          >
            <Check size={14} />
            Add to My Recipes
          </button>
        )}
      </div>

      {/* ── Cook message bottom modal (80vh) ── */}
      {showCookModal && preferences.hasCook && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.42)' }}
          onClick={() => setShowCookModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
            style={{
              background: colors.page,
              borderRadius: '28px 28px 0 0',
              height: '80vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 -12px 40px rgba(0,0,0,0.18)',
            }}
          >
            <div
              style={{
                padding: '18px 20px 14px',
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexShrink: 0,
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 12,
                background: colors.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: preferences.darkMode ? '#111111' : '#FFF',
                flexShrink: 0,
              }}>
                <Sparkles size={16} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '15px', fontWeight: 700, color: colors.text, margin: 0 }}>
                  Cook message
                </p>
                <p style={{ fontSize: '11px', color: colors.muted, margin: '2px 0 0 0' }}>
                  AI draft for {recipe.name}
                </p>
              </div>
              <button
                onClick={() => setShowCookModal(false)}
                className="rounded-full border-none cursor-pointer outline-none flex items-center justify-center"
                style={{
                  width: 36, height: 36,
                  background: colors.card,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  flexShrink: 0,
                }}
                aria-label="Close"
              >
                <span style={{ fontSize: '18px', lineHeight: 1 }}>×</span>
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 24px' }}>
              <CookMessage
                todayPlan={singleDayPlan}
                colors={{
                  card: colors.card,
                  border: colors.border,
                  textPrimary: colors.text,
                  textSecondary: colors.muted,
                  textMuted: colors.muted,
                  accentPurple: colors.accent,
                  iconSurface: colors.card,
                  tertiaryAction: colors.accent,
                  warmSurface: colors.card,
                  borderActive: colors.border,
                }}
                title={`Message for ${recipe.name}`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
