import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { ArrowLeft, Search, Plus, Check } from 'lucide-react'

const serifFont = "'DM Serif Display', Georgia, serif"

export default function SelectGroup() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const { groups, createGroup, preferences } = useStore()

  const state = (location.state as any) || {}
  const currentGroupId: string | null = state.currentGroupId || state.lockedGroupId || null

  const defaultId = currentGroupId || preferences.groupId || groups[0]?.id || ''
  const [selectedGroupId, setSelectedGroupId] = useState(defaultId)
  const [search, setSearch]   = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')

  const dm = preferences.darkMode
  const C = {
    page:        dm ? '#121212' : '#F5F3F1',
    card:        dm ? '#1B1B1B' : '#FBFAF8',
    border:      dm ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
    inputBg:     dm ? '#1B1B1B' : '#FFFFFF',
    inputBorder: dm ? '#2E2E2E' : '#EAEAEA',
    text:        dm ? '#FEFEFE' : '#1C1C1C',
    sub:         dm ? '#A9A0A3' : '#6F6B66',
    accent:      dm ? '#9A4D5A' : '#4A1F23',
    accentLight: dm ? 'rgba(154,77,90,0.15)' : 'rgba(74,31,35,0.06)',
    accentBorder:dm ? 'rgba(240,199,207,0.35)' : 'rgba(74,31,35,0.22)',
    elevated:    dm ? '#252525' : '#EDE9E4',
    divider:     dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
  }

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleContinue = () => {
    if (!selectedGroupId) return
    navigate('/recipes/new', { replace: true, state: { mode: 'share', lockedGroupId: selectedGroupId, defaultGroupId: selectedGroupId } })
  }

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return
    createGroup(newGroupName.trim())
    setNewGroupName('')
    setShowCreate(false)
    // Select the newly created group (it'll be last in the list)
    // We rely on the store updating groups; select by name match after a tick
    setTimeout(() => {
      const created = useStore.getState().groups.find((g) => g.name === newGroupName.trim())
      if (created) setSelectedGroupId(created.id)
    }, 50)
  }

  return (
    <div className="min-h-screen animate-slide-right" style={{ background: C.page }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '56px 20px 20px',
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
        <div>
          <h1 style={{ fontFamily: serifFont, fontSize: '24px', fontWeight: 400, color: C.text, margin: 0, lineHeight: 1.1 }}>
            Select group
          </h1>
          <p style={{ fontSize: '13px', color: C.sub, margin: '3px 0 0 0' }}>
            Choose a group to share your recipe with.
          </p>
        </div>
      </div>

      {/* ── Search bar ── */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: C.inputBg, border: `1.5px solid ${C.inputBorder}`,
          borderRadius: 14, padding: '0 14px',
        }}>
          <Search size={15} style={{ color: C.sub, flexShrink: 0 }} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search groups…"
            style={{
              flex: 1, padding: '12px 0', fontSize: '14px',
              outline: 'none', border: 'none', background: 'transparent', color: C.text,
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.sub, padding: 0 }}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Group list ── */}
      <div style={{ padding: '0 20px 140px' }}>
        {filteredGroups.length === 0 && !showCreate && (
          <p style={{ fontSize: '14px', color: C.sub, textAlign: 'center', margin: '40px 0' }}>
            {search ? 'No groups match your search.' : 'No groups yet.'}
          </p>
        )}

        {filteredGroups.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredGroups.map((g) => {
              const sel = selectedGroupId === g.id
              return (
                <button
                  key={g.id}
                  onClick={() => setSelectedGroupId(g.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px', borderRadius: 14, border: 'none', cursor: 'pointer', textAlign: 'left',
                    background: sel ? C.accentLight : C.card,
                    outline: sel ? `1.5px solid ${C.accentBorder}` : `1px solid ${C.border}`,
                    transition: 'background 0.15s ease',
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: sel
                      ? (dm ? 'rgba(154,77,90,0.3)' : 'rgba(74,31,35,0.12)')
                      : C.elevated,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '15px', fontWeight: 700,
                    color: sel ? C.accent : C.sub,
                  }}>
                    {g.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '15px', fontWeight: sel ? 700 : 500,
                      color: sel ? C.accent : C.text,
                      margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {g.name}
                    </p>
                  </div>
                  {sel && (
                    <div style={{
                      width: 22, height: 22, borderRadius: 11, flexShrink: 0,
                      background: C.accent,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{ width: 8, height: 8, borderRadius: 4, background: '#FFF' }} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Create new group */}
        {!showCreate ? (
          <button
            onClick={() => setShowCreate(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'none', border: 'none', cursor: 'pointer',
              color: C.accent, fontSize: '14px', fontWeight: 600,
              padding: '16px 4px',
            }}
          >
            <Plus size={16} /> Create new group
          </button>
        ) : (
          <div style={{
            marginTop: 12, background: C.card,
            border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px',
          }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: C.text, margin: '0 0 10px 0' }}>New group name</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
                placeholder="e.g. Flat 503 Kitchen"
                autoFocus
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: 10,
                  border: `1.5px solid ${C.inputBorder}`,
                  fontSize: '14px', outline: 'none',
                  background: C.inputBg, color: C.text,
                }}
              />
              <button
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim()}
                style={{
                  padding: '10px 16px', borderRadius: 10, border: 'none',
                  background: C.accent, color: '#FFF',
                  fontSize: '13px', fontWeight: 700, cursor: newGroupName.trim() ? 'pointer' : 'not-allowed',
                  opacity: newGroupName.trim() ? 1 : 0.4,
                }}
              >
                Create
              </button>
            </div>
            <button
              onClick={() => { setShowCreate(false); setNewGroupName('') }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.sub, fontSize: '13px', padding: '8px 0 0', marginTop: 4 }}
            >
              Cancel
            </button>
          </div>
        )}
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
          disabled={!selectedGroupId}
          style={{
            width: '100%', height: 50, borderRadius: 16, border: 'none',
            cursor: selectedGroupId ? 'pointer' : 'not-allowed',
            background: C.accent, color: '#FFF',
            fontSize: '15px', fontWeight: 700,
            opacity: selectedGroupId ? 1 : 0.4,
          }}
        >
          Continue
        </button>
      </div>

    </div>
  )
}

// Need X icon inline
function X({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
