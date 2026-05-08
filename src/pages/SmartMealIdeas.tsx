import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookmarkPlus, Check, Clock, ExternalLink, Search, Sparkles, Users } from 'lucide-react'
import { generateId, useStore } from '../store/useStore'

const serifFont = "'DM Serif Display', Georgia, serif"

const lightColors = {
  pageSurface: '#F5F3F1',
  card: '#FBFAF8',
  textPrimary: '#1C1C1C',
  textSecondary: '#6F6B66',
  textTertiary: '#6F6B66',
  border: 'rgba(0,0,0,0.07)',
  accentPurple: '#4A1F23',
  accentPurpleLight: '#9A4D5A',
  chipBg: 'rgba(74, 31, 35, 0.06)',
  chipBorder: 'rgba(74, 31, 35, 0.15)',
}

const darkColors = {
  pageSurface: '#0E0E0E',
  card: '#1B1B1B',
  textPrimary: '#FEFEFE',
  textSecondary: '#B8B0B2',
  textTertiary: '#A9A0A3',
  border: '#2B2B2B',
  accentPurple: '#9A4D5A',
  accentPurpleLight: '#6A2B34',
  chipBg: 'rgba(255,255,255,0.08)',
  chipBorder: 'rgba(255,255,255,0.14)',
}

type MealIdea = {
  id: string
  name: string
  cookTime: string
  sourceTitle: string
  sourceUrl: string
  ingredients: string[]
  image: string
}

const starterIngredients = [
  'Rice',
  'Paneer',
  'Eggs',
  'Chicken',
  'Dal',
  'Potato',
  'Tomato',
  'Curd',
  'Spinach',
  'Mushroom',
]

const ideaPool: MealIdea[] = [
  {
    id: 'paneer-bhurji',
    name: 'Paneer Bhurji Bowl',
    cookTime: '18 min',
    sourceTitle: 'YouTube recipe',
    sourceUrl: 'https://www.youtube.com/results?search_query=paneer+bhurji+bowl+recipe',
    ingredients: ['Paneer', 'Tomato', 'Onion', 'Rice', 'Coriander'],
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80',
  },
  {
    id: 'egg-fried-rice',
    name: 'Egg Fried Rice',
    cookTime: '15 min',
    sourceTitle: 'YouTube recipe',
    sourceUrl: 'https://www.youtube.com/results?search_query=quick+egg+fried+rice+recipe',
    ingredients: ['Eggs', 'Rice', 'Spring onion', 'Soy sauce', 'Carrot'],
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=80',
  },
  {
    id: 'dal-khichdi',
    name: 'Comfort Dal Khichdi',
    cookTime: '25 min',
    sourceTitle: 'YouTube recipe',
    sourceUrl: 'https://www.youtube.com/results?search_query=dal+khichdi+recipe',
    ingredients: ['Dal', 'Rice', 'Ghee', 'Turmeric', 'Cumin'],
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80',
  },
  {
    id: 'chicken-tomato-curry',
    name: 'Chicken Tomato Curry',
    cookTime: '30 min',
    sourceTitle: 'YouTube recipe',
    sourceUrl: 'https://www.youtube.com/results?search_query=chicken+tomato+curry+recipe',
    ingredients: ['Chicken', 'Tomato', 'Onion', 'Curd', 'Garam masala'],
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80',
  },
  {
    id: 'aloo-palak',
    name: 'Aloo Palak Roti Plate',
    cookTime: '22 min',
    sourceTitle: 'Source recipe',
    sourceUrl: 'https://www.youtube.com/results?search_query=aloo+palak+recipe',
    ingredients: ['Potato', 'Spinach', 'Tomato', 'Garlic', 'Roti'],
    image: 'https://images.unsplash.com/photo-1618449840665-9ed506d73a34?w=600&q=80',
  },
  {
    id: 'mushroom-curd-wrap',
    name: 'Mushroom Curd Wrap',
    cookTime: '20 min',
    sourceTitle: 'Source recipe',
    sourceUrl: 'https://www.youtube.com/results?search_query=mushroom+wrap+recipe',
    ingredients: ['Mushroom', 'Curd', 'Onion', 'Roti', 'Cucumber'],
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&q=80',
  },
]

function getTimestamp() {
  return Date.now()
}

export default function SmartMealIdeas() {
  const navigate = useNavigate()
  const { preferences, addRecipe, addSharedRecipe, recipes, sharedRecipes } = useStore()
  const colors = preferences.darkMode ? darkColors : lightColors
  const [selected, setSelected] = useState<string[]>(['Rice', 'Tomato'])
  const [input, setInput] = useState('')
  const [hasGenerated, setHasGenerated] = useState(false)
  const [savedMine, setSavedMine] = useState<Set<string>>(new Set())
  const [savedShared, setSavedShared] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)

  const suggestions = useMemo(() => {
    const chosen = selected.map((item) => item.toLowerCase())
    const ranked = ideaPool
      .map((idea) => ({
        idea,
        score: idea.ingredients.filter((ingredient) => chosen.some((item) => ingredient.toLowerCase().includes(item))).length,
      }))
      .sort((a, b) => b.score - a.score)

    return ranked.slice(0, 3).map(({ idea }) => idea)
  }, [selected])

  const toggleIngredient = (ingredient: string) => {
    setSelected((current) =>
      current.includes(ingredient)
        ? current.filter((item) => item !== ingredient)
        : [...current, ingredient],
    )
  }

  const addIngredient = () => {
    const value = input.trim()
    if (!value) return
    setSelected((current) => current.some((item) => item.toLowerCase() === value.toLowerCase()) ? current : [...current, value])
    setInput('')
  }

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  const saveMine = (idea: MealIdea) => {
    if (savedMine.has(idea.id)) return
    if (!recipes.some((recipe) => recipe.name.toLowerCase() === idea.name.toLowerCase())) {
      addRecipe({
        id: generateId(),
        name: idea.name,
        link: idea.sourceUrl,
        ingredients: idea.ingredients,
        category: 'main',
        tags: ['AI idea'],
        image: idea.image,
        mealType: 'lunch',
      })
    }
    setSavedMine((current) => new Set(current).add(idea.id))
    showToast('Saved to Mine recipes.')
  }

  const saveShared = (idea: MealIdea) => {
    if (savedShared.has(idea.id)) return
    addSharedRecipe({
      id: generateId(),
      groupId: preferences.groupId || undefined,
      name: idea.name,
      sharedBy: preferences.name || 'You',
      link: idea.sourceUrl,
      sourceType: 'youtube',
      ingredients: idea.ingredients,
      tags: ['AI idea'],
      note: 'Suggested from ingredients on hand.',
      timestamp: getTimestamp(),
      image: idea.image,
      mealType: 'lunch',
    })
    setSavedShared((current) => new Set(current).add(idea.id))
    showToast(sharedRecipes.some((recipe) => recipe.name === idea.name) ? 'Shared recipe updated.' : 'Saved to Shared recipes.')
  }

  return (
    <div className="min-h-screen animate-slide-right" style={{ background: colors.pageSurface }}>
      <div className="sticky top-0 z-20 px-5 pt-14 pb-4" style={{ background: colors.pageSurface, borderBottom: `1px solid ${colors.border}` }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="border-none cursor-pointer outline-none flex items-center justify-center"
            style={{ width: 40, height: 40, borderRadius: 14, background: colors.card, color: colors.textPrimary }}
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.textSecondary, margin: 0 }}>
              Smart meal ideas
            </p>
            <h1 style={{ fontFamily: serifFont, fontSize: '28px', fontWeight: 400, color: colors.textPrimary, lineHeight: 1.1, margin: '3px 0 0 0' }}>
              What ingredients do you have?
            </h1>
          </div>
        </div>
      </div>

      <main className="px-5 pt-5 pb-12">
        <section>
          <div className="flex flex-wrap gap-2">
            {starterIngredients.map((ingredient) => {
              const active = selected.includes(ingredient)
              return (
                <button
                  key={ingredient}
                  onClick={() => toggleIngredient(ingredient)}
                  className="border cursor-pointer outline-none transition-smooth"
                  style={{
                    minHeight: 38,
                    borderRadius: 999,
                    padding: '0 13px',
                    background: active ? colors.accentPurple : colors.card,
                    borderColor: active ? colors.accentPurple : colors.border,
                    color: active ? '#FFF' : colors.textPrimary,
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                >
                  {ingredient}
                </button>
              )
            })}
          </div>

          <div className="mt-4 flex items-center gap-2" style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 6 }}>
            <Search size={18} style={{ color: colors.textSecondary, marginLeft: 8, flexShrink: 0 }} />
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && addIngredient()}
              placeholder="Add ingredient"
              className="flex-1 bg-transparent border-none outline-none"
              style={{ minHeight: 44, color: colors.textPrimary, fontSize: '15px' }}
            />
            <button
              onClick={addIngredient}
              disabled={!input.trim()}
              className="border-none cursor-pointer outline-none"
              style={{
                minHeight: 44,
                borderRadius: 12,
                padding: '0 14px',
                background: input.trim() ? colors.accentPurple : colors.border,
                color: input.trim() ? '#FFF' : colors.textTertiary,
                fontSize: '13px',
                fontWeight: 800,
              }}
            >
              Add
            </button>
          </div>

          {selected.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selected.map((ingredient) => (
                <button
                  key={ingredient}
                  onClick={() => toggleIngredient(ingredient)}
                  className="border cursor-pointer outline-none"
                  style={{
                    minHeight: 32,
                    borderRadius: 999,
                    padding: '0 10px',
                    background: colors.chipBg,
                    borderColor: colors.chipBorder,
                    color: colors.accentPurple,
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {ingredient}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setHasGenerated(true)}
            disabled={selected.length === 0}
            className="mt-5 w-full border-none cursor-pointer outline-none flex items-center justify-center gap-2"
            style={{
              minHeight: 48,
              borderRadius: 16,
              background: selected.length ? colors.accentPurple : colors.border,
              color: selected.length ? '#FFF' : colors.textTertiary,
              fontSize: '15px',
              fontWeight: 800,
            }}
          >
            <Sparkles size={18} />
            Suggest meals
          </button>
        </section>

        {hasGenerated && (
          <section className="mt-7">
            <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.textSecondary, margin: '0 0 12px 0' }}>
              AI suggestions
            </p>
            <div className="flex flex-col gap-3">
              {suggestions.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  colors={colors}
                  savedMine={savedMine.has(idea.id)}
                  savedShared={savedShared.has(idea.id)}
                  canShare={Boolean(preferences.groupEnabled || preferences.groupId)}
                  onSaveMine={() => saveMine(idea)}
                  onSaveShared={() => saveShared(idea)}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {toast && (
        <div className="fixed left-0 right-0 flex justify-center pointer-events-none z-50" style={{ bottom: 26 }}>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full" style={{ background: colors.textPrimary, color: colors.pageSurface, fontSize: '13px', fontWeight: 700 }}>
            <Check size={14} />
            {toast}
          </div>
        </div>
      )}
    </div>
  )
}

function IdeaCard({
  idea,
  colors,
  savedMine,
  savedShared,
  canShare,
  onSaveMine,
  onSaveShared,
}: {
  idea: MealIdea
  colors: typeof lightColors
  savedMine: boolean
  savedShared: boolean
  canShare: boolean
  onSaveMine: () => void
  onSaveShared: () => void
}) {
  return (
    <article style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 12, padding: 12 }}>
        <img src={idea.image} alt={idea.name} style={{ width: 86, height: 86, borderRadius: 14, objectFit: 'cover', flexShrink: 0, background: colors.chipBg }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: colors.textPrimary, margin: '0 0 7px 0', lineHeight: 1.2 }}>
            {idea.name}
          </h2>
          <div className="flex items-center gap-2" style={{ color: colors.textSecondary, marginBottom: 7 }}>
            <Clock size={14} />
            <span style={{ fontSize: '12px', fontWeight: 700 }}>{idea.cookTime}</span>
          </div>
          <p className="line-clamp-2" style={{ fontSize: '12px', color: colors.textSecondary, margin: 0, lineHeight: 1.35 }}>
            {idea.ingredients.join(', ')}
          </p>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${colors.border}`, padding: '10px 12px 12px' }}>
        <a
          href={idea.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5"
          style={{ color: colors.accentPurple, fontSize: '12px', fontWeight: 800, textDecoration: 'none', minHeight: 32 }}
        >
          {idea.sourceTitle}
          <ExternalLink size={13} />
        </a>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <button
            onClick={onSaveMine}
            disabled={savedMine}
            className="border cursor-pointer outline-none flex items-center justify-center gap-1.5"
            style={{
              minHeight: 42,
              borderRadius: 13,
              background: savedMine ? colors.chipBg : colors.card,
              borderColor: colors.border,
              color: colors.accentPurple,
              fontSize: '12px',
              fontWeight: 800,
              opacity: savedMine ? 0.75 : 1,
            }}
          >
            {savedMine ? <Check size={14} /> : <BookmarkPlus size={14} />}
            Mine
          </button>
          <button
            onClick={onSaveShared}
            disabled={!canShare || savedShared}
            className="border cursor-pointer outline-none flex items-center justify-center gap-1.5"
            style={{
              minHeight: 42,
              borderRadius: 13,
              background: savedShared ? colors.chipBg : colors.card,
              borderColor: colors.border,
              color: colors.accentPurple,
              fontSize: '12px',
              fontWeight: 800,
              opacity: !canShare || savedShared ? 0.55 : 1,
            }}
          >
            {savedShared ? <Check size={14} /> : <Users size={14} />}
            Shared
          </button>
        </div>
      </div>
    </article>
  )
}
