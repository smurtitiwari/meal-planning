import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Meal } from '../store/useStore'
import { detectSourceType } from '../store/useStore'
import { getCategoryForItem, GROCERY_CATEGORY_EMOJI } from '../utils/groceryCategories'
import CookMessage from './CookMessage'
import { ArrowLeft, Clock, User, Globe, Square, CheckSquare2, ShoppingCart, Sparkles, X } from 'lucide-react'

const serifFont = "'DM Serif Display', Georgia, serif"

const lightColors = {
  textPrimary: '#111111', textSecondary: '#7A746D', textMuted: '#7A746D',
  accent: '#3C151A', accentLight: 'rgba(60, 21, 26, 0.08)',
  surface: '#FFFFFF', card: '#F6F6F6',
  border: '#ECE8E4',
  chipBg: '#F8F6F3', chipBorder: 'rgba(60, 21, 26, 0.14)', chipText: '#3C151A',
}
const darkColors = {
  textPrimary: '#FEFEFE', textSecondary: '#B8B0B2', textMuted: '#A9A0A3',
  accent: '#F0C7CF', accentLight: 'rgba(154, 77, 90, 0.18)',
  surface: '#121212', card: '#1B1B1B',
  border: '#2E2E2E',
  chipBg: 'rgba(255,255,255,0.08)', chipBorder: 'rgba(255,255,255,0.14)', chipText: '#F0C7CF',
}

const mealLabel: Record<string, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' }

const sourceLabel: Record<string, string> = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  manual: 'Manual',
}

const APP_CATALOG: Record<string, { name: string; emoji: string; url: string }> = {
  blinkit: { name: 'Blinkit', emoji: '⚡', url: 'https://blinkit.com' },
  zepto: { name: 'Zepto', emoji: '🟣', url: 'https://www.zeptonow.com' },
  swiggy: { name: 'Swiggy Instamart', emoji: '🧡', url: 'https://www.swiggy.com/instamart' },
  bigbasket: { name: 'BigBasket', emoji: '🟢', url: 'https://www.bigbasket.com' },
  dunzo: { name: 'Dunzo', emoji: '📦', url: 'https://www.dunzo.com' },
}

interface MealPreviewSheetProps {
  meal: Meal | null
  onClose: () => void
  userName: string
  darkMode: boolean
  preferredGroceryApp: string
  preferredGroceryApps: string[]
  hasCook: boolean
  cookPhone: string
}

const HERO_HEIGHT = 360

export default function MealPreviewSheet({ meal, onClose, userName, darkMode, preferredGroceryApp, preferredGroceryApps, hasCook }: MealPreviewSheetProps) {
  const colors = darkMode ? darkColors : lightColors
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([])
  const [imgError, setImgError] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [showCookModal, setShowCookModal] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Reset state when meal changes
  useEffect(() => {
    setCheckedIngredients([])
    setImgError(false)
    setScrollY(0)
  }, [meal?.id])

  // Scroll lock
  useEffect(() => {
    if (meal) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [meal])

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setScrollY(scrollRef.current.scrollTop)
    }
  }, [])

  const source = useMemo(() => {
    if (!meal) return 'manual'
    return detectSourceType(meal.videoLink)
  }, [meal])

  const groupedIngredients = useMemo(() => {
    if (!meal) return []
    const groups = new Map<string, string[]>()
    meal.ingredients.forEach((ing) => {
      const category = getCategoryForItem(ing)
      groups.set(category, [...(groups.get(category) || []), ing])
    })
    return Array.from(groups.entries())
  }, [meal])

  const toggleIngredient = (ing: string) => {
    setCheckedIngredients((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    )
  }

  if (!meal) return null

  const uncheckedCount = meal.ingredients.length - checkedIngredients.length
  const heroSrc = meal.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80'
  const showImage = meal.image && !imgError

  // Zoom on scroll — image scales up as user scrolls down
  const zoomProgress = Math.min(scrollY / 300, 0.25)
  const imgScale = 1 + zoomProgress
  const imgTranslate = Math.min(scrollY * 0.3, 60)

  return (
    <div
      className="fixed inset-0 z-50"
      style={{ background: colors.surface }}
    >
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="w-full max-w-md mx-auto"
        style={{
          height: '100%',
          overflowY: 'auto',
        }}
      >
        {/* Hero image */}
        <div style={{
          position: 'relative', height: HERO_HEIGHT, flexShrink: 0,
          background: colors.card, overflow: 'hidden',
        }}>
          {showImage ? (
            <img
              src={heroSrc}
              alt={meal.name}
              onError={() => setImgError(true)}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transform: `scale(${imgScale}) translateY(${imgTranslate}px)`,
                transformOrigin: 'center center',
                transition: 'transform 0.08s linear',
              }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: colors.accent, fontSize: '14px', fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>
              {meal.type.slice(0, 2)}
            </div>
          )}
          {/* Gradient overlays */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.28) 100%)',
            pointerEvents: 'none',
          }} />
          {/* Back button */}
          <button
            onClick={onClose}
            className="rounded-full border-none cursor-pointer flex items-center justify-center"
            style={{
              position: 'fixed', top: 52, left: 18,
              width: 42, height: 42, borderRadius: 21,
              background: 'rgba(255,255,255,0.92)',
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

        {/* Content area */}
        <div style={{
          background: colors.surface,
          borderRadius: '24px 24px 0 0',
          marginTop: -28,
          position: 'relative',
          zIndex: 2,
          minHeight: 'calc(100vh - 332px)',
        }}>
          <div style={{ padding: '26px 22px 0' }}>
            {/* Meal type + name */}
            <span style={{
              fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: colors.accent,
            }}>
              {mealLabel[meal.type] || meal.type}
            </span>
            <h2 style={{
              fontFamily: serifFont, fontSize: '26px', fontWeight: 400,
              color: colors.textPrimary, margin: '4px 0 0 0', lineHeight: 1.15,
            }}>
              {meal.name}
            </h2>

            {/* Meta chips */}
            <div style={{
              marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8,
            }}>
              {meal.cookTime && (
                <span className="flex items-center gap-1.5" style={{
                  padding: '5px 10px', borderRadius: 999,
                  fontSize: '11px', fontWeight: 600,
                  background: colors.chipBg, border: `1px solid ${colors.chipBorder}`,
                  color: colors.chipText,
                }}>
                  <Clock size={12} /> {meal.cookTime}
                </span>
              )}
              {userName && (
                <span className="flex items-center gap-1.5" style={{
                  padding: '5px 10px', borderRadius: 999,
                  fontSize: '11px', fontWeight: 600,
                  background: colors.chipBg, border: `1px solid ${colors.chipBorder}`,
                  color: colors.chipText,
                }}>
                  <User size={12} /> {userName}
                </span>
              )}
              <span className="flex items-center gap-1.5" style={{
                padding: '5px 10px', borderRadius: 999,
                fontSize: '11px', fontWeight: 600,
                background: colors.chipBg, border: `1px solid ${colors.chipBorder}`,
                color: colors.chipText,
              }}>
                <Globe size={12} /> {sourceLabel[source]}
              </span>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: colors.border, margin: '20px 0 0' }} />
          </div>

          {/* Ingredients */}
          <div style={{ padding: '16px 22px 32px' }}>
            <h3 style={{
              fontSize: '15px', fontWeight: 700, margin: '0 0 14px 0',
              color: colors.textPrimary, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span>🧾</span> Ingredients
              {uncheckedCount > 0 && (
                <span style={{
                  fontSize: '11px', fontWeight: 600, color: colors.textSecondary,
                  marginLeft: 4,
                }}>
                  ({uncheckedCount} needed)
                </span>
              )}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {groupedIngredients.map(([category, items]) => (
                <div key={category}>
                  <p style={{
                    fontSize: '11px', fontWeight: 700, color: colors.textSecondary,
                    margin: '0 0 8px 2px', textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    {GROCERY_CATEGORY_EMOJI[category] || '🧺'} {category}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {items.map((ing, i) => {
                      const checked = checkedIngredients.includes(ing)
                      return (
                        <button
                          key={`${ing}-${i}`}
                          onClick={() => toggleIngredient(ing)}
                          className="w-full flex items-center gap-3 cursor-pointer bg-transparent border-none outline-none text-left"
                          style={{
                            padding: '10px 4px',
                          }}
                        >
                          {checked ? (
                            <CheckSquare2 size={18} style={{ color: '#5FB07A', flexShrink: 0 }} />
                          ) : (
                            <Square size={18} style={{ color: colors.textSecondary, flexShrink: 0 }} />
                          )}
                          <span style={{
                            fontSize: '14px', fontWeight: 500,
                            color: checked ? colors.textSecondary : colors.textPrimary,
                            textDecoration: checked ? 'line-through' : 'none',
                            transition: 'color 0.2s ease, text-decoration 0.2s ease',
                          }}>
                            {ing}
                          </span>
                          {checked && (
                            <span style={{
                              marginLeft: 'auto', fontSize: '10px', fontWeight: 600,
                              color: '#5FB07A', textTransform: 'uppercase', letterSpacing: '0.04em',
                            }}>
                              Have it
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons — after ingredients */}
          <div style={{ padding: '0 22px 100px' }}>
            <button
              onClick={() => setShowOrderModal(true)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl cursor-pointer border-none outline-none"
              style={{
                height: 48, fontSize: '14px', fontWeight: 700,
                background: colors.accent,
                color: darkMode ? '#111111' : '#FFFFFF',
                boxShadow: darkMode ? 'none' : '0 8px 20px rgba(60,21,26,0.16)',
              }}
            >
              <ShoppingCart size={16} /> Order grocery
            </button>
            {hasCook && (
              <button
                onClick={() => setShowCookModal(true)}
                className="w-full flex items-center justify-center gap-1.5 bg-transparent border-none cursor-pointer outline-none mt-3"
                style={{ color: colors.accent, fontSize: '13px', fontWeight: 700 }}
              >
                <Sparkles size={14} /> Generate message to cook
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Order grocery modal */}
      {showOrderModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center px-5"
          style={{ background: 'rgba(0,0,0,0.42)' }}
          onClick={() => setShowOrderModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6"
            style={{
              background: colors.surface,
              border: `1px solid ${darkMode ? colors.border : '#F4F4F4'}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 style={{
                  fontFamily: serifFont, fontSize: '20px', fontWeight: 400,
                  margin: 0, color: colors.textPrimary,
                }}>
                  Order grocery
                </h3>
                <p style={{ fontSize: '12px', color: colors.textSecondary, margin: '4px 0 0 0' }}>
                  Pick an app to open
                </p>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer outline-none"
                style={{
                  background: darkMode ? colors.card : '#F6F6F6',
                  color: colors.textPrimary,
                  border: `1px solid ${darkMode ? colors.border : '#F4F4F4'}`,
                }}
              >
                <X size={15} />
              </button>
            </div>
            <div className="space-y-2.5">
              {(() => {
                const selectedIds = (preferredGroceryApps && preferredGroceryApps.length > 0)
                  ? preferredGroceryApps
                  : (preferredGroceryApp ? [preferredGroceryApp] : Object.keys(APP_CATALOG))
                return selectedIds
                  .map((id) => ({ id, ...APP_CATALOG[id] }))
                  .filter((a) => a.name)
                  .map((app) => (
                    <button
                      key={app.id}
                      onClick={() => { window.open(app.url, '_blank'); setShowOrderModal(false) }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer transition-smooth"
                      style={{
                        background: darkMode ? colors.card : '#F6F6F6',
                        border: `1px solid ${darkMode ? colors.border : '#F4F4F4'}`,
                      }}
                    >
                      <span style={{ fontSize: '22px', lineHeight: 1, flexShrink: 0 }}>{app.emoji}</span>
                      <span className="flex-1 text-left" style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary }}>{app.name}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: colors.accent, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Open</span>
                    </button>
                  ))
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Cook message bottom sheet */}
      {showCookModal && hasCook && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.42)' }}
          onClick={() => setShowCookModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md animate-slide-up"
            style={{
              background: colors.surface,
              borderRadius: '24px 24px 0 0',
              height: '80vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 -4px 24px rgba(28,27,31,0.1)',
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
                  background: colors.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: darkMode ? '#111111' : '#FFF', flexShrink: 0,
                }}
              >
                <Sparkles size={16} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '15px', fontWeight: 700, color: colors.textPrimary, margin: 0 }}>
                  Cook message
                </p>
                <p style={{ fontSize: '11px', color: colors.textSecondary, margin: '2px 0 0 0' }}>
                  AI-generated draft for {meal.name}
                </p>
              </div>
              <button
                onClick={() => setShowCookModal(false)}
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
              <CookMessage
                todayPlan={{
                  date: new Date().toISOString().split('T')[0],
                  breakfast: null,
                  lunch: null,
                  dinner: null,
                  [meal.type]: meal,
                } as any}
                colors={{
                  card: colors.card,
                  border: colors.border,
                  textPrimary: colors.textPrimary,
                  textSecondary: colors.textSecondary,
                  textMuted: colors.textSecondary,
                  accentPurple: colors.accent,
                  iconSurface: colors.card,
                  tertiaryAction: colors.accent,
                  warmSurface: colors.card,
                  borderActive: colors.border,
                }}
                title={`Message for ${meal.name}`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
