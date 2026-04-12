import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, getCurrentMealType } from '../store/useStore'
import type { Meal } from '../store/useStore'
import BottomNav from '../components/BottomNav'
import CookMessage from '../components/CookMessage'
import MealPreviewSheet from '../components/MealPreviewSheet'
import { ChefHat, Sparkles, CalendarDays, X } from 'lucide-react'

const mealLabel: Record<string, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' }
const allMealTypes: ('breakfast' | 'lunch' | 'dinner')[] = ['breakfast', 'lunch', 'dinner']
const serifFont = "'DM Serif Display', Georgia, serif"

const lightColors = {
  textPrimary: '#111111', textSecondary: '#7A746D', textTertiary: '#7A746D', textMuted: '#7A746D',
  accentPurple: '#3C151A', accentPurpleLight: '#9A4D5A', accentText: '#3C151A',
  surface: '#FFFFFF', pageSurface: '#FFFFFF', card: '#F6F6F6',
  border: '#F4F4F4', borderActive: '#F4F4F4', warmSurface: '#F4F5F7', iconSurface: '#F1F2F4', tertiaryAction: '#3C151A',
  chipBg: '#F8F6F3', chipBorder: 'rgba(60, 21, 26, 0.18)', chipText: '#3C151A',
  softShadow: '0 6px 18px rgba(27,18,18,0.04)',
}
const darkColors = {
  textPrimary: '#FEFEFE', textSecondary: '#B8B0B2', textTertiary: '#A9A0A3', textMuted: '#B9B1B4',
  accentPurple: '#9A4D5A', accentPurpleLight: '#6A2B34', accentSoft: 'rgba(154, 77, 90, 0.18)', accentText: '#F0C7CF',
  surface: '#121212', pageSurface: '#0E0E0E', card: '#1B1B1B',
  border: '#2B2B2B', borderActive: '#9A4D5A', warmSurface: '#161616', iconSurface: '#1F1F1F', tertiaryAction: '#F0C7CF',
  chipBg: 'rgba(255,255,255,0.08)', chipBorder: 'rgba(255,255,255,0.14)', chipText: '#F0C7CF',
  softShadow: 'none',
}

export default function Home() {
  const navigate = useNavigate()
  const { preferences, weeklyPlan, initWeeklyPlan } = useStore()
  const colors = preferences.darkMode ? darkColors : lightColors
  const today = new Date().toISOString().split('T')[0]
  const currentType = getCurrentMealType()
  const [showCookMessage, setShowCookMessage] = useState(false)
  const [previewMeal, setPreviewMeal] = useState<Meal | null>(null)

  useEffect(() => { initWeeklyPlan() }, [initWeeklyPlan])

  const todayPlan = useMemo(() => weeklyPlan.find((d) => d.date === today), [weeklyPlan, today])

  const totalCalories = useMemo(() => {
    if (!todayPlan) return 0
    return allMealTypes.reduce((sum, type) => sum + (todayPlan[type]?.calories || 0), 0)
  }, [todayPlan])

  const todayLabel = useMemo(() => {
    const d = new Date()
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  }, [])

  return (
    <div className="min-h-screen pb-28" style={{ background: colors.pageSurface }}>
      {/* ── Header ── */}
      <div className="px-5 pt-14 pb-2">
        <div className="flex items-center justify-between">
          <div
            style={{
              width: 36, height: 36, borderRadius: 12,
              background: colors.accentPurple,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 14px rgba(60,21,26,0.25)',
            }}
          >
            <ChefHat size={18} color="#FFF" />
          </div>
        </div>

        <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.textSecondary, margin: '18px 0 6px 0' }}>
          {todayLabel}
        </p>
        <h1 style={{ fontFamily: serifFont, fontSize: '32px', fontWeight: 400, color: colors.textPrimary, margin: 0, lineHeight: 1.1 }}>
          Today's plan
        </h1>
      </div>

      {/* ── Meal cards ── */}
      {todayPlan && (
        <div className="px-5 mt-6 w-full" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {allMealTypes.map((type) => {
            const meal = todayPlan[type]
            if (!meal) return null
            return (
              <MealCard
                key={type} colors={colors} darkMode={preferences.darkMode} type={type} name={meal.name}
                ingredients={meal.ingredients} image={meal.image} isCurrent={type === currentType}
                isDone={todayPlan.done?.[type]} isSkipped={todayPlan.skipped?.[type]}
                cookTime={meal.cookTime}
                onClick={() => setPreviewMeal(meal)}
              />
            )
          })}
          {/* Week plan secondary CTA (left-aligned) */}
          <button
            onClick={() => navigate('/planner')}
            className="flex items-center gap-1.5 cursor-pointer outline-none"
            style={{
              alignSelf: 'flex-start',
              background: colors.card,
              border: `1px solid ${preferences.darkMode ? colors.border : '#F4F4F4'}`,
              color: colors.textPrimary,
              fontSize: '13px',
              fontWeight: 700,
              padding: '10px 14px',
              borderRadius: 12,
              minHeight: 44,
              marginTop: 4,
            }}
          >
            <CalendarDays size={14} />
            View week plan
          </button>
        </div>
      )}

      {/* ── Quick actions (Grocery + Meal plan message) ── */}
      <div
        className="px-5 mt-4"
        style={{
          display: 'grid',
          gridTemplateColumns: preferences.hasCook ? '1fr 1fr' : '1fr',
          gap: 12,
        }}
      >
        <QuickAction
          icon={<span aria-hidden>🛒</span>}
          title="Grocery list"
          subtitle="Ready to shop"
          colors={colors}
          onClick={() => navigate('/planner?tab=grocery')}
        />
        {preferences.hasCook && (
          <QuickAction
            icon={<span aria-hidden>💬</span>}
            title="Meal plan message"
            subtitle="AI generated message to send to the cook"
            colors={colors}
            onClick={() => setShowCookMessage(true)}
          />
        )}
      </div>

      {/* ── AI Cook Message Bottom Modal ── */}
      {showCookMessage && preferences.hasCook && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.42)' }}
          onClick={() => setShowCookMessage(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
            style={{
              background: colors.pageSurface,
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
              <div
                style={{
                  width: 36, height: 36, borderRadius: 12,
                  background: `linear-gradient(135deg, ${colors.accentPurple}, ${colors.accentPurpleLight})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#FFF', flexShrink: 0,
                }}
              >
                <Sparkles size={16} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '15px', fontWeight: 700, color: colors.textPrimary, margin: 0 }}>
                  Cook message
                </p>
                <p style={{ fontSize: '11px', color: colors.textSecondary, margin: '2px 0 0 0' }}>
                  AI-generated draft · edit before sending
                </p>
              </div>
              <button
                onClick={() => setShowCookMessage(false)}
                className="rounded-full border-none cursor-pointer outline-none flex items-center justify-center"
                style={{
                  width: 36, height: 36,
                  background: colors.card,
                  border: `1px solid ${colors.border}`,
                  color: colors.textPrimary,
                  flexShrink: 0,
                }}
                aria-label="Close cook message"
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 24px' }}>
              <CookMessage todayPlan={todayPlan} colors={colors} />
            </div>
          </div>
        </div>
      )}

      <MealPreviewSheet
        meal={previewMeal}
        onClose={() => setPreviewMeal(null)}
        userName={preferences.name}
        darkMode={preferences.darkMode}
        preferredGroceryApp={preferences.preferredGroceryApp}
        preferredGroceryApps={preferences.preferredGroceryApps}
        hasCook={preferences.hasCook}
        cookPhone={preferences.cookPhone}
      />

      <BottomNav />
    </div>
  )
}

/* ── Components ── */

function QuickAction({
  icon, title, subtitle, colors, onClick,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  colors: typeof lightColors
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center cursor-pointer border-none outline-none text-left"
      style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 16,
        padding: '12px 14px',
        gap: 10,
        minHeight: 60,
        boxShadow: colors.softShadow,
      }}
    >
      <div
        style={{
          width: 34, height: 34,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: colors.textPrimary, margin: 0, lineHeight: 1.2 }}>
          {title}
        </p>
        <p style={{ fontSize: '11px', color: colors.textSecondary, margin: '2px 0 0 0', lineHeight: 1.2 }}>
          {subtitle}
        </p>
      </div>
    </button>
  )
}

function MealCard({
  colors, darkMode, type, name, ingredients, image, isCurrent, isDone, cookTime, onClick,
}: {
  colors: typeof lightColors, darkMode: boolean, type: string, name: string, ingredients: string[], image: string
  isCurrent: boolean, isDone?: boolean, isSkipped?: boolean, cookTime?: string, onClick: () => void
}) {
  const [imgError, setImgError] = useState(false)
  const showImage = image && !imgError

  return (
    <button
      onClick={onClick}
      className="w-full bg-transparent border-none p-0 cursor-pointer text-left focus:outline-none"
      style={{ minHeight: 44 }}
    >
      <div
        style={{
          background: colors.card,
          borderRadius: 20,
          border: `1px solid ${darkMode ? colors.border : '#F4F4F4'}`,
          display: 'flex',
          alignItems: 'stretch',
          padding: 12,
          gap: 14,
          boxShadow: colors.softShadow,
          position: 'relative',
        }}
      >
        {/* Image */}
        <div
          style={{
            width: 92, height: 92, flexShrink: 0, borderRadius: 14,
            overflow: 'hidden', background: colors.iconSurface,
            position: 'relative',
          }}
        >
          {showImage ? (
            <img src={image} alt={name} onError={() => setImgError(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div
              style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: colors.accentPurple, fontSize: '11px', fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}
            >
              {type.slice(0, 2)}
            </div>
          )}
          {isCurrent && (
            <div
              style={{
                position: 'absolute',
                top: 6, left: 6,
                background: 'rgba(17,17,17,0.82)',
                color: '#FFF',
                fontSize: '8px', fontWeight: 800, letterSpacing: '0.08em',
                padding: '3px 6px', borderRadius: 999, textTransform: 'uppercase',
                backdropFilter: 'blur(6px)',
              }}
            >
              Now
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.09em' }}>
              {mealLabel[type]?.toUpperCase()}
            </span>
            {isDone && (
              <span
                style={{
                  fontSize: '8px', fontWeight: 800, color: '#FFF', background: '#5FB07A',
                  padding: '2px 6px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.05em',
                }}
              >
                Done
              </span>
            )}
          </div>

          <h2
            style={{
              fontFamily: serifFont,
              fontSize: '19px', fontWeight: 400,
              color: colors.textPrimary,
              margin: '0 0 4px 0',
              lineHeight: 1.15,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}
          >
            {name}
          </h2>

          <p
            style={{
              fontSize: '11.5px', color: colors.textSecondary,
              margin: '0 0 7px 0',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.35,
            }}
          >
            {ingredients.join(', ')}
          </p>

          {cookTime && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '11px', fontWeight: 600,
                  color: colors.textSecondary,
                }}
              >
                {cookTime}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
