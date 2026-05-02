import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore, generateId, guessIngredients } from '../store/useStore'
import type { Recipe } from '../store/useStore'
import { ArrowLeft, Link2, Sparkles, X, Plus } from 'lucide-react'

const serifFont = "'DM Serif Display', Georgia, serif"

export default function AddRecipe() {
  const navigate = useNavigate()
  const location = useLocation()
  const { addRecipe, updateRecipe, preferences, groups } = useStore()

  const state = (location.state as any) || {}
  const lockedGroupId: string | null = state.lockedGroupId || null
  const editRecipe: Recipe | null     = state.editRecipe || null

  // If locked group, default to share mode
  const [mode, setMode] = useState<'mine' | 'share'>(lockedGroupId ? 'share' : 'mine')

  // Form state — pre-filled when editing
  const [name,          setName]          = useState(editRecipe?.name          || '')
  const [link,          setLink]          = useState(editRecipe?.link          || '')
  const [mealType,      setMealType]      = useState<'breakfast'|'lunch'|'dinner'|'snacks'>(editRecipe?.mealType || 'lunch')
  const [note,          setNote]          = useState(editRecipe?.note          || '')
  const [ingredients,   setIngredients]   = useState<string[]>(editRecipe?.ingredients || [])
  const [newIngredient, setNewIngredient] = useState('')

  const dm = preferences.darkMode
  const C = {
    page:          dm ? '#121212'         : '#F5F3F1',
    card:          dm ? '#1B1B1B'         : '#FBFAF8',
    border:        dm ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
    inputBg:       dm ? '#1B1B1B'         : '#FFFFFF',
    inputBorder:   dm ? '#2E2E2E'         : '#EAEAEA',
    text:          dm ? '#FEFEFE'         : '#1C1C1C',
    sub:           dm ? '#A9A0A3'         : '#6F6B66',
    accent:        dm ? '#9A4D5A'         : '#4A1F23',
    accentLight:   dm ? 'rgba(154,77,90,0.15)' : 'rgba(74,31,35,0.06)',
    accentBorder:  dm ? 'rgba(240,199,207,0.35)' : 'rgba(74,31,35,0.22)',
    elevated:      dm ? '#252525'         : '#EDE9E4',
    chip:          dm ? '#252525'         : '#FFFFFF',
  }

  const addIng = () => {
    const v = newIngredient.trim()
    if (v && !ingredients.includes(v)) {
      setIngredients([...ingredients, v])
      setNewIngredient('')
    }
  }

  const handleContinue = () => {
    if (!name.trim()) return
    const ings = ingredients.length > 0 ? ingredients : guessIngredients(name)
    const recipeData = { name: name.trim(), link: link || undefined, mealType, note: note || undefined, ingredients: ings }

    if (editRecipe) {
      updateRecipe(editRecipe.id, recipeData)
      navigate(-1)
      return
    }

    if (mode === 'mine') {
      addRecipe({ id: generateId(), category: 'main', ...recipeData })
      navigate('/recipes')
      return
    }

    // Share mode
    if (lockedGroupId) {
      // group already known — skip group selection
      navigate('/recipes/new/group', { state: { recipe: recipeData, lockedGroupId } })
    } else if (groups.length === 0) {
      // no groups — save as mine with a nudge
      addRecipe({ id: generateId(), category: 'main', ...recipeData })
      navigate('/recipes')
    } else if (groups.length === 1) {
      // only one group — skip selection, go straight to confirm
      navigate('/recipes/new/group', { state: { recipe: recipeData, lockedGroupId: groups[0].id } })
    } else {
      navigate('/recipes/new/group', { state: { recipe: recipeData } })
    }
  }

  const ctaLabel = editRecipe
    ? 'Update recipe'
    : mode === 'share'
    ? 'Continue'
    : 'Save recipe'

  return (
    <div className="min-h-screen animate-slide-right" style={{ background: C.page }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '56px 20px 16px',
        background: C.page,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: 36, height: 36, borderRadius: 12,
            background: C.card, border: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: C.text, flexShrink: 0,
          }}
        >
          <ArrowLeft size={18} />
        </button>

        <h1 style={{ fontFamily: serifFont, fontSize: '24px', fontWeight: 400, color: C.text, margin: 0, flex: 1 }}>
          {editRecipe ? 'Edit recipe' : 'Add recipe'}
        </h1>

        {/* Mine / Share toggle — hidden when locked to a group or editing */}
        {!editRecipe && !lockedGroupId && (
          <div style={{
            display: 'flex', background: C.elevated, borderRadius: 10, padding: 3, gap: 2,
          }}>
            {(['mine', 'share'] as const).map((m) => {
              const active = mode === m
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: active ? C.card : 'transparent',
                    color: active ? C.text : C.sub,
                    fontWeight: active ? 700 : 500,
                    fontSize: '13px',
                    boxShadow: active ? '0 1px 4px rgba(0,0,0,0.07)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {m === 'mine' ? 'Mine' : 'Share'}
                </button>
              )
            })}
          </div>
        )}

        {/* Locked group indicator badge */}
        {!editRecipe && lockedGroupId && (
          <span style={{
            fontSize: '12px', fontWeight: 600, color: C.accent,
            background: C.accentLight, padding: '4px 10px', borderRadius: 999,
            border: `1px solid ${C.accentBorder}`,
          }}>
            Share
          </span>
        )}
      </div>

      {/* ── Form ── */}
      <div style={{ padding: '4px 20px 120px' }}>

        {/* Sharing to locked group label */}
        {!editRecipe && lockedGroupId && (() => {
          const g = preferences.groupName || groups.find(gr => gr.id === lockedGroupId)?.name || ''
          return g ? (
            <p style={{ fontSize: '13px', color: C.sub, margin: '0 0 20px 0' }}>
              Sharing to <strong style={{ color: C.accent }}>{g}</strong>
            </p>
          ) : null
        })()}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Recipe name */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: C.sub, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Recipe name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chicken Biryani"
              autoFocus
              style={{
                width: '100%', padding: '13px 16px', borderRadius: 14,
                border: `1.5px solid ${C.inputBorder}`,
                fontSize: '16px', outline: 'none',
                background: C.inputBg, color: C.text,
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Source link */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: C.sub, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Source link <span style={{ textTransform: 'none', fontWeight: 400 }}>(optional)</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.inputBg, border: `1.5px solid ${C.inputBorder}`, borderRadius: 14, padding: '0 14px' }}>
              <Link2 size={15} style={{ color: C.sub, flexShrink: 0 }} />
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="YouTube or Instagram link"
                style={{
                  flex: 1, padding: '13px 0', fontSize: '14px',
                  outline: 'none', border: 'none', background: 'transparent', color: C.text,
                }}
              />
            </div>
          </div>

          {/* Meal type */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: C.sub, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Meal type
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((mt) => {
                const sel = mealType === mt
                return (
                  <button
                    key={mt}
                    onClick={() => setMealType(mt)}
                    style={{
                      padding: '8px 16px', borderRadius: 999, cursor: 'pointer', fontSize: '13px',
                      fontWeight: sel ? 700 : 500,
                      background: sel ? C.accentLight : C.chip,
                      border: sel ? `1.5px solid ${C.accentBorder}` : `1px solid ${C.border}`,
                      color: sel ? C.accent : C.text,
                    }}
                  >
                    {mt.charAt(0).toUpperCase() + mt.slice(1)}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Note */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: C.sub, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Note <span style={{ textTransform: 'none', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Cook makes this perfectly"
              style={{
                width: '100%', padding: '13px 16px', borderRadius: 14,
                border: `1.5px solid ${C.inputBorder}`,
                fontSize: '14px', outline: 'none',
                background: C.inputBg, color: C.text,
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* AI Generate */}
          <button
            onClick={() => name.trim() && setIngredients(guessIngredients(name))}
            disabled={!name.trim()}
            style={{
              width: '100%', padding: '11px 0', borderRadius: 14, cursor: name.trim() ? 'pointer' : 'not-allowed',
              border: `1.5px dashed ${dm ? 'rgba(240,199,207,0.3)' : 'rgba(74,31,35,0.3)'}`,
              background: 'transparent', color: C.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: '13px', fontWeight: 700, opacity: name.trim() ? 1 : 0.45,
            }}
          >
            <Sparkles size={14} /> AI Generate Ingredients
          </button>

          {/* Ingredients */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: C.sub, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Ingredients
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addIng()}
                placeholder="Add ingredient"
                style={{
                  flex: 1, padding: '11px 14px', borderRadius: 12,
                  border: `1.5px solid ${C.inputBorder}`,
                  fontSize: '14px', outline: 'none',
                  background: C.inputBg, color: C.text,
                }}
              />
              <button
                onClick={addIng}
                style={{
                  padding: '11px 16px', borderRadius: 12, border: 'none',
                  background: C.elevated, color: C.text,
                  fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                }}
              >
                Add
              </button>
            </div>
            {ingredients.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                {ingredients.map((ing, i) => (
                  <span key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '5px 10px', borderRadius: 999,
                    background: C.card, border: `1px solid ${C.border}`,
                    fontSize: '12px', fontWeight: 600, color: C.text,
                  }}>
                    {ing}
                    <button
                      onClick={() => setIngredients(ingredients.filter((_, j) => j !== i))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: C.sub }}
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Sticky CTA ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 448,
        padding: '12px 20px 32px',
        background: `linear-gradient(to top, ${C.page} 70%, transparent)`,
      }}>
        <button
          onClick={handleContinue}
          disabled={!name.trim()}
          style={{
            width: '100%', height: 50, borderRadius: 16, border: 'none', cursor: name.trim() ? 'pointer' : 'not-allowed',
            background: C.accent, color: '#FFF',
            fontSize: '15px', fontWeight: 700,
            opacity: name.trim() ? 1 : 0.4,
          }}
        >
          {ctaLabel}
        </button>
      </div>

    </div>
  )
}
