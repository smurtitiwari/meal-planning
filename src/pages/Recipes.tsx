import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore, generateId, guessIngredients, detectSourceType } from '../store/useStore'
import type { Recipe } from '../store/useStore'
import BottomNav from '../components/BottomNav'
import SegmentedControl from '../components/SegmentedControl'
import { Plus, X, Link2, Sparkles, Trash2, UtensilsCrossed, Check, BookOpen, Users } from 'lucide-react'

const MEAL_TYPE_FILTERS = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks']
const serifFont = "'DM Serif Display', Georgia, serif"

export default function Recipes() {
  const navigate = useNavigate()
  const location = useLocation()
  const { recipes, addRecipe, updateRecipe, deleteRecipe, sharedRecipes, addSharedRecipe, preferences, groups } = useStore()
  const [activeTab, setActiveTab] = useState<'mine' | 'shared'>('mine')
  const [mealFilter, setMealFilter] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [showTypePicker, setShowTypePicker] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Form state
  const [name, setName] = useState('')
  const [link, setLink] = useState('')
  const [category, setCategory] = useState<Recipe['category']>('main')
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snacks'>('lunch')
  const [ingredients, setIngredients] = useState<string[]>([])
  const [newIngredient, setNewIngredient] = useState('')
  const [note, setNote] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<string>(preferences.groupId || '')

  const userName = preferences.name || 'You'

  // Helper: look up group name by id
  const groupName = (id?: string) => groups.find((g) => g.id === id)?.name || ''

  const lightColors = {
    accent: '#4A1F23',
    accentPurple: '#4A1F23',
    accentLight: 'rgba(74, 31, 35, 0.06)',
    accentBorder: 'rgba(74, 31, 35, 0.22)',
    accentText: '#4A1F23',
    surface: '#F7F4EF',
    pageSurface: '#F7F4EF',
    card: '#FFFFFF',
    border: '#E6E0D8',
    elevated: '#F2EEE9',
    textPrimary: '#1C1B1F',
    textSecondary: '#6F6B73',
    textTertiary: '#6F6B73',
    warmSurface: '#F2EEE9'
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
  const colors = preferences.darkMode ? darkColors : lightColors

  const resetForm = () => {
    setName(''); setLink(''); setCategory('main'); setMealType('lunch');
    setIngredients([]); setNewIngredient(''); setNote(''); setEditId(null); setShowAdd(false)
  }

  // Handle edit requests coming from RecipeDetail
  useEffect(() => {
    if ((location.state as any)?.editRecipe) {
      const r = (location.state as any).editRecipe
      handleEdit(r)
      window.history.replaceState({}, document.title)
    }
    if ((location.state as any)?.openNewRecipe) {
      const type = (location.state as any).openNewRecipe
      pickType(type)
      window.history.replaceState({}, document.title)
    }
    if ((location.state as any)?.openTypePicker) {
      if ((location.state as any)?.groupId) {
        setSelectedGroupId((location.state as any).groupId)
      }
      openTypePicker()
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const openTypePicker = () => {
    resetForm()
    setShowTypePicker(true)
  }

  const pickType = (type: 'mine' | 'shared') => {
    setActiveTab(type)
    setShowTypePicker(false)
    setShowAdd(true)
  }

  const handleSave = () => {
    if (!name.trim()) return
    const ings = ingredients.length > 0 ? ingredients : guessIngredients(name)
    if (activeTab === 'shared') {
      addSharedRecipe({
        id: generateId(), groupId: selectedGroupId || preferences.groupId || undefined, name: name.trim(), sharedBy: userName,
        link: link || undefined, sourceType: detectSourceType(link), ingredients: ings,
        tags: [], note: note || undefined, timestamp: Date.now(), mealType,
      })
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

  const filterByMealTypeAndSearch = <T extends { name: string; ingredients?: string[]; mealType?: string; tags?: string[] }>(items: T[]): T[] => {
    return items.filter((r) => {
      const matchMeal = mealFilter === 'All' || r.mealType?.toLowerCase() === mealFilter.toLowerCase() || r.tags?.some(t => t.toLowerCase() === mealFilter.toLowerCase());
      const query = searchQuery.toLowerCase();
      const matchSearch = !query || r.name.toLowerCase().includes(query) || (r.ingredients && r.ingredients.some(i => i.toLowerCase().includes(query)));
      return matchMeal && matchSearch;
    })
  }

  const filteredRecipes = filterByMealTypeAndSearch(recipes)
  const groupSharedRecipes = preferences.groupId
    ? sharedRecipes.filter((recipe) => recipe.groupId === preferences.groupId)
    : []
  const allShared = groupSharedRecipes
  const filteredShared = filterByMealTypeAndSearch(allShared)

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
          <h1 style={{ fontFamily: serifFont, fontSize: '32px', fontWeight: 400, color: colors.textPrimary, margin: 0, lineHeight: 1.1 }}>
            Recipes
          </h1>
          <button onClick={openTypePicker}
            className="w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer"
            style={{ background: colors.accentPurple, color: '#FFF' }}>
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="px-5 mt-4 mb-3">
        <SegmentedControl
          options={[
            { value: 'mine', label: `Mine (${recipes.length})` },
            { value: 'shared', label: `Shared (${allShared.length})` },
          ]}
          value={activeTab}
          onChange={(tab) => { setActiveTab(tab); setMealFilter('All') }}
          railBackground={preferences.darkMode ? '#1B1B1B' : '#F2EEE9'}
          activeBackground={preferences.darkMode ? '#2E2E2E' : '#FFFFFF'}
          activeText={preferences.darkMode ? '#FEFEFE' : '#1C1B1F'}
          inactiveText={preferences.darkMode ? '#A9A0A3' : '#6F6B73'}
          activeBorder={preferences.darkMode ? '#3A3A3A' : '#E6E0D8'}
          inactiveBorder={preferences.darkMode ? 'rgba(255,255,255,0.08)' : '#E6E0D8'}
        />
      </div>

      <div className="px-5 mb-3">
        <input 
          type="search" 
          placeholder="Search recipes or ingredients..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '10px 16px', borderRadius: 14, border: `1px solid ${colors.border}`, background: preferences.darkMode ? 'transparent' : '#FFFFFF', outline: 'none', color: colors.textPrimary, fontSize: '14px' }}
        />
      </div>

      {/* Meal type filter chips */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {MEAL_TYPE_FILTERS.map((chip) => {
            const isSel = mealFilter === chip
            return (
              <button key={chip} onClick={() => setMealFilter(chip)}
                className="px-3.5 py-1.5 rounded-full cursor-pointer transition-smooth whitespace-nowrap outline-none"
                style={{
                  background: isSel
                    ? (preferences.darkMode ? 'rgba(154, 77, 90, 0.18)' : 'rgba(74, 31, 35, 0.06)')
                    : (preferences.darkMode ? '#1B1B1B' : '#FFFFFF'),
                  color: isSel
                    ? (preferences.darkMode ? '#F0C7CF' : '#4A1F23')
                    : colors.textPrimary,
                  border: isSel
                    ? `1.5px solid ${preferences.darkMode ? 'rgba(240, 199, 207, 0.4)' : 'rgba(74, 31, 35, 0.22)'}`
                    : `1px solid ${colors.border}`,
                  fontSize: '12px',
                  fontWeight: isSel ? 700 : 600,
                }}>
                {chip}
              </button>
            )
          })}
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
              <div className="space-y-4">
                {filteredRecipes.map((recipe) => (
                  <div key={recipe.id} style={{
                    background: colors.card, border: `1px solid ${colors.border}`,
                    borderRadius: 16, display: 'flex', alignItems: 'stretch', padding: '12px', gap: '12px', position: 'relative',
                  }}>
                    <button onClick={() => navigate(`/recipe/${recipe.id}`)} className="absolute inset-0 w-full h-full border-none bg-transparent cursor-pointer z-0 outline-none" aria-label={`View ${recipe.name}`}></button>
                    <div style={{ width: 80, height: 80, flexShrink: 0, borderRadius: 14, overflow: 'hidden', background: colors.surface, zIndex: 1, pointerEvents: 'none' }}>
                      <img src={recipeImage(recipe)} alt={recipe.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1, pointerEvents: 'none' }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <UtensilsCrossed size={12} color={colors.textSecondary} />
                        <span style={{ fontSize: '10px', fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recipe</span>
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0', color: colors.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{recipe.name}</h3>
                      {recipe.note && (
                        <p style={{ fontSize: '12px', color: colors.textTertiary, margin: '0 0 4px 0', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          "{recipe.note}"
                        </p>
                      )}
                      <p style={{ fontSize: '11px', color: colors.textSecondary, margin: '0 0 6px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {recipe.ingredients.join(', ')}
                      </p>
                      <div className="flex items-center gap-3 mt-auto" style={{ pointerEvents: 'auto' }}>
                        <button onClick={(e) => { e.stopPropagation(); deleteRecipe(recipe.id) }} className="flex items-center gap-1.5 p-0 bg-transparent border-none cursor-pointer outline-none" style={{ color: '#D9534F', fontSize: '12px', fontWeight: 600 }}>
                          <Trash2 size={12} /> Remove recipe
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ===== SHARED TAB ===== */}
        {activeTab === 'shared' && (
          <div className="space-y-4">
            {filteredShared.length === 0 ? (
              <div className="text-center py-16">
                <div style={{ fontSize: '48px', marginBottom: 12 }}>👥</div>
                <p style={{ fontSize: '15px', fontWeight: 600, color: colors.textPrimary, margin: '0 0 4px 0' }}>No shared recipes</p>
                <p style={{ fontSize: '13px', color: colors.textSecondary }}>Share your first recipe with friends</p>
              </div>
            ) : (
              filteredShared.map((recipe) => (
                <div key={recipe.id} style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '12px', gap: '12px', position: 'relative' }}>
                    <button onClick={() => navigate(`/recipe/${recipe.id}`, { state: { recipe: { ...recipe, source: 'shared' } } })} className="absolute inset-0 w-full h-full border-none bg-transparent cursor-pointer z-0 outline-none" aria-label={`View ${recipe.name}`}></button>
                    <div style={{ width: 80, height: 80, flexShrink: 0, borderRadius: 14, overflow: 'hidden', background: colors.surface, zIndex: 1, pointerEvents: 'none' }}>
                      <img src={recipe.image || recipeImage(recipe)} alt={recipe.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1, pointerEvents: 'none' }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div style={{ width: 20, height: 20, borderRadius: 10, background: colors.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: colors.accentPurple }}>
                            {recipe.sharedBy.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: colors.textPrimary }}>{recipe.sharedBy}</span>
                        </div>
                        {recipe.groupId && groupName(recipe.groupId) && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            background: colors.accentLight, color: colors.accentPurple,
                            fontSize: '10px', fontWeight: 700,
                            padding: '2px 7px', borderRadius: 999,
                          }}>
                            <Users size={9} />
                            {groupName(recipe.groupId)}
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 2px 0', color: colors.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {recipe.name}
                      </h3>
                      <p style={{ fontSize: '11px', color: colors.textSecondary, margin: '0 0 4px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {recipe.ingredients.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div style={{ padding: '2px 14px 10px', display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'flex-start' }}>
                    <button onClick={() => {
                        addRecipe({
                          id: generateId(), name: recipe.name, link: recipe.link,
                          ingredients: recipe.ingredients, category: 'main',
                          note: recipe.note, mealType: recipe.mealType,
                          image: recipe.image,
                        })
                        setToast('Recipe added to your collection.')
                        setTimeout(() => setToast(null), 2200)
                      }}
                      className="flex items-center gap-1.5 cursor-pointer border-none outline-none bg-transparent p-0"
                      style={{ color: colors.accentPurple, fontSize: '13px', fontWeight: 700 }}>
                      <Plus size={14} strokeWidth={2.5} />
                      Add to My Recipes
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Type picker bottom sheet (Mine / Shared) ── */}
      {showTypePicker && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.42)' }}
          onClick={() => setShowTypePicker(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md animate-slide-up"
            style={{
              background: colors.pageSurface,
              borderRadius: '24px 24px 0 0',
              padding: '22px 22px 28px',
              boxShadow: '0 -12px 40px rgba(0,0,0,0.18)',
            }}
          >
            <div style={{ width: 40, height: 4, borderRadius: 2, background: preferences.darkMode ? '#2E2E2E' : '#F4F4F4', margin: '0 auto 18px' }} />
            <h3 style={{ fontFamily: serifFont, fontSize: '22px', fontWeight: 400, color: colors.textPrimary, margin: '0 0 4px 0', lineHeight: 1.15 }}>
              New recipe
            </h3>
            <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '0 0 18px 0' }}>
              Choose where to add this recipe.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => pickType('mine')}
                className="w-full flex items-center cursor-pointer border-none outline-none text-left"
                style={{
                  background: preferences.darkMode ? '#1B1B1B' : '#FFFFFF',
                  border: `1px solid ${colors.border}`,
                  borderRadius: 16,
                  padding: '16px 16px',
                  gap: 14,
                  minHeight: 64,
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'rgba(74, 31, 35, 0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: colors.accentPurple, flexShrink: 0,
                }}>
                  <BookOpen size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary, margin: 0, lineHeight: 1.2 }}>
                    My recipe
                  </p>
                  <p style={{ fontSize: '12px', color: colors.textSecondary, margin: '3px 0 0 0', lineHeight: 1.3 }}>
                    Save to your personal collection.
                  </p>
                </div>
              </button>

              <button
                onClick={() => pickType('shared')}
                className="w-full flex items-center cursor-pointer border-none outline-none text-left"
                style={{
                  background: preferences.darkMode ? '#1B1B1B' : '#FFFFFF',
                  border: `1px solid ${colors.border}`,
                  borderRadius: 16,
                  padding: '16px 16px',
                  gap: 14,
                  minHeight: 64,
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'rgba(74, 31, 35, 0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: colors.accentPurple, flexShrink: 0,
                }}>
                  <Users size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: colors.textPrimary, margin: 0, lineHeight: 1.2 }}>
                    Shared recipe
                  </p>
                  <p style={{ fontSize: '12px', color: colors.textSecondary, margin: '3px 0 0 0', lineHeight: 1.3 }}>
                    Share with friends & also save to yours.
                  </p>
                </div>
              </button>

              {/* Group picker — shown only when user has groups */}
              {groups.length > 0 && (
                <div style={{ marginTop: 4 }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '4px 0 8px 2px' }}>
                    Share to group
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {groups.map((g) => {
                      const sel = selectedGroupId === g.id
                      return (
                        <button
                          key={g.id}
                          onClick={() => setSelectedGroupId(g.id)}
                          className="w-full flex items-center gap-3 cursor-pointer border-none outline-none text-left"
                          style={{
                            background: sel ? colors.accentLight : (preferences.darkMode ? '#1B1B1B' : '#FFFFFF'),
                            border: sel
                              ? `1.5px solid ${preferences.darkMode ? 'rgba(240,199,207,0.4)' : 'rgba(74,31,35,0.22)'}`
                              : `1px solid ${colors.border}`,
                            borderRadius: 12, padding: '10px 14px',
                          }}
                        >
                          <div style={{
                            width: 28, height: 28, borderRadius: 9,
                            background: sel ? (preferences.darkMode ? 'rgba(154,77,90,0.3)' : 'rgba(74,31,35,0.1)') : colors.elevated,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: colors.accentPurple, flexShrink: 0,
                          }}>
                            <Users size={13} />
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: sel ? 700 : 600, color: sel ? colors.accentPurple : colors.textPrimary, flex: 1 }}>
                            {g.name}
                          </span>
                          {sel && <Check size={14} color={colors.accentPurple} />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Add recipe bottom sheet (80vh with scroll + floating CTA) ── */}
      {showAdd && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.42)' }}
          onClick={resetForm}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md animate-slide-up"
            style={{
              background: colors.pageSurface,
              borderRadius: '24px 24px 0 0',
              height: '80vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 -12px 40px rgba(0,0,0,0.18)',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '18px 22px 14px',
                borderBottom: `1px solid ${preferences.darkMode ? colors.border : '#F4F4F4'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexShrink: 0,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '10px', fontWeight: 800, color: colors.textSecondary, margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {editId ? 'Edit' : activeTab === 'shared' ? 'Shared' : 'Mine'}
                </p>
                <h3 style={{ fontFamily: serifFont, fontSize: '22px', fontWeight: 400, margin: '2px 0 0 0', color: colors.textPrimary, lineHeight: 1.15 }}>
                  {editId ? 'Edit recipe' : activeTab === 'shared' ? 'Share a recipe' : 'New recipe'}
                </h3>
              </div>
              <button onClick={resetForm}
                className="rounded-full flex items-center justify-center border-none cursor-pointer outline-none"
                style={{
                  width: 36, height: 36,
                  background: preferences.darkMode ? colors.card : '#F6F6F6',
                  border: `1px solid ${preferences.darkMode ? colors.border : '#F4F4F4'}`,
                  color: colors.textPrimary,
                  flexShrink: 0,
                }}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px 32px' }}>
              <div className="space-y-4">
                <div>
                  <label className="section-label" style={{ display: 'block', marginBottom: 6, color: colors.textSecondary }}>Recipe name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Chicken Biryani" autoFocus
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 14,
                      border: `1.5px solid ${preferences.darkMode ? colors.border : '#F4F4F4'}`,
                      fontSize: '15px', outline: 'none',
                      background: preferences.darkMode ? 'transparent' : '#F6F6F6',
                      color: colors.textPrimary
                    }} />
                </div>

                <div>
                  <label className="section-label" style={{ display: 'block', marginBottom: 6, color: colors.textSecondary }}>Source link (optional)</label>
                  <div className="flex items-center gap-2">
                    <Link2 size={16} style={{ color: colors.textSecondary, flexShrink: 0 }} />
                    <input type="url" value={link} onChange={(e) => setLink(e.target.value)}
                      placeholder="YouTube or Instagram link"
                      style={{
                        flex: 1, padding: '12px 16px', borderRadius: 14,
                        border: `1.5px solid ${preferences.darkMode ? colors.border : '#F4F4F4'}`,
                        fontSize: '14px', outline: 'none',
                        background: preferences.darkMode ? 'transparent' : '#F6F6F6',
                        color: colors.textPrimary
                      }} />
                  </div>
                </div>

                <div>
                  <label className="section-label" style={{ display: 'block', marginBottom: 6, color: colors.textSecondary }}>Meal type</label>
                  <div className="flex gap-2 flex-wrap">
                    {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((mt) => {
                      const sel = mealType === mt
                      return (
                        <button key={mt} onClick={() => setMealType(mt)}
                          className="px-3.5 py-2 rounded-full cursor-pointer transition-smooth outline-none"
                          style={{
                            background: sel
                              ? (preferences.darkMode ? 'rgba(154, 77, 90, 0.18)' : 'rgba(74, 31, 35, 0.06)')
                              : (preferences.darkMode ? '#1B1B1B' : '#FFFFFF'),
                            border: sel
                              ? `1.5px solid ${preferences.darkMode ? 'rgba(240, 199, 207, 0.4)' : 'rgba(74, 31, 35, 0.22)'}`
                              : `1px solid ${colors.border}`,
                            color: sel
                              ? (preferences.darkMode ? '#F0C7CF' : '#4A1F23')
                              : colors.textPrimary,
                            fontSize: '12px',
                            fontWeight: sel ? 700 : 600,
                          }}>
                          {mt.charAt(0).toUpperCase() + mt.slice(1)}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="section-label" style={{ display: 'block', marginBottom: 6, color: colors.textSecondary }}>Note (optional)</label>
                  <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Cook makes this perfectly"
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 14,
                      border: `1.5px solid ${preferences.darkMode ? colors.border : '#F4F4F4'}`,
                      fontSize: '14px', outline: 'none',
                      background: preferences.darkMode ? 'transparent' : '#F6F6F6',
                      color: colors.textPrimary
                    }} />
                </div>

                <button onClick={() => name.trim() && setIngredients(guessIngredients(name))}
                  disabled={!name.trim()}
                  className="w-full py-2.5 rounded-xl border cursor-pointer bg-transparent flex items-center justify-center gap-2 outline-none"
                  style={{
                    borderColor: preferences.darkMode ? colors.accentBorder : 'rgba(60, 21, 26, 0.35)',
                    borderStyle: 'dashed', borderWidth: '1.5px',
                    color: colors.accentPurple, fontSize: '13px', fontWeight: 700, opacity: name.trim() ? 1 : 0.4,
                  }}>
                  <Sparkles size={14} /> AI Generate Ingredients
                </button>

                <div>
                  <label className="section-label" style={{ display: 'block', marginBottom: 6, color: colors.textSecondary }}>Ingredients</label>
                  <div className="flex gap-2">
                    <input type="text" value={newIngredient} onChange={(e) => setNewIngredient(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addIng()} placeholder="Add ingredient"
                      style={{
                        flex: 1, padding: '10px 14px', borderRadius: 12,
                        border: `1.5px solid ${preferences.darkMode ? colors.border : '#F4F4F4'}`,
                        fontSize: '14px', outline: 'none',
                        background: preferences.darkMode ? 'transparent' : '#F6F6F6',
                        color: colors.textPrimary
                      }} />
                    <button onClick={addIng}
                      className="px-4 py-2 rounded-xl border-none cursor-pointer outline-none"
                      style={{
                        background: preferences.darkMode ? colors.border : '#F6F6F6',
                        border: `1px solid ${preferences.darkMode ? colors.border : '#F4F4F4'}`,
                        fontSize: '13px', fontWeight: 700, color: colors.textPrimary
                      }}>Add</button>
                  </div>
                  {ingredients.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {ingredients.map((ing, i) => (
                        <span key={i} className="flex items-center gap-1"
                          style={{
                            padding: '6px 10px',
                            borderRadius: 999,
                            fontSize: '12px',
                            fontWeight: 600,
                            background: preferences.darkMode ? colors.card : '#F6F6F6',
                            color: colors.textPrimary,
                            border: `1px solid ${preferences.darkMode ? colors.border : '#F4F4F4'}`,
                          }}>
                          {ing}
                          <button onClick={() => setIngredients(ingredients.filter((_, j) => j !== i))}
                            className="bg-transparent border-none cursor-pointer p-0 flex items-center outline-none"><X size={10} color={colors.textSecondary} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Save button — at end of form */}
              <div style={{ paddingTop: 16 }}>
                <button
                  onClick={handleSave}
                  disabled={!name.trim()}
                  className="w-full flex items-center justify-center gap-2 border-none cursor-pointer outline-none"
                  style={{
                    background: colors.accentPurple,
                    color: '#FFFFFF',
                    height: 46,
                    borderRadius: 18,
                    fontSize: '15px',
                    fontWeight: 600,
                    opacity: name.trim() ? 1 : 0.45,
                  }}
                >
                  {editId ? <Check size={16} /> : <Plus size={16} />}
                  {editId ? 'Update recipe' : activeTab === 'shared' ? 'Share recipe' : 'Save recipe'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed left-0 right-0 flex justify-center pointer-events-none z-60" style={{ bottom: 148 }}>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full" style={{ background: colors.textPrimary, color: colors.pageSurface, fontSize: '13px', fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}>
            <Check size={14} />
            {toast}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
