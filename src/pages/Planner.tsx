import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore, DAYS, generateId, getMealPool } from '../store/useStore'
import type { GroceryItem, Meal } from '../store/useStore'
import BottomNav from '../components/BottomNav'
import SegmentedControl from '../components/SegmentedControl'
import MealPreviewSheet from '../components/MealPreviewSheet'
import { X, Plus, Check, Trash2, RefreshCw, Repeat2, ShoppingCart } from 'lucide-react'
import { GROCERY_CATEGORIES, GROCERY_CATEGORY_EMOJI, getCategoryForItem } from '../utils/groceryCategories'

const serifFont = "'DM Serif Display', Georgia, serif"
const mealLabel: Record<string, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' }

const lightColors = {
  textPrimary: '#111111', textSecondary: '#7A746D', textTertiary: '#7A746D', textMuted: '#7A746D',
  accentPurple: '#3C151A', accentPurpleLight: '#9A4D5A', accentText: '#3C151A',
  surface: '#FFFFFF', pageSurface: '#FFFFFF', card: '#F6F6F6',
  border: '#ECE8E4', borderActive: 'rgba(60, 21, 26, 0.24)',
  secondarySurface: '#F6F6F6', elevatedSurface: '#F4F5F7',
  accentSoft: '#F2F3F5', tertiaryAction: '#3C151A', warmSurface: '#F4F5F7', iconSurface: '#F1F2F4'
}
const darkColors = {
  textPrimary: '#FEFEFE', textSecondary: '#D6D1D3', textTertiary: '#A9A0A3', textMuted: '#B9B1B4',
  accentPurple: '#9A4D5A', accentPurpleLight: '#6A2B34', accentText: '#F0C7CF',
  surface: '#121212', pageSurface: '#121212', card: '#1B1B1B',
  border: '#2E2E2E', borderActive: '#9A4D5A',
  secondarySurface: '#111111', elevatedSurface: '#1F1F1F',
  accentSoft: 'rgba(154, 77, 90, 0.18)', tertiaryAction: '#F0C7CF', warmSurface: '#111111', iconSurface: '#1F1F1F'
}


// Normal pantry spices we never show in grocery list — users always have these
const NORMAL_SPICE_TOKENS = ['salt', 'oil', 'turmeric', 'cumin', 'mustard', 'pepper', 'red chili powder', 'coriander powder', 'garam masala', 'masala', 'haldi', 'saffron', 'water']
function isNormalSpice(name: string) {
  const lower = name.toLowerCase()
  return NORMAL_SPICE_TOKENS.some((token) => lower.includes(token))
}

function formatGroceryItem(item: GroceryItem) {
  return item.unit ? `${item.name} (${item.unit})` : item.name
}

export default function Planner() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { weeklyPlan, initWeeklyPlan, rotateMeal, setDayPlan, groceryList, addGroceryItem, toggleGroceryItem, removeGroceryItem, syncGroceryWithPlans, recipes, preferences } = useStore()
  const [selectedDate, setSelectedDate] = useState('')
  const [swapModal, setSwapModal] = useState<{ date: string; type: 'breakfast' | 'lunch' | 'dinner' } | null>(null)
  const [pendingMeal, setPendingMeal] = useState<Meal | null>(null)
  const [activeTab, setActiveTab] = useState<'meals' | 'grocery'>('meals')
  const [groceryScope, setGroceryScope] = useState<'today' | 'week'>('today')
  const [showAddGrocery, setShowAddGrocery] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [previewMeal, setPreviewMeal] = useState<Meal | null>(null)
  const [newGroceryName, setNewGroceryName] = useState('')
  const [newGroceryUnit, setNewGroceryUnit] = useState('')
  // Per-item animation phase: 'checking' = filled but not yet crossed,
  // 'crossing' = filled + strikethrough, 'unchecking' = reverse for Done→To-buy
  const [itemAnimPhase, setItemAnimPhase] = useState<Record<string, 'checking' | 'crossing' | 'unchecking'>>({})
  const handleCheck = (id: string) => {
    if (itemAnimPhase[id]) return
    setItemAnimPhase((prev) => ({ ...prev, [id]: 'checking' }))
    setTimeout(() => {
      setItemAnimPhase((prev) => ({ ...prev, [id]: 'crossing' }))
    }, 180)
    setTimeout(() => {
      toggleGroceryItem(id)
      setItemAnimPhase((prev) => { const next = { ...prev }; delete next[id]; return next })
    }, 520)
  }
  const handleUncheck = (id: string) => {
    if (itemAnimPhase[id]) return
    setItemAnimPhase((prev) => ({ ...prev, [id]: 'unchecking' }))
    setTimeout(() => {
      toggleGroceryItem(id)
      setItemAnimPhase((prev) => { const next = { ...prev }; delete next[id]; return next })
    }, 320)
  }
  const colors = preferences.darkMode ? darkColors : lightColors
  const selectedSecondaryChipStyles = {
    background: preferences.darkMode ? 'rgba(154, 77, 90, 0.18)' : '#F8F6F3',
    color: colors.accentText,
    boxShadow: 'none',
    border: '1.5px solid rgba(236, 232, 228, 0.5)',
  }
  const inactiveSecondaryChipStyles = {
    background: preferences.darkMode ? '#1B1B1B' : '#F6F6F6',
    color: colors.textPrimary,
    boxShadow: 'none',
    border: '1px solid rgba(236, 232, 228, 0.5)',
  }

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'grocery') setActiveTab('grocery')
  }, [searchParams])

  useEffect(() => { initWeeklyPlan() }, [initWeeklyPlan])
  useEffect(() => { syncGroceryWithPlans() }, [weeklyPlan, syncGroceryWithPlans])
  useEffect(() => {
    if (weeklyPlan.length > 0 && !selectedDate) {
      const today = new Date().toISOString().split('T')[0]
      setSelectedDate(weeklyPlan.find((d) => d.date === today)?.date || weeklyPlan[0].date)
    }
  }, [weeklyPlan, selectedDate])

  const today = new Date().toISOString().split('T')[0]
  const selectedPlan = useMemo(() => weeklyPlan.find((d) => d.date === selectedDate), [weeklyPlan, selectedDate])
  const todayPlan = useMemo(() => weeklyPlan.find((d) => d.date === today), [weeklyPlan, today])

  const handleSwap = (meal: Meal) => { setPendingMeal(meal) }
  const handleSaveSwap = () => {
    if (!swapModal || !pendingMeal) return
    setDayPlan(swapModal.date, { [swapModal.type]: pendingMeal })
    setPendingMeal(null)
    setSwapModal(null)
  }

  const todayIngredients = useMemo(() => {
    if (!todayPlan) return new Set<string>()
    const ings = new Set<string>()
    const meals = [todayPlan.breakfast, todayPlan.lunch, todayPlan.dinner]
    meals.forEach((meal) => { meal?.ingredients.forEach((ing) => ings.add(ing.toLowerCase())) })
    return ings
  }, [todayPlan])

  const filteredGrocery = useMemo(() => {
    const base = groceryScope === 'week'
      ? groceryList
      : groceryList.filter((item) => item.source === 'manual' || todayIngredients.has(item.name.toLowerCase()))
    // Hide auto-sourced normal pantry spices (users always have these)
    return base.filter((item) => item.source === 'manual' || !isNormalSpice(item.name))
  }, [groceryList, groceryScope, todayIngredients])

  const unchecked = useMemo(() => filteredGrocery.filter((g) => !g.checked), [filteredGrocery])
  const checked = useMemo(() => filteredGrocery.filter((g) => g.checked), [filteredGrocery])
  const groupedUnchecked = useMemo(() => {
    const groups = new Map<string, GroceryItem[]>()
    unchecked.forEach((item) => {
      const category = getCategoryForItem(item.name)
      groups.set(category, [...(groups.get(category) || []), item])
    })
    return Array.from(groups.entries())
  }, [unchecked])
  const groupedChecked = useMemo(() => {
    const groups = new Map<string, GroceryItem[]>()
    checked.forEach((item) => {
      const category = getCategoryForItem(item.name)
      groups.set(category, [...(groups.get(category) || []), item])
    })
    return Array.from(groups.entries())
  }, [checked])

  const handleAddGrocery = () => {
    if (newGroceryName.trim()) {
      addGroceryItem({
        id: generateId(), name: newGroceryName.trim(), unit: newGroceryUnit.trim() || undefined,
        checked: false, source: 'manual',
      })
      setNewGroceryName(''); setNewGroceryUnit(''); setShowAddGrocery(false)
    }
  }

  const mealTypes: ('breakfast' | 'lunch' | 'dinner')[] = ['breakfast', 'lunch', 'dinner']

  return (
    <div className="min-h-screen pb-24" style={{ background: colors.pageSurface }}>
      <div className="px-5 pt-14 pb-2">
        <h1 style={{ fontFamily: serifFont, fontSize: '26px', fontWeight: 400, color: colors.textPrimary, margin: 0 }}>
          Meal Plan
        </h1>
        <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '4px 0 0 0' }}>Plan your week, eat better</p>
      </div>

      <div className="px-5 mt-4 mb-3">
        <SegmentedControl
          options={[ { value: 'meals', label: 'Meals' }, { value: 'grocery', label: `Grocery (${unchecked.length})` } ]}
          value={activeTab} onChange={setActiveTab}
          railBackground={preferences.darkMode ? '#1B1B1B' : '#F2F3F5'}
          activeBackground={preferences.darkMode ? '#2E2E2E' : '#FFFFFF'}
          activeText={colors.textPrimary} inactiveText={colors.textSecondary}
          activeBorder={preferences.darkMode ? '#3A3A3A' : '#DDD8D3'}
          inactiveBorder={preferences.darkMode ? 'rgba(255,255,255,0.08)' : '#E0DCD8'}
        />
      </div>

      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {weeklyPlan.map((day, i) => {
            const d = new Date(day.date + 'T00:00:00')
            const isToday = day.date === today
            const isSel = day.date === selectedDate
            return (
              <button key={day.date} onClick={() => setSelectedDate(day.date)}
                className="flex flex-col items-center min-w-[46px] py-2 px-2 rounded-2xl cursor-pointer transition-smooth outline-none"
                style={{
                  background: isSel ? (preferences.darkMode ? colors.elevatedSurface : '#ECE8E4') : (preferences.darkMode ? '#1B1B1B' : '#F6F6F6'),
                  color: isSel ? colors.accentText : colors.textPrimary,
                  border: isSel
                    ? '1px solid transparent'
                    : `1px solid ${preferences.darkMode ? 'rgba(255,255,255,0.08)' : '#F4F4F4'}`,
                  boxShadow: 'none',
                }}>
                <span style={{ fontSize: '10px', fontWeight: 600, opacity: isSel ? 0.72 : 0.82, textTransform: 'uppercase' }}>{DAYS[i]}</span>
                <span style={{ fontSize: '18px', fontWeight: 800, marginTop: 1 }}>{d.getDate()}</span>
                <div style={{ width: 4, height: 4, borderRadius: 2, background: isSel ? colors.accentPurple : (isToday ? colors.accentPurple : 'transparent'), marginTop: 2, opacity: isSel ? 1 : 0.18 }} />
              </button>
            )
          })}
        </div>
      </div>

      {activeTab === 'meals' ? (
        <div className="px-5 space-y-4">
          {selectedPlan && mealTypes.map((type) => {
            const meal = selectedPlan[type]
            if (!meal) return null
            return (
              <PlannerMealCard
                key={type} colors={colors} type={type} meal={meal} isDone={selectedPlan.done?.[type]} isSkipped={selectedPlan.skipped?.[type]}
                onNavigate={() => setPreviewMeal(meal)} onRotate={() => rotateMeal(selectedDate, type)}
                onSwap={() => { setPendingMeal(selectedPlan[type]); setSwapModal({ date: selectedDate, type }) }}
              />
            )
          })}
          
        </div>
      ) : (
        <div className="px-5">
          <div className="flex gap-2 mb-4">
            {(['today', 'week'] as const).map((scope) => (
              <button key={scope} onClick={() => setGroceryScope(scope)}
                className="px-3.5 py-1.5 rounded-full border-none cursor-pointer transition-smooth whitespace-nowrap outline-none"
                style={{ ...(groceryScope === scope ? selectedSecondaryChipStyles : inactiveSecondaryChipStyles), fontSize: '12px', fontWeight: 600, minHeight: 44 }}>
                {scope === 'today' ? "Today's Grocery" : 'Week Grocery'}
              </button>
            ))}
          </div>

          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary, margin: 0 }}>
                {groceryScope === 'today' ? "Today's groceries" : 'Week groceries'}
              </p>
              <p style={{ fontSize: '12px', color: colors.textSecondary, margin: '4px 0 0 0' }}>Auto-built from your meal plan.</p>
            </div>
            <button onClick={() => setShowAddGrocery(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-full border cursor-pointer outline-none" style={{ background: colors.card, borderColor: colors.border, color: colors.textPrimary, fontSize: '12px', fontWeight: 600 }}>
              <Plus size={14} /> Add item
            </button>
          </div>

          {unchecked.length > 0 && (
            <div className="mb-5">
              <p style={{ fontSize: '11px', fontWeight: 700, color: colors.tertiaryAction, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px 0' }}>To buy ({unchecked.length})</p>
              <div className="space-y-4">
                {groupedUnchecked.map(([category, items]) => (
                  <div key={category}>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: colors.textSecondary, margin: '0 0 8px 2px' }}>{GROCERY_CATEGORY_EMOJI[category]} {category}</p>
                    <div className="space-y-1.5">
                      {items.map((item) => {
                        const phase = itemAnimPhase[item.id]
                        const filled = phase === 'checking' || phase === 'crossing'
                        const crossed = phase === 'crossing'
                        return (
                        <div key={item.id} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: colors.card, border: `1px solid ${colors.border}`, transition: 'opacity 0.3s ease', opacity: crossed ? 0.7 : 1 }}>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleCheck(item.id)}
                              className="w-5 h-5 rounded-md flex items-center justify-center cursor-pointer outline-none"
                              style={{
                                border: filled ? 'none' : `2px solid ${colors.border}`,
                                background: filled ? '#5FB07A' : 'transparent',
                                transition: 'all 0.24s cubic-bezier(0.22,1,0.36,1)',
                              }}
                            >
                              {filled && <Check size={11} color="#FFF" />}
                            </button>
                            <span
                              style={{
                                fontSize: '14px', fontWeight: 500,
                                color: crossed ? colors.textSecondary : colors.textPrimary,
                                textDecoration: crossed ? 'line-through' : 'none',
                                transition: 'color 0.28s ease',
                              }}
                            >
                              {formatGroceryItem(item)}
                            </span>
                          </div>
                          {item.source === 'manual' ? (
                            <button onClick={() => removeGroceryItem(item.id)} className="bg-transparent border-none cursor-pointer p-1 outline-none" style={{ color: '#D5D1DC' }}><Trash2 size={13} /></button>
                          ) : (
                            <span style={{ fontSize: '11px', color: colors.textTertiary }}>From meals</span>
                          )}
                        </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {checked.length > 0 && (
            <div className="mb-4">
              <p style={{ fontSize: '11px', fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px 0' }}>Done ({checked.length})</p>
              <div className="space-y-4">
                {groupedChecked.map(([category, items]) => (
                  <div key={category}>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: colors.textSecondary, margin: '0 0 8px 2px' }}>{GROCERY_CATEGORY_EMOJI[category]} {category}</p>
                    <div className="space-y-1.5">
                      {items.map((item) => {
                        const phase = itemAnimPhase[item.id]
                        const reverting = phase === 'unchecking'
                        return (
                        <div key={item.id} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: preferences.darkMode ? colors.elevatedSurface : '#F2F3F5', border: '1px solid #ECE8E4', transition: 'opacity 0.3s ease, background 0.3s ease', opacity: reverting ? 0.6 : 1 }}>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleUncheck(item.id)}
                              className="w-5 h-5 rounded-md flex items-center justify-center cursor-pointer outline-none"
                              style={{
                                border: reverting ? `2px solid ${colors.border}` : 'none',
                                background: reverting ? 'transparent' : '#5FB07A',
                                transition: 'all 0.24s cubic-bezier(0.22,1,0.36,1)',
                              }}
                            >
                              {!reverting && <Check size={11} color="#FFF" />}
                            </button>
                            <span
                              style={{
                                fontSize: '14px', fontWeight: 500,
                                color: reverting ? colors.textPrimary : colors.textSecondary,
                                textDecoration: reverting ? 'none' : 'line-through',
                                transition: 'color 0.28s ease',
                              }}
                            >
                              {formatGroceryItem(item)}
                            </span>
                          </div>
                          {item.source === 'manual' ? (
                            <button onClick={() => removeGroceryItem(item.id)} className="bg-transparent border-none cursor-pointer p-1 outline-none" style={{ color: '#D5D1DC' }}><X size={13} /></button>
                          ) : (
                            <span style={{ fontSize: '11px', color: colors.textTertiary }}>From meals</span>
                          )}
                        </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredGrocery.length === 0 && (
            <div className="text-center py-16">
              <div style={{ fontSize: '48px', marginBottom: 12 }}>🛒</div>
              <p style={{ fontSize: '15px', fontWeight: 600, color: colors.textPrimary, margin: '0 0 4px 0' }}>No items yet</p>
              <p style={{ fontSize: '13px', color: colors.textSecondary }}>
                {groceryScope === 'today' ? "Your today's plan doesn't need anything extra yet." : 'Your weekly plan does not need any extra items yet.'}
              </p>
            </div>
          )}

          {filteredGrocery.length > 0 && (
            <button
              onClick={() => setShowOrderModal(true)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl cursor-pointer border-none outline-none mt-4"
              style={{
                background: colors.accentPurple,
                color: '#FFF',
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

        </div>
      )}

      {swapModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-5" onClick={() => { setSwapModal(null); setPendingMeal(null) }}>
          <div className="w-full max-w-md mx-auto rounded-3xl max-h-[80vh] overflow-hidden" style={{ background: colors.card }} onClick={(e) => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between sticky top-0 z-10 border-b" style={{ borderColor: colors.border, background: colors.card }}>
              <h3 style={{ fontFamily: serifFont, fontSize: '20px', fontWeight: 400, margin: 0, color: colors.textPrimary }}>Replace {mealLabel[swapModal.type].toLowerCase()}</h3>
              <button onClick={() => { setSwapModal(null); setPendingMeal(null) }} className="w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer outline-none" style={{ background: preferences.darkMode ? colors.elevatedSurface : '#F1F2F4', color: colors.textSecondary }}><X size={16} /></button>
            </div>
            <div className="px-5 py-3" style={{ maxHeight: 'calc(80vh - 88px)', overflowY: 'auto', paddingBottom: 96 }}>
              {getMealPool(recipes, swapModal.type).map((meal) => {
                const current = pendingMeal || selectedPlan?.[swapModal.type]
                return (
                  <button key={meal.id} onClick={() => handleSwap(meal)} className="w-full flex items-center gap-3 p-3 rounded-2xl cursor-pointer border transition-smooth mb-2 outline-none" style={{ background: colors.card, borderColor: meal.id === current?.id ? colors.accentPurpleLight : colors.border, borderWidth: meal.id === current?.id ? 2 : 1, boxShadow: meal.id === current?.id ? '0 4px 14px rgba(60,21,26,0.12)' : 'none' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                      {meal.image ? <img src={meal.image} alt={meal.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: preferences.darkMode ? colors.elevatedSurface : '#F2F3F5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textSecondary, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>{meal.type.slice(0, 2)}</div>}
                    </div>
                    <div className="flex-1 text-left">
                      <p style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 2px 0', color: colors.textPrimary }}>{meal.name}</p>
                      <div className="flex items-center gap-2">
                        {meal.cookTime && <span style={{ fontSize: '11px', color: colors.textSecondary }}>{meal.cookTime}</span>}
                        {meal.calories && <span style={{ fontSize: '11px', color: colors.textSecondary }}>{meal.calories} kcal</span>}
                      </div>
                    </div>
                    {meal.id === current?.id && <div style={{ width: 22, height: 22, borderRadius: 11, background: colors.accentPurple, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={13} color="#FFF" /></div>}
                  </button>
                )
              })}
            </div>
            <div style={{ position: 'sticky', bottom: 0, background: preferences.darkMode ? 'rgba(17,17,17,0.96)' : 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)', borderTop: `1px solid ${colors.border}`, padding: '14px 20px 18px' }}>
              <button onClick={handleSaveSwap} disabled={!pendingMeal} className="w-full rounded-2xl border-none cursor-pointer outline-none" style={{ height: 48, background: colors.accentPurple, color: '#FFF', fontSize: '14px', fontWeight: 600, opacity: pendingMeal ? 1 : 0.4 }}>Save meal change</button>
            </div>
          </div>
        </div>
      )}

      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5" style={{ background: 'rgba(0,0,0,0.42)' }} onClick={() => setShowOrderModal(false)}>
          <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: colors.pageSurface, border: `1px solid ${preferences.darkMode ? colors.border : '#F4F4F4'}` }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 style={{ fontFamily: serifFont, fontSize: '20px', fontWeight: 400, margin: 0, color: colors.textPrimary }}>Order grocery</h3>
                <p style={{ fontSize: '12px', color: colors.textSecondary, margin: '4px 0 0 0' }}>Pick an app to open</p>
              </div>
              <button onClick={() => setShowOrderModal(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer outline-none"
                style={{ background: preferences.darkMode ? colors.elevatedSurface : '#F6F6F6', color: colors.textPrimary, border: `1px solid ${preferences.darkMode ? colors.border : '#F4F4F4'}` }}>
                <X size={15} />
              </button>
            </div>
            <div className="space-y-2.5">
              {(() => {
                const appCatalog: Record<string, { name: string; emoji: string; url: string }> = {
                  blinkit: { name: 'Blinkit', emoji: '⚡', url: 'https://blinkit.com' },
                  zepto: { name: 'Zepto', emoji: '🟣', url: 'https://www.zeptonow.com' },
                  swiggy: { name: 'Swiggy Instamart', emoji: '🧡', url: 'https://www.swiggy.com/instamart' },
                  bigbasket: { name: 'BigBasket', emoji: '🟢', url: 'https://www.bigbasket.com' },
                  dunzo: { name: 'Dunzo', emoji: '📦', url: 'https://www.dunzo.com' },
                }
                const selectedIds = (preferences.preferredGroceryApps && preferences.preferredGroceryApps.length > 0)
                  ? preferences.preferredGroceryApps
                  : (preferences.preferredGroceryApp ? [preferences.preferredGroceryApp] : Object.keys(appCatalog))
                return selectedIds
                  .map((id) => ({ id, ...appCatalog[id] }))
                  .filter((a) => a.name)
                  .map((app) => (
                    <button key={app.id}
                      onClick={() => { window.open(app.url, '_blank'); setShowOrderModal(false) }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer transition-smooth"
                      style={{
                        background: preferences.darkMode ? colors.elevatedSurface : '#F6F6F6',
                        border: `1px solid ${preferences.darkMode ? colors.border : '#F4F4F4'}`,
                      }}>
                      <span style={{ fontSize: '22px', lineHeight: 1, flexShrink: 0 }}>{app.emoji}</span>
                      <span className="flex-1 text-left" style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary }}>{app.name}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: colors.accentText, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Open</span>
                    </button>
                  ))
              })()}
            </div>
          </div>
        </div>
      )}

      {showAddGrocery && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-5" onClick={() => setShowAddGrocery(false)}>
          <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: colors.card }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: serifFont, fontSize: '18px', fontWeight: 400, margin: '0 0 16px 0', color: colors.textPrimary }}>Add item</h3>
            <div style={{ marginBottom: 14 }}>
              <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Item</label>
              <input type="text" value={newGroceryName} onChange={(e) => setNewGroceryName(e.target.value)} placeholder="e.g. Tomatoes" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleAddGrocery()} style={{ width: '100%', padding: '12px 16px', borderRadius: 14, border: `1.5px solid ${colors.border}`, fontSize: '15px', outline: 'none', background: 'transparent', color: colors.textPrimary }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Unit (optional)</label>
              <input type="text" value={newGroceryUnit} onChange={(e) => setNewGroceryUnit(e.target.value)} placeholder="e.g. 1 kg, 2 packs" onKeyDown={(e) => e.key === 'Enter' && handleAddGrocery()} style={{ width: '100%', padding: '12px 16px', borderRadius: 14, border: `1.5px solid ${colors.border}`, fontSize: '15px', outline: 'none', background: 'transparent', color: colors.textPrimary }} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAddGrocery(false)} className="flex-1 py-3 rounded-xl cursor-pointer outline-none" style={{ border: `1px solid ${colors.border}`, background: colors.card, fontSize: '14px', fontWeight: 600, color: colors.textTertiary }}>Cancel</button>
              <button onClick={handleAddGrocery} disabled={!newGroceryName.trim()} className="flex-1 py-3 rounded-xl border-none cursor-pointer outline-none" style={{ background: colors.accentPurple, color: '#FFF', fontSize: '14px', fontWeight: 600, opacity: newGroceryName.trim() ? 1 : 0.4 }}>Add</button>
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

function PlannerMealCard({ colors, type, meal, isDone, isSkipped: _isSkipped, onNavigate, onRotate, onSwap }: {
  colors: typeof lightColors, type: string; meal: Meal, isDone?: boolean; isSkipped?: boolean, onNavigate: () => void; onRotate: () => void; onSwap: () => void
}) {
  const [imgError, setImgError] = useState(false)
  const tertiaryActionColor = colors.pageSurface === '#121212' ? colors.accentText : colors.tertiaryAction
  const showImage = meal.image && !imgError

  return (
    <div style={{ position: 'relative', background: colors.card, borderRadius: 18, border: `1px solid ${colors.pageSurface === '#121212' ? colors.border : '#F4F4F4'}`, overflow: 'hidden', boxShadow: colors.pageSurface === '#121212' ? 'none' : '0 8px 22px rgba(27,18,18,0.06)' }}>
      <button
        onClick={(e) => { e.stopPropagation(); onRotate() }}
        className="flex items-center gap-1.5 cursor-pointer border-none outline-none bg-transparent p-0"
        style={{ position: 'absolute', top: 12, right: 14, zIndex: 2, fontSize: '13px', fontWeight: 700, color: colors.accentPurple }}
      >
        <RefreshCw size={14} strokeWidth={2.4} /> Rotate
      </button>
      <button onClick={onNavigate} className="w-full bg-transparent border-none p-0 cursor-pointer text-left outline-none">
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px', gap: '12px' }}>
          <div style={{ width: 74, height: 74, flexShrink: 0, borderRadius: 10, overflow: 'hidden', background: colors.pageSurface }}>
            {showImage ? (
              <img src={meal.image} alt={meal.name} onError={() => setImgError(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textSecondary, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
                {type.slice(0,2)}
              </div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4, gap: 6 }}>
              {isDone && (
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#FFF', background: '#5FB07A', padding: '2px 6px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Done
                </span>
              )}
              <span style={{ fontSize: '9px', fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {mealLabel[type]?.toUpperCase()}
              </span>
            </div>
            <h2 style={{ fontFamily: serifFont, fontSize: '16px', fontWeight: 400, color: colors.textPrimary, margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {meal.name}
            </h2>
            <p style={{ fontSize: '11px', color: colors.textSecondary, fontStyle: 'italic', margin: '0 0 5px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3 }}>
              {meal.ingredients.join(', ')}
            </p>
          </div>
        </div>
      </button>
      <div className="flex items-center gap-5" style={{ padding: '0 14px 10px' }}>
        <button
          onClick={onSwap}
          className="flex items-center gap-1.5 cursor-pointer border-none outline-none bg-transparent p-0"
          style={{ fontSize: '13px', fontWeight: 700, color: tertiaryActionColor }}
        >
          <Repeat2 size={14} strokeWidth={2.4} /> Change
        </button>
      </div>
    </div>
  )
}
