import { useState, useMemo, useEffect } from 'react'
import { Send, RefreshCw, Sparkles } from 'lucide-react'
import { useStore } from '../store/useStore'
import type { DayPlan, GroceryItem } from '../store/useStore'

const mealLabelLang: Record<string, Record<string, string>> = {
  english: { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' },
  hindi: { breakfast: 'Nashta', lunch: 'Dopahar ka khana', dinner: 'Raat ka khana' },
  hinglish: { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' },
}
const allMealTypes: ('breakfast' | 'lunch' | 'dinner')[] = ['breakfast', 'lunch', 'dinner']

type CookMessageProps = {
  todayPlan?: DayPlan | null
  groceryItems?: GroceryItem[]
  colors: any
  title?: string
}

export default function CookMessage({ todayPlan, groceryItems = [], colors, title = 'Message the Cook' }: CookMessageProps) {
  const { preferences } = useStore()
  const [message, setMessage] = useState('')
  const [draftMessage, setDraftMessage] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [regenSeed, setRegenSeed] = useState(0)

  const cookLang = (preferences as any).cookMessageLanguage || 'hinglish'

  const buildMessage = (lang: string) => {
    if (!todayPlan && groceryItems.length === 0) return ''
    const labels = mealLabelLang[lang] || mealLabelLang.hinglish
    const lines: string[] = []
    const dietary = preferences.dietaryPreferences?.length ? preferences.dietaryPreferences.join(', ') : ''
    const avoidances = preferences.avoidances?.length ? preferences.avoidances.join(', ') : ''

    if (lang === 'english') lines.push('*Meal plan and grocery note*', '')
    else if (lang === 'hindi') lines.push('*Khana aur grocery note*', '')
    else lines.push('*Meal plan aur grocery note*', '')

    if (todayPlan) {
      allMealTypes.forEach((type) => {
        const meal = todayPlan[type]
        if (meal) {
          lines.push(`*${labels[type]}:* ${meal.name}`)
          if (meal.videoLink) lines.push(`Recipe: ${meal.videoLink}`)
          lines.push(`Ingredients: ${meal.ingredients.join(', ')}`)
          lines.push('')
        }
      })
    }

    if (groceryItems.length > 0) {
      lines.push(`*Key grocery items:* ${groceryItems.slice(0, 12).map((item) => item.name).join(', ')}`)
      lines.push('')
    }

    if (dietary) lines.push(`*Dietary notes:* ${dietary}`)
    if (avoidances) lines.push(`*Please avoid:* ${avoidances}`)
    if (dietary || avoidances) lines.push('')

    if (lang === 'hindi') lines.push('Yeh plan aur grocery list hai. Kuch aur chahiye toh batana.')
    else if (lang === 'hinglish') lines.push('Yeh plan aur grocery list hai. Anything else needed, let me know!')
    else lines.push('This includes the meal plan and key grocery items. Let me know if anything else is needed.')

    return lines.join('\\n')
  }

  const aiCookMessage = useMemo(() => buildMessage(cookLang), [todayPlan, groceryItems, cookLang, regenSeed, preferences.dietaryPreferences, preferences.avoidances])

  useEffect(() => {
    setMessage(aiCookMessage)
    setDraftMessage(aiCookMessage)
    setIsEditing(false)
  }, [aiCookMessage])

  const sendToCook = async () => {
    if (!message.trim()) return
    const phone = preferences.cookPhone ? preferences.cookPhone.replace(/\\D/g, '') : ''
    const payload = message.trim()
    if (navigator.share) {
      try {
        await navigator.share({ text: payload, title: 'Cook note' })
        return
      } catch {
        // fall back to WhatsApp / copy
      }
    }
    const encoded = encodeURIComponent(payload)
    const waUrl = phone ? `https://wa.me/91${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`
    window.open(waUrl, '_blank')
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(payload)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }
  }

  if (!preferences.hasCook || (!todayPlan && groceryItems.length === 0)) return null

  return (
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
            background: colors.iconSurface || (preferences.darkMode ? '#1F1F1F' : '#F1E7E9'),
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
            {title}
          </p>
          <p style={{ fontSize: '11px', color: preferences.darkMode ? colors.textMuted : colors.textSecondary, margin: '1px 0 0 0' }}>
            AI-generated draft. Edit before sending.
          </p>
        </div>
        <button
          onClick={() => setRegenSeed((v) => v + 1)}
          className="ml-auto flex items-center justify-center border-none rounded-full cursor-pointer outline-none"
          style={{ width: 44, height: 44, background: 'transparent', color: colors.tertiaryAction }}
          aria-label="Regenerate cook message"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      <div style={{ padding: '14px 20px 0' }}>
        <textarea
          value={isEditing ? draftMessage : message}
          onChange={(e) => setDraftMessage(e.target.value)}
          readOnly={!isEditing}
          rows={Math.max(6, (isEditing ? draftMessage : message).split('\\n').length + 1)}
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: 14,
            border: `1.5px solid ${colors.borderActive || (preferences.darkMode ? '#9A4D5A' : '#F4F4F4')}`,
            background: colors.warmSurface,
            fontSize: '13px',
            outline: 'none',
            fontFamily: 'inherit',
            color: colors.textPrimary,
            resize: 'vertical',
            lineHeight: 1.6,
            boxSizing: 'border-box',
            opacity: isEditing ? 1 : 0.9
          }}
        />
        <div className="flex items-center gap-3 mt-2">
          {!isEditing ? (
            <button
              onClick={() => {
                setDraftMessage(message)
                setIsEditing(true)
              }}
              className="bg-transparent border-none cursor-pointer p-0"
              style={{ fontSize: '12px', fontWeight: 600, color: colors.tertiaryAction, minHeight: 44 }}
            >
              Edit message
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setMessage(draftMessage)
                  setIsEditing(false)
                }}
                className="border-none rounded-xl cursor-pointer px-4"
                style={{ background: colors.accentPurple, color: '#FFF', fontSize: '12px', fontWeight: 600, minHeight: 44 }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setDraftMessage(message)
                  setIsEditing(false)
                }}
                className="bg-transparent border-none cursor-pointer p-0"
                style={{ fontSize: '12px', fontWeight: 600, color: colors.textSecondary, minHeight: 44 }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ padding: '14px 20px 16px' }}>
        <button
          onClick={sendToCook}
          className="w-full flex items-center justify-center gap-2 rounded-2xl cursor-pointer"
          style={{
            background: colors.accentPurple,
            height: 48,
            border: 'none',
            color: '#FFFFFF',
          }}
        >
          <Send size={15} />
          <span style={{ fontSize: '14px', fontWeight: 600 }}>{copied ? 'Sent and copied' : 'Send to Cook'}</span>
        </button>
      </div>
    </div>
  )
}
