import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, getCurrentMealType } from '../store/useStore'
import BottomNav from '../components/BottomNav'
import { Send, ChevronRight, ChefHat, Pencil, Sparkles } from 'lucide-react'

const mealLabel: Record<string, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' }
const allMealTypes: ('breakfast' | 'lunch' | 'dinner')[] = ['breakfast', 'lunch', 'dinner']
const serifFont = "'DM Serif Display', Georgia, serif"

const lightColors = {
  textPrimary: '#111111',
  textSecondary: '#8A8A8A',
  textTertiary: '#8A8A8A',
  textMuted: '#8A8A8A',
  accentPurple: '#3C151A',
  accentPurpleLight: '#9A4D5A',
  accentText: '#3C151A',
  surface: '#FFFFFF',
  pageSurface: '#FFFFFF',
  card: '#F6F6F6',
  border: '#F4F4F4',
  borderActive: '#F4F4F4',
  warmSurface: '#FBFBFB',
  iconSurface: '#F1E7E9',
  tertiaryAction: '#3C151A',
}

const darkColors = {
  textPrimary: '#FEFEFE',
  textSecondary: '#D6D1D3',
  textTertiary: '#A9A0A3',
  textMuted: '#B9B1B4',
  accentPurple: '#9A4D5A',
  accentPurpleLight: '#6A2B34',
  accentSoft: 'rgba(154, 77, 90, 0.18)',
  accentText: '#F0C7CF',
  surface: '#121212',
  pageSurface: '#121212',
  card: '#1B1B1B',
  border: '#2E2E2E',
  borderActive: '#9A4D5A',
  warmSurface: '#111111',
  iconSurface: '#1F1F1F',
  tertiaryAction: '#F0C7CF',
}

const mealLabelLang: Record<string, Record<string, string>> = {
  english: { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' },
  hindi: { breakfast: 'Nashta', lunch: 'Dopahar ka khana', dinner: 'Raat ka khana' },
  hinglish: { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' },
}

export default function Home() {
  const navigate = useNavigate()
  const { preferences, weeklyPlan, initWeeklyPlan } = useStore()
  const colors = preferences.darkMode ? darkColors : lightColors
  const today = new Date().toISOString().split('T')[0]
  const currentType = getCurrentMealType()
  const [editedMessage, setEditedMessage] = useState<string | null>(null)
  const [hasUserEdited, setHasUserEdited] = useState(false)
  const [isEditingMessage, setIsEditingMessage] = useState(false)

  useEffect(() => { initWeeklyPlan() }, [initWeeklyPlan])

  const todayPlan = useMemo(() => weeklyPlan.find((d) => d.date === today), [weeklyPlan, today])

  const totalCalories = useMemo(() => {
    if (!todayPlan) return 0
    return allMealTypes.reduce((sum, type) => sum + (todayPlan[type]?.calories || 0), 0)
  }, [todayPlan])

  const cookLang = (preferences as any).cookMessageLanguage || 'hinglish'

  const buildMessage = (lang: string) => {
    if (!todayPlan) return ''
    const labels = mealLabelLang[lang] || mealLabelLang.hinglish
    const lines: string[] = []

    if (lang === 'english') lines.push('*Today\'s Meal Plan*', '')
    else if (lang === 'hindi') lines.push('*Aaj ka Khana*', '')
    else lines.push('*Aaj ka Meal Plan*', '')

    allMealTypes.forEach((type) => {
      const meal = todayPlan[type]
      if (meal) {
        lines.push(`*${labels[type]}:* ${meal.name}`)
        if (meal.videoLink) lines.push(`Recipe: ${meal.videoLink}`)
        lines.push('')
      }
    })

    if (lang === 'hindi') lines.push('Yeh aaj ka plan hai. Kuch aur chahiye toh batana.')
    else if (lang === 'hinglish') lines.push('Yeh aaj ka plan hai. Anything else needed, let me know!')
    else lines.push('This is today\'s plan. Let me know if anything else is needed.')

    return lines.join('\n')
  }

  const aiCookMessage = useMemo(() => buildMessage(cookLang), [todayPlan, cookLang])
  const displayMessage = hasUserEdited ? (editedMessage ?? aiCookMessage) : aiCookMessage

  const handleMessageChange = (val: string) => {
    setEditedMessage(val)
    setHasUserEdited(true)
  }

  const handleSaveEdit = () => setIsEditingMessage(false)

  const handleCancelEdit = () => {
    if (hasUserEdited) {
      setEditedMessage(null)
      setHasUserEdited(false)
    }
    setIsEditingMessage(false)
  }

  const sendToCook = () => {
    if (!todayPlan) return
    const msg = encodeURIComponent(displayMessage)
    const phone = preferences.cookPhone.replace(/\D/g, '')
    window.open(phone ? `https://wa.me/91${phone}?text=${msg}` : `https://wa.me/?text=${msg}`, '_blank')
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: colors.pageSurface }}>
      <div className="px-5 pt-14 pb-1">
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: colors.accentPurple,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <ChefHat size={18} color="#FFF" />
        </div>

        <h1
          style={{
            fontFamily: serifFont,
            fontSize: '26px',
            fontWeight: 400,
            color: colors.textPrimary,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Today's plan
        </h1>

        {totalCalories > 0 && (
          <p style={{ fontSize: '12px', fontWeight: 500, color: colors.textTertiary, margin: '8px 0 0 0' }}>
            {totalCalories.toLocaleString()} kcal planned
          </p>
        )}
      </div>

      {todayPlan && (
        <div className="px-5 mt-4 space-y-4">
          {allMealTypes.map((type) => {
            const meal = todayPlan[type]
            if (!meal) return null

            return (
              <MealCard
                key={type}
                colors={colors}
                type={type}
                name={meal.name}
                calories={meal.calories}
                ingredients={meal.ingredients}
                image={meal.image}
                isCurrent={type === currentType}
                isDone={todayPlan.done?.[type]}
                isSkipped={todayPlan.skipped?.[type]}
                onClick={() => navigate(`/meal/${today}/${type}`)}
              />
            )
          })}
        </div>
      )}

      <div className="px-5 mt-3">
        <button
          onClick={() => navigate('/planner?tab=grocery')}
          className="flex items-center gap-1 bg-transparent border-none cursor-pointer p-0"
          style={{ fontSize: '13px', fontWeight: 600, color: colors.tertiaryAction }}
        >
          View grocery list and planner
          <ChevronRight size={14} />
        </button>
      </div>

      {preferences.hasCook && todayPlan && (
        <div className="px-5 mt-4">
          <div
            style={{
          background: colors.card,
          borderRadius: 22,
          border: `1px solid ${colors.border}`,
          overflow: 'hidden',
          boxShadow: preferences.darkMode ? 'none' : '0 6px 18px rgba(27, 18, 18, 0.03)',
        }}
          >
            <div
              style={{
                padding: '14px 18px 10px',
                borderBottom: `1px solid ${colors.border}`,
                background: preferences.darkMode ? colors.warmSurface : colors.card,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  background: colors.iconSurface,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.tertiaryAction,
                  flexShrink: 0,
                }}
              >
                <Sparkles size={13} />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary, margin: 0 }}>
                  Note for cook
                </p>
                <p style={{ fontSize: '11px', color: preferences.darkMode ? colors.textMuted : colors.textSecondary, margin: '1px 0 0 0' }}>
                  Review and send today's meal note.
                </p>
              </div>
            </div>

            <div style={{ padding: '14px 20px 0' }}>
              {isEditingMessage ? (
                <div>
                  <textarea
                    autoFocus
                    value={displayMessage}
                    onChange={(e) => handleMessageChange(e.target.value)}
                    rows={Math.max(6, displayMessage.split('\n').length + 1)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: 14,
                      border: `1.5px solid ${colors.borderActive}`,
                      background: colors.warmSurface,
                      fontSize: '13px',
                      outline: 'none',
                      fontFamily: 'inherit',
                      color: colors.textPrimary,
                      resize: 'vertical',
                      lineHeight: 1.6,
                    }}
                  />
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={handleSaveEdit}
                      className="flex items-center justify-center px-4 rounded-xl border-none cursor-pointer"
                      style={{ background: colors.accentPurple, color: '#FFF', height: 32, fontSize: '12px', fontWeight: 600 }}
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-transparent border-none cursor-pointer p-0"
                      style={{ fontSize: '12px', fontWeight: 600, color: colors.textSecondary }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: 14,
                    border: `1.5px solid ${preferences.darkMode ? '#3A3A3A' : '#E5E5E5'}`,
                    background: preferences.darkMode ? '#1B1B1B' : '#FFFFFF',
                  }}
                >
                  {displayMessage.split('\n').map((line, i) => {
                    if (line.trim() === '') return <div key={i} style={{ height: 6 }} />
                    const urlRegex = /(https?:\/\/[^\s]+)/g
                    const parts = line.split(urlRegex)
                    const renderBold = (text: string) => {
                      const boldParts = text.split(/\*([^*]+)\*/g)
                      return boldParts.map((part, j) =>
                        j % 2 === 1
                          ? <strong key={j} style={{ fontWeight: 600, color: colors.textPrimary }}>{part}</strong>
                          : <span key={j}>{part}</span>,
                      )
                    }

                    return (
                      <p key={i} style={{ fontSize: '13px', color: colors.textPrimary, lineHeight: 1.6, margin: 0 }}>
                        {parts.map((part, j) => {
                          urlRegex.lastIndex = 0
                          return urlRegex.test(part)
                            ? <span key={j} style={{ color: '#1A73E8', textDecoration: 'underline', wordBreak: 'break-all' }}>{part}</span>
                            : <span key={j}>{renderBold(part)}</span>
                        })}
                      </p>
                    )
                  })}
                </div>
              )}
            </div>

            {!isEditingMessage && (
              <div style={{ padding: '8px 20px 0' }}>
                <button
                  onClick={() => setIsEditingMessage(true)}
                  className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0"
                  style={{ fontSize: '12px', fontWeight: 600, color: colors.tertiaryAction }}
                >
                  <Pencil size={12} />
                  Edit message
                </button>
              </div>
            )}

            <div style={{ padding: '14px 20px 16px' }}>
              <button
                onClick={sendToCook}
                className="w-full flex items-center justify-center gap-2 rounded-2xl cursor-pointer"
                style={{
                  background: 'transparent',
                  height: 48,
                  border: `1.5px solid ${colors.tertiaryAction}`,
                  color: colors.tertiaryAction,
                }}
              >
                <Send size={15} />
                <span style={{ fontSize: '14px', fontWeight: 600 }}>Send on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}

function MealCard({
  colors,
  type,
  name,
  calories,
  ingredients,
  image,
  isCurrent: _isCurrent,
  isDone,
  isSkipped: _isSkipped,
  onClick,
}: {
  colors: typeof lightColors
  type: string
  name: string
  calories?: number
  ingredients: string[]
  image: string
  isCurrent: boolean
  isDone?: boolean
  isSkipped?: boolean
  onClick: () => void
}) {
  const [imgError, setImgError] = useState(false)
  const showImage = image && !imgError

  return (
    <button
      onClick={onClick}
      className="w-full bg-transparent border-none p-0 cursor-pointer text-left"
      style={{ opacity: 1 }}
    >
      <div
        style={{
          background: colors.card,
          borderRadius: 22,
          border: `1px solid ${colors.border}`,
          overflow: 'hidden',
          boxShadow: 'none',
        }}
      >
        <div style={{ padding: '20px 22px 0' }}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-1.5">
              {isDone && (
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#FFF', background: '#5FB07A', padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Done
                </span>
              )}
              <span style={{ fontSize: '11px', fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {mealLabel[type].toUpperCase()}
              </span>
            </div>
            {calories && (
              <div style={{ flexShrink: 0, padding: '6px 10px', borderRadius: 999, background: colors.pageSurface === '#121212' ? 'rgba(154, 77, 90, 0.18)' : '#FBF5F6', color: colors.textPrimary, fontSize: '11px', fontWeight: 600 }}>
                {calories} kcal
              </div>
            )}
          </div>
          <h2 style={{ fontFamily: serifFont, fontSize: '24px', fontWeight: 400, color: colors.textPrimary, margin: '0 0 8px 0', lineHeight: 1.15, maxWidth: '100%' }}>
            {name}
          </h2>
          <p style={{ fontSize: '13px', color: colors.textSecondary, fontStyle: 'italic', margin: '0 0 4px 0', lineHeight: 1.5 }}>
            {ingredients.join(', ')}
          </p>
        </div>
        {showImage ? (
          <div style={{ margin: '16px 14px 14px', height: 200, overflow: 'hidden', borderRadius: 16, position: 'relative' }}>
            <img src={image} alt={name} onError={() => setImgError(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        ) : (
          <div style={{ height: 16 }} />
        )}
      </div>
    </button>
  )
}
