import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore, generateId, guessIngredients } from '../store/useStore'
import type { Recipe } from '../store/useStore'
import { ArrowLeft, Link2, Sparkles, X, ChevronRight } from 'lucide-react'

const serifFont = "'DM Serif Display', Georgia, serif"

export default function AddRecipe() {
  const navigate = useNavigate()
  const location = useLocation()
  const { addRecipe, updateRecipe, addSharedRecipe, preferences, groups } = useStore()

  const state          = (location.state as any) || {}
  const lockedGroupId: string | null  = state.lockedGroupId  || null
  const defaultGroupId: string | null = state.defaultGroupId || null
  const editRecipe: Recipe | null     = state.editRecipe     || null
  const mode: 'mine' | 'share' = state.mode || (lockedGroupId ? 'share' : 'mine')

  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    lockedGroupId || defaultGroupId || groups[0]?.id || ''
  )

  // Form state
  const [name,          setName]          = useState(editRecipe?.name          || '')
  const [link,          setLink]          = useState(editRecipe?.link          || '')
  const [mealType,      setMealType]      = useState<'breakfast'|'lunch'|'dinner'|'snacks'>(editRecipe?.mealType || 'lunch')
  const [note,          setNote]          = useState(editRecipe?.note          || '')
  const [ingredients,   setIngredients]   = useState<string[]>(editRecipe?.ingredients || [])
  const [newIngredient, setNewIngredient] = useState('')

  const dm = preferences.darkMode
  const C = {
    page:        dm ? '#121212'                   : '#F5F3F1',
    card:        dm ? '#1B1B1B'                   : '#FBFAF8',
    border:      dm ? 'rgba(255,255,255,0.08)'    : 'rgba(0,0,0,0.07)',
    inputBg:     dm ? '#1B1B1B'                   : '#FFFFFF',
    inputBorder: dm ? '#2E2E2E'                   : '#EAEAEA',
    text:        dm ? '#FEFEFE'                   : '#1C1C1C',
    sub:         dm ? '#A9A0A3'                   : '#6F6B66',
    accent:      dm ? '#9A4D5A'                   : '#4A1F23',
    accentLight: dm ? 'rgba(154,77,90,0.15)'      : 'rgba(74,31,35,0.06)',
    accentBorder:dm ? 'rgba(240,199,207,0.35)'    : 'rgba(74,31,35,0.22)',
    elevated:    dm ? '#252525'                   : '#EDE9E4',
  }

  const selectedGroupName = groups.find(g => g.id === selectedGroupId)?.name || ''

  const addIng = () => {
    const v = newIngredient.trim()
    if (v && !ingredients.includes(v)) {
      setIngredients([...ingredients, v])
      setNewIngredient('')
    }
  }

  const handleSave = () => {
    if (!name.trim()) return
    const ings = ingredients.length > 0 ? ingredients : guessIngredients(name)
    const data = { name: name.trim(), link: link || undefined, mealType, note: note || undefined, ingredients: ings }

    if (editRecipe) {
      updateRecipe(editRecipe.id, data)
      navigate(-1)
      return
    }

    if (mode === 'share' && selectedGroupId) {
      addSharedRecipe({
        id: generateId(), groupId: selectedGroupId, sharedBy: preferences.name || 'You',
        tags: [], timestamp: Date.now(), sourceType: link ? 'manual' : undefined, ...data,
      })
      addRecipe({ id: generateId(), category: 'main', ...data })
      navigate('/recipes', { replace: true })
    } else {
      addRecipe({ id: generateId(), category: 'main', ...data })
      navigate('/recipes', { replace: true })
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Recipe form
  // ─────────────────────────────────────────────────────────────────
  const ctaLabel = editRecipe
    ? 'Update recipe'
    : mode === 'share'
    ? 'Share recipe'
    : 'Save recipe'

  return (
    <div className="min-h-screen animate-slide-right" style={{ background: C.page }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '56px 20px 16px',
        position: 'sticky', top: 0, zIndex: 10, background: C.page,
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

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: C.sub, margin: '0 0 1px 0', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            {mode === 'share' && selectedGroupName ? `Sharing to ${selectedGroupName}` : mode === 'share' ? 'Share recipe' : 'My recipe'}
          </p>
          <h1 style={{ fontFamily: serifFont, fontSize: '22px', fontWeight: 400, color: C.text, margin: 0 }}>
            {editRecipe ? 'Edit recipe' : 'Add recipe'}
          </h1>
        </div>
      </div>

      {/* Form */}
      <div style={{ padding: '4px 20px 120px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Group row — share mode only */}
        {mode === 'share' && (
          <div>
            <label style={labelStyle(C)}>Share to group</label>
            <button
              onClick={() => navigate('/recipes/new/group', {
                state: { currentGroupId: selectedGroupId, mode: 'share' }
              })}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                background: C.accentLight,
                border: `1.5px solid ${C.accentBorder}`,
                borderRadius: 14, padding: '13px 16px',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: dm ? 'rgba(154,77,90,0.3)' : 'rgba(74,31,35,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: 700, color: C.accent,
              }}>
                {selectedGroupName.charAt(0).toUpperCase() || '?'}
              </div>
              <span style={{ flex: 1, fontSize: '15px', fontWeight: 700, color: C.accent }}>
                {selectedGroupName || 'Select group'}
              </span>
              <ChevronRight size={16} color={C.accent} />
            </button>
          </div>
        )}

        {/* Recipe name */}
        <div>
          <label style={labelStyle(C)}>Recipe name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Chicken Biryani" autoFocus
            style={inputStyle(C)} />
        </div>

        {/* Source link */}
        <div>
          <label style={labelStyle(C)}>Source link <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.inputBg, border: `1.5px solid ${C.inputBorder}`, borderRadius: 14, padding: '0 14px' }}>
            <Link2 size={15} style={{ color: C.sub, flexShrink: 0 }} />
            <input type="url" value={link} onChange={(e) => setLink(e.target.value)}
              placeholder="YouTube or Instagram link"
              style={{ flex: 1, padding: '13px 0', fontSize: '14px', outline: 'none', border: 'none', background: 'transparent', color: C.text }} />
          </div>
        </div>

        {/* Meal type */}
        <div>
          <label style={labelStyle(C)}>Meal type</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((mt) => {
              const sel = mealType === mt
              return (
                <button key={mt} onClick={() => setMealType(mt)} style={{
                  padding: '8px 16px', borderRadius: 999, cursor: 'pointer', fontSize: '13px',
                  fontWeight: sel ? 700 : 500,
                  background: sel ? C.accentLight : C.inputBg,
                  border: sel ? `1.5px solid ${C.accentBorder}` : `1px solid ${C.inputBorder}`,
                  color: sel ? C.accent : C.text,
                }}>
                  {mt.charAt(0).toUpperCase() + mt.slice(1)}
                </button>
              )
            })}
          </div>
        </div>

        {/* Note */}
        <div>
          <label style={labelStyle(C)}>Note <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Cook makes this perfectly"
            style={inputStyle(C)} />
        </div>

        {/* AI generate */}
        <button onClick={() => name.trim() && setIngredients(guessIngredients(name))}
          disabled={!name.trim()}
          style={{
            width: '100%', padding: '11px 0', borderRadius: 14,
            border: `1.5px dashed ${dm ? 'rgba(240,199,207,0.3)' : 'rgba(74,31,35,0.3)'}`,
            background: 'transparent', color: C.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontSize: '13px', fontWeight: 700, cursor: name.trim() ? 'pointer' : 'not-allowed',
            opacity: name.trim() ? 1 : 0.45,
          }}>
          <Sparkles size={14} /> AI Generate Ingredients
        </button>

        {/* Ingredients */}
        <div>
          <label style={labelStyle(C)}>Ingredients</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="text" value={newIngredient} onChange={(e) => setNewIngredient(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addIng()} placeholder="Add ingredient"
              style={{ ...inputStyle(C), flex: 1, padding: '11px 14px' }} />
            <button onClick={addIng} style={{
              padding: '11px 16px', borderRadius: 12, border: 'none',
              background: C.elevated, color: C.text, fontSize: '13px', fontWeight: 700, cursor: 'pointer',
            }}>Add</button>
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
                  <button onClick={() => setIngredients(ingredients.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: C.sub }}>
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 448, padding: '12px 20px 32px',
        background: `linear-gradient(to top, ${C.page} 70%, transparent)`,
      }}>
        <button onClick={handleSave} disabled={!name.trim()} style={{
          width: '100%', height: 50, borderRadius: 16, border: 'none',
          cursor: name.trim() ? 'pointer' : 'not-allowed',
          background: C.accent, color: '#FFF',
          fontSize: '15px', fontWeight: 700,
          opacity: name.trim() ? 1 : 0.4,
        }}>
          {ctaLabel}
        </button>
      </div>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────
const labelStyle = (C: { sub: string }) => ({
  display: 'block' as const,
  fontSize: '12px', fontWeight: 600 as const,
  color: C.sub, marginBottom: 8,
  textTransform: 'uppercase' as const, letterSpacing: '0.06em',
})

const inputStyle = (C: { inputBg: string; inputBorder: string; text: string }) => ({
  width: '100%', padding: '13px 16px', borderRadius: 14,
  border: `1.5px solid ${C.inputBorder}`,
  fontSize: '15px', outline: 'none',
  background: C.inputBg, color: C.text,
  boxSizing: 'border-box' as const,
})

