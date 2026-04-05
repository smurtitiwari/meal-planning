import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, DAYS, DEFAULT_MEALS, generateId } from '../store/useStore'
import type { Meal } from '../store/useStore'
import BottomNav from '../components/BottomNav'
import { X, Plus, Check, ShoppingCart, Trash2, Clock, Flame, RefreshCw } from 'lucide-react'

const mealLabel: Record<string, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' }

export default function Planner() {
  const navigate = useNavigate()
  const { weeklyPlan, initWeeklyPlan, rotateMeal, setDayPlan, groceryList, addGroceryItem, toggleGroceryItem, removeGroceryItem, generateGroceryForDate, generateWeeklyGrocery, preferences } = useStore()
  const [selectedDate, setSelectedDate] = useState('')
  const [swapModal, setSwapModal] = useState<{ date: string; type: 'breakfast' | 'lunch' | 'dinner' } | null>(null)
  const [activeTab, setActiveTab] = useState<'meals' | 'grocery'>('meals')
  const [showAddGrocery, setShowAddGrocery] = useState(false)
  const [newGroceryName, setNewGroceryName] = useState('')

  useEffect(() => { initWeeklyPlan() }, [initWeeklyPlan])
  useEffect(() => {
    if (weeklyPlan.length > 0 && !selectedDate) {
      const today = new Date().toISOString().split('T')[0]
      setSelectedDate(weeklyPlan.find((d) => d.date === today)?.date || weeklyPlan[0].date)
    }
  }, [weeklyPlan, selectedDate])

  const selectedPlan = useMemo(() => weeklyPlan.find((d) => d.date === selectedDate), [weeklyPlan, selectedDate])

  const handleSwap = (meal: Meal) => {
    if (swapModal) { setDayPlan(swapModal.date, { [swapModal.type]: meal }); setSwapModal(null) }
  }

  const unchecked = useMemo(() => groceryList.filter((g) => !g.checked), [groceryList])
  const checked = useMemo(() => groceryList.filter((g) => g.checked), [groceryList])

  const handleAddGrocery = () => {
    if (newGroceryName.trim()) {
      addGroceryItem({ id: generateId(), name: newGroceryName.trim(), checked: false })
      setNewGroceryName('')
      setShowAddGrocery(false)
    }
  }

  const getGroceryUrl = () => {
    const urls: Record<string, string> = { blinkit: 'https://blinkit.com', zepto: 'https://www.zeptonow.com', swiggy: 'https://www.swiggy.com/instamart', bigbasket: 'https://www.bigbasket.com', dunzo: 'https://www.dunzo.com' }
    return urls[preferences.preferredGroceryApp] || urls.blinkit
  }

  const mealTypes: ('breakfast' | 'lunch' | 'dinner')[] = ['breakfast', 'lunch', 'dinner']

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F7F3EE' }}>
      <div className="px-5 pt-14 pb-2">
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1F1E2E', margin: 0, letterSpacing: '-0.03em' }}>
          Meal Plan
        </h1>
        <p style={{ fontSize: '13px', color: '#A09DAB', margin: '2px 0 0 0' }}>Plan your week, eat better</p>
      </div>

      {/* Tabs */}
      <div className="px-5 mt-4 mb-3">
        <div className="flex p-1 rounded-xl" style={{ background: '#EFE9E0' }}>
          {(['meals', 'grocery'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 rounded-lg border-none cursor-pointer transition-smooth"
              style={{
                background: activeTab === tab ? '#FFF' : 'transparent',
                color: activeTab === tab ? '#1F1E2E' : '#A09DAB',
                fontSize: '13px', fontWeight: 600,
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              }}>
              {tab === 'meals' ? 'Meals' : `Grocery (${unchecked.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Day Selector */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {weeklyPlan.map((day, i) => {
            const d = new Date(day.date + 'T00:00:00')
            const isToday = day.date === new Date().toISOString().split('T')[0]
            const isSel = day.date === selectedDate
            return (
              <button key={day.date} onClick={() => setSelectedDate(day.date)}
                className="flex flex-col items-center min-w-[46px] py-2 px-2 rounded-2xl cursor-pointer transition-smooth"
                style={{
                  background: isSel ? '#26233A' : 'transparent',
                  color: isSel ? '#FFF' : '#1F1E2E',
                  border: isSel ? 'none' : '1px solid #EAE4DC',
                }}>
                <span style={{ fontSize: '10px', fontWeight: 600, opacity: 0.6, textTransform: 'uppercase' }}>
                  {DAYS[i]}
                </span>
                <span style={{ fontSize: '18px', fontWeight: 800, marginTop: 1 }}>{d.getDate()}</span>
                {isToday && !isSel && <div style={{ width: 4, height: 4, borderRadius: 2, background: '#B8A6E6', marginTop: 2 }} />}
              </button>
            )
          })}
        </div>
      </div>

      {activeTab === 'meals' ? (
        <div className="px-5 space-y-3">
          {selectedPlan && mealTypes.map((type) => {
            const meal = selectedPlan[type]
            if (!meal) return null
            const isSkipped = selectedPlan.skipped?.[type]
            const isDone = selectedPlan.done?.[type]

            return (
              <div key={type} className="card p-0 overflow-hidden" style={{ opacity: isSkipped ? 0.5 : 1 }}>
                <button
                  onClick={() => navigate(`/meal/${selectedDate}/${type}`)}
                  className="w-full flex items-center gap-3 p-3 text-left bg-transparent border-none cursor-pointer"
                >
                  <div style={{ width: 80, height: 80, borderRadius: 16, overflow: 'hidden', flexShrink: 0 }}>
                    <img src={meal.image} alt={meal.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="section-label" style={{ margin: 0 }}>{mealLabel[type]}</span>
                      {isDone && <span style={{ fontSize: '10px', color: '#5FB07A', fontWeight: 600 }}>Done</span>}
                      {isSkipped && <span style={{ fontSize: '10px', color: '#A09DAB', fontWeight: 600 }}>Skipped</span>}
                    </div>
                    <p style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 3px 0', color: '#1F1E2E' }}>{meal.name}</p>
                    <div className="flex items-center gap-3">
                      {meal.cookTime && (
                        <span className="flex items-center gap-1" style={{ fontSize: '11px', color: '#A09DAB' }}>
                          <Clock size={10} /> {meal.cookTime}
                        </span>
                      )}
                      {meal.calories && (
                        <span style={{ fontSize: '11px', color: '#A09DAB' }}>{meal.calories} kcal</span>
                      )}
                    </div>
                  </div>
                </button>

                {/* Action strip */}
                <div className="flex border-t" style={{ borderColor: '#EAE4DC' }}>
                  <button onClick={() => rotateMeal(selectedDate, type)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-transparent border-none cursor-pointer"
                    style={{ fontSize: '11px', fontWeight: 600, color: '#7A768A' }}>
                    <RefreshCw size={12} /> Rotate
                  </button>
                  <div style={{ width: 1, background: '#EAE4DC' }} />
                  <button onClick={() => setSwapModal({ date: selectedDate, type })}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-transparent border-none cursor-pointer"
                    style={{ fontSize: '11px', fontWeight: 600, color: '#8B74D3' }}>
                    Change
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ===== GROCERY TAB ===== */
        <div className="px-5">
          <div className="flex gap-2 mb-4">
            <button onClick={() => generateWeeklyGrocery()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-none cursor-pointer"
              style={{ background: '#26233A', color: '#FFF', fontSize: '13px', fontWeight: 600 }}>
              <ShoppingCart size={14} /> Generate full week
            </button>
            <button onClick={() => setShowAddGrocery(true)}
              className="w-11 h-11 rounded-xl flex items-center justify-center border cursor-pointer"
              style={{ background: '#FFF', borderColor: '#EAE4DC', color: '#1F1E2E' }}>
              <Plus size={18} />
            </button>
          </div>

          {unchecked.length > 0 && (
            <div className="mb-5">
              <p className="section-label" style={{ margin: '0 0 10px 0' }}>To buy ({unchecked.length})</p>
              <div className="space-y-1.5">
                {unchecked.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-4 py-3 rounded-xl card">
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleGroceryItem(item.id)}
                        className="w-5 h-5 rounded-md flex items-center justify-center cursor-pointer"
                        style={{ border: '2px solid #EAE4DC', background: 'transparent' }} />
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#1F1E2E' }}>{item.name}</span>
                    </div>
                    <button onClick={() => removeGroceryItem(item.id)}
                      className="bg-transparent border-none cursor-pointer p-1" style={{ color: '#D5D1DC' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {checked.length > 0 && (
            <div className="mb-4">
              <p className="section-label" style={{ margin: '0 0 10px 0' }}>Done ({checked.length})</p>
              <div className="space-y-1.5">
                {checked.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: '#EFE9E0' }}>
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleGroceryItem(item.id)}
                        className="w-5 h-5 rounded-md flex items-center justify-center cursor-pointer border-none"
                        style={{ background: '#5FB07A' }}>
                        <Check size={11} color="#FFF" />
                      </button>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#A09DAB', textDecoration: 'line-through' }}>{item.name}</span>
                    </div>
                    <button onClick={() => removeGroceryItem(item.id)}
                      className="bg-transparent border-none cursor-pointer p-1" style={{ color: '#D5D1DC' }}>
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {groceryList.length === 0 && (
            <div className="text-center py-16">
              <div style={{ fontSize: '48px', marginBottom: 12 }}>🛒</div>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#1F1E2E', margin: '0 0 4px 0' }}>No items yet</p>
              <p style={{ fontSize: '13px', color: '#A09DAB' }}>Generate from your weekly plan</p>
            </div>
          )}

          {unchecked.length > 0 && (
            <button onClick={() => window.open(getGroceryUrl(), '_blank')}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl cursor-pointer mt-2"
              style={{ background: '#FFF', color: '#1F1E2E', border: '1px solid #EAE4DC', fontSize: '14px', fontWeight: 600 }}>
              <ShoppingCart size={15} />
              Order on {preferences.preferredGroceryApp ? preferences.preferredGroceryApp.charAt(0).toUpperCase() + preferences.preferredGroceryApp.slice(1) : 'Blinkit'}
            </button>
          )}
        </div>
      )}

      {/* Swap Bottom Sheet */}
      {swapModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={() => setSwapModal(null)}>
          <div className="w-full max-w-md mx-auto bg-white rounded-t-3xl max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#1F1E2E' }}>
                Replace {mealLabel[swapModal.type].toLowerCase()}
              </h3>
              <button onClick={() => setSwapModal(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer"
                style={{ background: '#EFE9E0' }}>
                <X size={16} />
              </button>
            </div>
            <div className="px-5 pb-8 space-y-2">
              {DEFAULT_MEALS[swapModal.type].map((meal) => {
                const current = selectedPlan?.[swapModal.type]
                return (
                  <button key={meal.id} onClick={() => handleSwap(meal)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl cursor-pointer bg-white border transition-smooth"
                    style={{
                      borderColor: meal.id === current?.id ? '#B8A6E6' : '#EAE4DC',
                      borderWidth: meal.id === current?.id ? 2 : 1,
                    }}>
                    <div style={{ width: 56, height: 56, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                      <img src={meal.image} alt={meal.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div className="flex-1 text-left">
                      <p style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 2px 0', color: '#1F1E2E' }}>{meal.name}</p>
                      <div className="flex items-center gap-2">
                        {meal.cookTime && (
                          <span style={{ fontSize: '11px', color: '#A09DAB' }}>{meal.cookTime}</span>
                        )}
                        {meal.calories && (
                          <span style={{ fontSize: '11px', color: '#A09DAB' }}>{meal.calories} kcal</span>
                        )}
                      </div>
                    </div>
                    {meal.id === current?.id && (
                      <div style={{ width: 22, height: 22, borderRadius: 11, background: '#B8A6E6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={13} color="#FFF" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Grocery Modal */}
      {showAddGrocery && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-5"
          onClick={() => setShowAddGrocery(false)}>
          <div className="w-full max-w-sm bg-white rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0', color: '#1F1E2E' }}>Add item</h3>
            <input type="text" value={newGroceryName} onChange={(e) => setNewGroceryName(e.target.value)}
              placeholder="e.g. Tomatoes" autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddGrocery()}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 14,
                border: '1.5px solid #EAE4DC', fontSize: '15px', outline: 'none', marginBottom: 16,
              }}
              onFocus={(e) => e.target.style.borderColor = '#B8A6E6'}
              onBlur={(e) => e.target.style.borderColor = '#EAE4DC'} />
            <div className="flex gap-2">
              <button onClick={() => setShowAddGrocery(false)}
                className="flex-1 py-3 rounded-xl cursor-pointer"
                style={{ border: '1px solid #EAE4DC', background: '#FFF', fontSize: '14px', fontWeight: 600, color: '#7A768A' }}>
                Cancel
              </button>
              <button onClick={handleAddGrocery} disabled={!newGroceryName.trim()}
                className="flex-1 py-3 rounded-xl border-none cursor-pointer"
                style={{ background: '#26233A', color: '#FFF', fontSize: '14px', fontWeight: 600, opacity: newGroceryName.trim() ? 1 : 0.4 }}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
