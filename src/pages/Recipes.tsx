import { useState } from 'react'
import { useStore, generateId, guessIngredients, detectSourceType } from '../store/useStore'
import type { Recipe, SharedRecipe } from '../store/useStore'
import BottomNav from '../components/BottomNav'
import SegmentedControl from '../components/SegmentedControl'
import { Plus, X, Link2, Sparkles, Trash2, Edit3, ExternalLink, MessageCircle, Play, Video, FileText } from 'lucide-react'

const MEAL_TYPE_FILTERS = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks']

const SourceIcon = ({ type }: { type: string }) => {
  if (type === 'youtube') return <Play size={10} style={{ color: '#D9534F' }} />
  if (type === 'instagram') return <Video size={10} style={{ color: '#E4405F' }} />
  return <FileText size={10} style={{ color: '#A09DAB' }} />
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

// Sample shared recipes for empty state
const SAMPLE_SHARED: SharedRecipe[] = [
  {
    id: 'sr1', name: 'Butter Chicken', sharedBy: 'Rahul', sourceType: 'youtube',
    link: 'https://youtube.com/watch?v=example', ingredients: ['Chicken', 'Butter', 'Cream', 'Tomato puree', 'Garam masala'],
    tags: ['Dinner', 'Cook Approved'], note: 'Cook makes this perfectly!', timestamp: Date.now() - 86400000,
    cookApproved: true, mealType: 'dinner',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80',
  },
  {
    id: 'sr2', name: 'Egg Bhurji', sharedBy: 'Priya', sourceType: 'manual',
    ingredients: ['Eggs', 'Onion', 'Tomato', 'Green chili', 'Butter'],
    tags: ['Breakfast', 'Quick'], note: 'Best with hot parathas', timestamp: Date.now() - 172800000,
    mealType: 'breakfast',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80',
  },
  {
    id: 'sr3', name: 'Pesto Pasta', sharedBy: 'Ayush', sourceType: 'instagram',
    link: 'https://instagram.com/reel/example', ingredients: ['Pasta', 'Basil pesto', 'Olive oil', 'Garlic', 'Parmesan'],
    tags: ['Dinner', 'Easy for Cook'], timestamp: Date.now() - 259200000,
    mealType: 'dinner',
    image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&q=80',
  },
]

export default function Recipes() {
  const { recipes, addRecipe, updateRecipe, deleteRecipe, sharedRecipes, addSharedRecipe, removeSharedRecipe, preferences } = useStore()
  const [activeTab, setActiveTab] = useState<'mine' | 'shared'>('mine')
  const [mealFilter, setMealFilter] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  // Form state
  const [name, setName] = useState('')
  const [link, setLink] = useState('')
  const [category, setCategory] = useState<Recipe['category']>('main')
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snacks'>('lunch')
  const [ingredients, setIngredients] = useState<string[]>([])
  const [newIngredient, setNewIngredient] = useState('')
  const [note, setNote] = useState('')

  const userName = preferences.name || 'You'

  const lightColors = {
    accent: '#3C151A',
    accentPurple: '#3C151A',
    accentLight: '#FBF5F6',
    accentBorder: '#D9D9D9',
    accentText: '#3C151A',
    surface: '#FFFFFF',
    pageSurface: '#FFFFFF',
    card: '#F6F6F6',
    border: '#F4F4F4',
    elevated: '#FBFBFB',
    textPrimary: '#111111',
    textSecondary: '#8A8A8A',
    textTertiary: '#8A8A8A',
    warmSurface: '#FBFBFB'
  }
  const darkColors = {
    accent: '#9A4D5A',
    accentPurple: '#9A4D5A',
    accentLight: 'rgba(154, 77, 90, 0.18)',
    accentBorder: '#6A2B34',
    surface: '#121212',
    pageSurface: '#121212',
    card: '#1B1B1B',
    border: '#2E2E2E',
    elevated: '#111111',
    textPrimary: '#FEFEFE',
    textSecondary: '#D6D1D3',
    textTertiary: '#A9A0A3',
    accentText: '#F0C7CF',
    warmSurface: '#111111'
  }
  const colors = preferences.darkMode ? darkColors : lightColors;


  const resetForm = () => {
    setName(''); setLink(''); setCategory('main'); setMealType('lunch');
    setIngredients([]); setNewIngredient(''); setNote(''); setEditId(null); setShowAdd(false)
  }

  const handleSave = () => {
    if (!name.trim()) return
    const ings = ingredients.length > 0 ? ingredients : guessIngredients(name)
    if (activeTab === 'shared') {
      // Sharing a recipe
      addSharedRecipe({
        id: generateId(), name: name.trim(), sharedBy: userName,
        link: link || undefined, sourceType: detectSourceType(link), ingredients: ings,
        tags: [], note: note || undefined, timestamp: Date.now(), mealType,
      })
      // Also add to personal recipes
      addRecipe({
        id: generateId(), name: name.trim(), link: link || undefined,
        ingredients: ings, category, note: note || undefined, mealType,
      })
    } else if (editId) {
      updateRecipe(editId, { name, link: link || undefined, category, ingredients: ings, note: note || undefined, mealType })
    } else {
      addRecipe({ id: generateId(), name, link: link || undefined, category, ingredients: ings, note: note || undefined, mealType })
    }
    resetForm()
  }

  const handleEdit = (recipe: Recipe) => {
    setEditId(recipe.id); setName(recipe.name); setLink(recipe.link || '');
    setCategory(recipe.category); setIngredients(recipe.ingredients);
    setNote(recipe.note || ''); setMealType(recipe.mealType || 'lunch'); setShowAdd(true)
  }

  const addIng = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()]); setNewIngredient('')
    }
  }

  // Filtering
  const filterByMealType = <T extends { mealType?: string; tags?: string[] }>(items: T[]): T[] => {
    if (mealFilter === 'All') return items
    return items.filter((r) =>
      r.mealType === mealFilter.toLowerCase() ||
      r.tags?.some(t => t.toLowerCase() === mealFilter.toLowerCase())
    )
  }

  const filteredRecipes = filterByMealType(recipes)
  const allShared = sharedRecipes.length > 0 ? sharedRecipes : SAMPLE_SHARED
  const filteredShared = filterByMealType(allShared)

  const shareOnWhatsApp = (recipe: SharedRecipe) => {
    const msg = encodeURIComponent(`*${recipe.name}*\n\nIngredients: ${recipe.ingredients.join(', ')}\n${recipe.note ? `\nNote: ${recipe.note}` : ''}\n${recipe.link ? `\nLink: ${recipe.link}` : ''}`)
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  // Fallback recipe image
  const recipeImage = (r: { image?: string; name: string }) => {
    if (r.image) return r.image
    const fallbacks = [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
    ]
    return fallbacks[r.name.length % fallbacks.length]
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: colors.pageSurface }}>
      <div className="px-5 pt-14 pb-1">
        <div className="flex items-center justify-between">
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: colors.textPrimary, margin: 0, letterSpacing: '-0.03em' }}>
            Recipes
          </h1>
          <button onClick={() => { resetForm(); setShowAdd(true) }}
            className="w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer"
            style={{ background: colors.accent, color: colors.surface }}>
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Mine / Shared Tabs */}
      <div className="px-5 mt-4 mb-3">
        <SegmentedControl
          options={[
            { value: 'mine', label: `Mine (${recipes.length})` },
            { value: 'shared', label: `Shared (${allShared.length})` },
          ]}
          value={activeTab}
          onChange={(tab) => { setActiveTab(tab); setMealFilter('All') }}
          railBackground={preferences.darkMode ? '#1B1B1B' : '#F6F6F6'}
          activeBackground={preferences.darkMode ? '#2E2E2E' : colors.surface}
          activeText={preferences.darkMode ? '#FEFEFE' : '#111111'}
          inactiveText={preferences.darkMode ? '#A9A0A3' : '#8A8A8A'}
        />
      </div>

      {/* Meal type filter chips */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {MEAL_TYPE_FILTERS.map((chip) => (
            <button key={chip} onClick={() => setMealFilter(chip)}
              className="px-3.5 py-1.5 rounded-full border cursor-pointer transition-smooth whitespace-nowrap"
              style={{
                background: mealFilter === chip ? (preferences.darkMode ? 'rgba(154, 77, 90, 0.18)' : '#FBF5F6') : 'transparent',
                color: mealFilter === chip ? (preferences.darkMode ? '#F0C7CF' : '#111111') : (preferences.darkMode ? '#FEFEFE' : '#111111'),
                borderColor: mealFilter === chip ? 'transparent' : (preferences.darkMode ? '#2E2E2E' : colors.border),
                fontSize: '12px', fontWeight: 600,
              }}>
              {chip}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5">
        {/* ===== MINE TAB ===== */}
        {activeTab === 'mine' && (
          <>
            {filteredRecipes.length === 0 ? (
              <div className="text-center py-16">
                <div style={{ fontSize: '48px', marginBottom: 12 }}>📖</div>
                <p style={{ fontSize: '15px', fontWeight: 600, color: colors.textPrimary, margin: '0 0 4px 0' }}>
                  {recipes.length === 0 ? 'No recipes yet' : 'No matches'}
                </p>
                <p style={{ fontSize: '13px', color: colors.textSecondary }}>
                  {recipes.length === 0 ? 'Save your first recipe to get started' : 'Try a different filter'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRecipes.map((recipe) => (
                  <div key={recipe.id} className="card overflow-hidden">
                    {/* Image */}
                    <div style={{ height: 140, overflow: 'hidden' }}>
                      <img src={recipeImage(recipe)} alt={recipe.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div className="p-3.5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: colors.textPrimary }}>{recipe.name}</h3>
                            <span className={recipe.category === 'main' ? 'chip chip-accent' : 'chip'}
                              style={{ fontSize: '9px', padding: '2px 7px' }}>
                              {recipe.category}
                            </span>
                          </div>
                          {recipe.note && (
                            <p style={{ fontSize: '12px', color: colors.textTertiary, margin: '0 0 4px 0', fontStyle: 'italic' }}>
                              "{recipe.note}"
                            </p>
                          )}
                          <p style={{ fontSize: '11px', color: colors.textSecondary, margin: 0 }} className="line-clamp-1">
                            {recipe.ingredients.join(' · ')}
                          </p>
                        </div>
                        <div className="flex gap-0.5 ml-2">
                          <button onClick={() => handleEdit(recipe)}
                            className="p-1.5 rounded-lg bg-transparent border-none cursor-pointer" style={{ color: colors.textSecondary }}>
                            <Edit3 size={13} />
                          </button>
                          <button onClick={() => deleteRecipe(recipe.id)}
                            className="p-1.5 rounded-lg bg-transparent border-none cursor-pointer" style={{ color: '#D9534F' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      {recipe.link && (
                        <a href={recipe.link} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 no-underline mt-2"
                          style={{ fontSize: '12px', color: colors.accent, fontWeight: 500 }}>
                          <ExternalLink size={10} /> View source
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ===== SHARED TAB ===== */}
        {activeTab === 'shared' && (
          <div className="space-y-3">
            {filteredShared.length === 0 ? (
              <div className="text-center py-16">
                <div style={{ fontSize: '48px', marginBottom: 12 }}>👥</div>
                <p style={{ fontSize: '15px', fontWeight: 600, color: colors.textPrimary, margin: '0 0 4px 0' }}>No shared recipes</p>
                <p style={{ fontSize: '13px', color: colors.textSecondary }}>Share your first recipe with flatmates</p>
              </div>
            ) : (
              filteredShared.map((recipe) => (
                <div key={recipe.id} className="card overflow-hidden">
                  {recipe.image && (
                    <div style={{ height: 140, overflow: 'hidden' }}>
                      <img src={recipe.image} alt={recipe.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div className="p-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div style={{
                          width: 24, height: 24, borderRadius: 12, background: colors.accentLight,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '10px', fontWeight: 700, color: colors.accent,
                        }}>
                          {recipe.sharedBy.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: colors.textPrimary }}>{recipe.sharedBy}</span>
                        <span style={{ fontSize: '10px', color: colors.textSecondary }}>{timeAgo(recipe.timestamp)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <SourceIcon type={recipe.sourceType} />
                        <span style={{ fontSize: '9px', color: colors.textSecondary, textTransform: 'capitalize' }}>{recipe.sourceType}</span>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: colors.textPrimary, margin: '0 0 4px 0' }}>
                      {recipe.name}
                    </h3>

                    {recipe.note && (
                      <p style={{ fontSize: '12px', color: colors.textTertiary, margin: '0 0 6px 0', fontStyle: 'italic' }}>
                        "{recipe.note}"
                      </p>
                    )}

                    {recipe.cookApproved && (
                      <span className="chip" style={{ background: '#EBF7EF', color: '#5FB07A', fontWeight: 600, fontSize: '9px', marginBottom: 6, display: 'inline-flex' }}>
                        Cook Approved
                      </span>
                    )}

                    <p style={{ fontSize: '11px', color: colors.textSecondary, margin: '0 0 10px 0' }} className="line-clamp-1">
                      {recipe.ingredients.join(' · ')}
                    </p>

                    <div className="flex gap-2">
                      <button onClick={() => {
                        addRecipe({
                          id: generateId(), name: recipe.name, link: recipe.link,
                          ingredients: recipe.ingredients, category: 'main',
                          note: recipe.note, mealType: recipe.mealType,
                          image: recipe.image,
                        })
                      }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-none cursor-pointer"
                        style={{ background: colors.accentLight, color: colors.accent, fontSize: '12px', fontWeight: 600 }}>
                        Use this meal
                      </button>
                      <button onClick={() => shareOnWhatsApp(recipe)}
                        className="flex items-center justify-center px-3 py-2.5 rounded-xl border-none cursor-pointer"
                        style={{ background: '#EBF7EF', color: '#5FB07A' }}>
                        <MessageCircle size={14} />
                      </button>
                      {recipe.sharedBy === userName && (
                        <button onClick={() => removeSharedRecipe(recipe.id)}
                          className="flex items-center justify-center px-3 py-2.5 rounded-xl border-none cursor-pointer"
                          style={{ background: '#FEF2F2', color: '#D9534F' }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-5" onClick={resetForm}>
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: colors.textPrimary }}>
                {editId ? 'Edit recipe' : activeTab === 'shared' ? 'Share a recipe' : 'New recipe'}
              </h3>
              <button onClick={resetForm}
                className="w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer"
                style={{ background: colors.border }}>
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Recipe name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Chicken Biryani" autoFocus
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 14,
                    border: '1.5px solid #EAE4DC', fontSize: '15px', outline: 'none',
                  }}
                  onFocus={(e) => e.target.style.borderColor = colors.accentBorder}
                  onBlur={(e) => e.target.style.borderColor = colors.border} />
              </div>

              <div>
                <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Source link (optional)</label>
                <div className="flex items-center gap-2">
                  <Link2 size={16} style={{ color: colors.textSecondary, flexShrink: 0 }} />
                  <input type="url" value={link} onChange={(e) => setLink(e.target.value)}
                    placeholder="YouTube or Instagram link"
                    style={{
                      flex: 1, padding: '12px 16px', borderRadius: 14,
                      border: '1.5px solid #EAE4DC', fontSize: '14px', outline: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = colors.accentBorder}
                    onBlur={(e) => e.target.style.borderColor = colors.border} />
                </div>
              </div>

              <div>
                <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Meal type</label>
                <div className="flex gap-2 flex-wrap">
                  {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((mt) => (
                    <button key={mt} onClick={() => setMealType(mt)}
                      className="px-3.5 py-2 rounded-xl border cursor-pointer transition-smooth"
                      style={{
                        background: mealType === mt ? colors.accentLight : colors.surface,
                        borderColor: mealType === mt ? colors.accentBorder : colors.border, borderWidth: '1.5px',
                        color: mealType === mt ? colors.accent : colors.textTertiary, fontSize: '12px', fontWeight: 600,
                      }}>
                      {mt.charAt(0).toUpperCase() + mt.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Note (optional)</label>
                <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Cook makes this perfectly"
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 14,
                    border: '1.5px solid #EAE4DC', fontSize: '14px', outline: 'none',
                  }}
                  onFocus={(e) => e.target.style.borderColor = colors.accentBorder}
                  onBlur={(e) => e.target.style.borderColor = colors.border} />
              </div>

              <button onClick={() => name.trim() && setIngredients(guessIngredients(name))}
                disabled={!name.trim()}
                className="w-full py-2.5 rounded-xl border cursor-pointer bg-transparent flex items-center justify-center gap-2"
                style={{
                  borderColor: colors.accentBorder, borderStyle: 'dashed', borderWidth: '1.5px',
                  color: colors.accent, fontSize: '13px', fontWeight: 600, opacity: name.trim() ? 1 : 0.4,
                }}>
                <Sparkles size={14} /> AI Generate Ingredients
              </button>

              <div>
                <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Ingredients</label>
                <div className="flex gap-2">
                  <input type="text" value={newIngredient} onChange={(e) => setNewIngredient(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addIng()} placeholder="Add ingredient"
                    style={{
                      flex: 1, padding: '10px 14px', borderRadius: 12,
                      border: '1.5px solid #EAE4DC', fontSize: '14px', outline: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = colors.accentBorder}
                    onBlur={(e) => e.target.style.borderColor = colors.border} />
                  <button onClick={addIng}
                    className="px-4 py-2 rounded-xl border-none cursor-pointer"
                    style={{ background: colors.border, fontSize: '13px', fontWeight: 600, color: colors.textTertiary }}>Add</button>
                </div>
                {ingredients.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {ingredients.map((ing, i) => (
                      <span key={i} className="chip flex items-center gap-1">
                        {ing}
                        <button onClick={() => setIngredients(ingredients.filter((_, j) => j !== i))}
                          className="bg-transparent border-none cursor-pointer p-0 flex items-center"><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={handleSave} disabled={!name.trim()}
                className="w-full py-3.5 rounded-xl border-none cursor-pointer"
                style={{ background: colors.accent, color: colors.surface, fontSize: '14px', fontWeight: 600, opacity: name.trim() ? 1 : 0.4 }}>
                {editId ? 'Update' : activeTab === 'shared' ? 'Share recipe' : 'Save recipe'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
