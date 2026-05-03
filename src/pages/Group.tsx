import { useState } from 'react'
import { Crown, Plus, UserPlus, BookOpen, ChevronRight, X, Users } from 'lucide-react'
import { useStore } from '../store/useStore'
import BottomNav from '../components/BottomNav'
import InviteSheet from '../components/InviteSheet'
import { useNavigate } from 'react-router-dom'

const serifFont2 = "'DM Serif Display', Georgia, serif"

const serifFont = "'DM Serif Display', Georgia, serif"

export default function Group() {
  const navigate = useNavigate()
  const { preferences, groups, groupMembers, sharedRecipes, createGroup, setActiveGroup } = useStore()
  const [showInvite, setShowInvite] = useState(false)
  const [detailGroupId, setDetailGroupId] = useState<string | null>(null)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')

  /* ── Data ── */
  const visibleGroups = groups

  const activeGroup = visibleGroups.find((g) => g.id === preferences.groupId) || visibleGroups[0]

  const getMembersForGroup = (groupId: string) => {
    const members = groupMembers.filter((m) => m.groupId === groupId)
    return members.length > 0
      ? members
      : [{ id: preferences.userId, groupId, name: preferences.name || 'You', role: 'owner' as const }]
  }

  const getRecipesForGroup = (groupId: string) =>
    sharedRecipes.filter((r) => r.groupId === groupId || (!r.groupId && preferences.groupEnabled))

  const detailGroup = detailGroupId
    ? (visibleGroups.find((g) => g.id === detailGroupId) || null)
    : null

  /* ── Colors ── */
  const C = preferences.darkMode
    ? {
        page: '#121212', card: '#1B1B1B', border: '#2E2E2E',
        text: '#FEFEFE', sub: '#A9A0A3', accent: '#9A4D5A',
        soft: 'rgba(154,77,90,0.18)', selBorder: 'rgba(154,77,90,0.4)',
        elevated: '#252525', sheetBg: '#181818',
      }
    : {
        page: '#F5F3F1', card: '#FBFAF8', border: 'rgba(0,0,0,0.07)',
        text: '#1C1C1C', sub: '#6F6B66', accent: '#4A1F23',
        soft: 'rgba(74,31,35,0.06)', selBorder: 'rgba(74,31,35,0.22)',
        elevated: '#EDE9E4', sheetBg: '#F5F3F1',
      }

  const ensureAndInvite = () => {
    if (!preferences.groupEnabled) createGroup(activeGroup.name)
    setDetailGroupId(null)
    setShowInvite(true)
  }

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return
    createGroup(newGroupName.trim())
    setNewGroupName('')
    setShowCreateGroup(false)
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: C.page }}>
      <div className="px-5 pt-14 pb-6">

        {/* ── Header — same layout as Recipes ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p style={{
              fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: C.sub, margin: '0 0 4px 0',
            }}>
              Groups
            </p>
            <h1 style={{ fontFamily: serifFont, fontSize: '32px', fontWeight: 400, color: C.text, margin: 0, lineHeight: 1.1 }}>
              Your groups
            </h1>
          </div>

          {/* ── Create new group ── */}
          <button
            onClick={() => setShowCreateGroup(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer"
            style={{ background: C.accent, color: '#FFF' }}
            aria-label="Create new group"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* ── Empty state ── */}
        {visibleGroups.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '48px 24px',
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 20,
          }}>
            <div style={{ fontSize: '48px', marginBottom: 14 }}>👥</div>
            <p style={{ fontSize: '16px', fontWeight: 600, color: C.text, margin: '0 0 6px 0' }}>
              No groups yet
            </p>
            <p style={{ fontSize: '13px', color: C.sub, lineHeight: 1.55, margin: '0 0 20px 0' }}>
              Create a group to share recipes and meal plans with flatmates or family.
            </p>
            <button
              onClick={() => setShowCreateGroup(true)}
              style={{
                background: C.accent, color: '#FFF', border: 'none',
                borderRadius: 14, padding: '10px 20px',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Create a group
            </button>
          </div>
        )}

        {/* ── Group cards ── */}
        {visibleGroups.length > 0 && (
        <div className="space-y-2.5">
          {visibleGroups.map((group) => {
            const members = getMembersForGroup(group.id)
            const recipes = getRecipesForGroup(group.id)
            const isActive = group.id === activeGroup.id
            return (
              <div
                key={group.id}
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 16,
                  overflow: 'hidden',
                }}
              >
                {/* Clickable top row → opens detail sheet */}
                <button
                  onClick={() => { setActiveGroup(group.id); setDetailGroupId(group.id) }}
                  className="w-full flex items-center gap-4 text-left border-none cursor-pointer transition-smooth"
                  style={{ background: 'transparent', padding: '14px 16px' }}
                >
                  {/* Group icon */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: C.elevated, color: C.sub, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Users size={20} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: '15px', fontWeight: 700, color: C.text, margin: '0 0 5px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {group.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        background: C.elevated, color: C.sub,
                        fontSize: '11px', fontWeight: 600,
                        padding: '2px 8px', borderRadius: 999,
                      }}>
                        <Users size={10} />
                        {members.length} member{members.length === 1 ? '' : 's'}
                      </span>
                      {recipes.length > 0 && (
                        <span style={{ fontSize: '11px', color: C.sub }}>
                          · {recipes.length} recipe{recipes.length === 1 ? '' : 's'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stacked avatars */}
                  <div className="flex items-center" style={{ gap: 0, flexShrink: 0 }}>
                    {members.slice(0, 3).map((m, i) => (
                      <div key={m.id} style={{
                        width: 28, height: 28, borderRadius: 14,
                        marginLeft: i === 0 ? 0 : -8,
                        background: C.elevated, border: `2px solid ${C.card}`,
                        color: C.sub,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700,
                      }}>
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {members.length > 3 && (
                      <div style={{
                        width: 28, height: 28, borderRadius: 14, marginLeft: -8,
                        background: C.elevated, border: `2px solid ${C.card}`,
                        color: C.sub,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700,
                      }}>
                        +{members.length - 3}
                      </div>
                    )}
                  </div>

                  <ChevronRight size={16} style={{ color: C.sub, flexShrink: 0 }} />
                </button>

                {/* Tertiary CTAs at bottom of card */}
                <div style={{ padding: '4px 16px 10px', display: 'flex', gap: 16 }}>
                  <button
                    onClick={() => { setActiveGroup(group.id); ensureAndInvite() }}
                    className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0"
                    style={{ color: C.accent, fontSize: '13px', fontWeight: 700 }}
                  >
                    <UserPlus size={14} />
                    Invite flatmate
                  </button>
                  <button
                    onClick={() => {
                      setActiveGroup(group.id)
                      navigate('/recipes/new', { state: { mode: 'share', lockedGroupId: group.id } })
                    }}
                    className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0"
                    style={{ color: C.accent, fontSize: '13px', fontWeight: 700 }}
                  >
                    <BookOpen size={14} />
                    Add recipe
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        )}

      </div>

      {/* ══════════════════════════════════════════
          Group Detail Bottom Sheet
      ══════════════════════════════════════════ */}
      {detailGroup && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(28,27,31,0.4)' }}
          onClick={() => setDetailGroupId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md animate-slide-up"
            style={{
              background: C.sheetBg,
              borderRadius: '24px 24px 0 0',
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 -4px 24px rgba(28,27,31,0.1)',
            }}
          >
            {/* Drag handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: '10px auto 0' }} />

            {/* Sheet header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3" style={{ flexShrink: 0 }}>
              <div>
                <h2 style={{ fontFamily: serifFont, fontSize: '22px', fontWeight: 400, color: C.text, margin: 0, lineHeight: 1.2 }}>
                  {detailGroup.name}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: C.elevated, color: C.sub,
                    fontSize: '11px', fontWeight: 600,
                    padding: '2px 8px', borderRadius: 999,
                  }}>
                    <Users size={10} />
                    {getMembersForGroup(detailGroup.id).length} member{getMembersForGroup(detailGroup.id).length === 1 ? '' : 's'}
                  </span>
                  <span style={{ fontSize: '11px', color: C.sub, textTransform: 'capitalize' }}>
                    · {detailGroup.role}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDetailGroupId(null)}
                className="flex items-center justify-center border-none cursor-pointer transition-smooth"
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: C.card, color: C.sub,
                  border: `1px solid ${C.border}`,
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 32px' }}>

              {/* ── Members section ── */}
              <p style={{
                fontSize: '11px', fontWeight: 600, color: C.sub,
                textTransform: 'uppercase', letterSpacing: '0.1em', margin: '12px 0 10px 0',
              }}>
                Members ({getMembersForGroup(detailGroup!.id).length})
              </p>

              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', marginBottom: 4 }}>
                {getMembersForGroup(detailGroup.id).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 18,
                      background: C.elevated, color: C.sub,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, flexShrink: 0,
                    }}>
                      {member.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: '14px', fontWeight: 600, color: C.text, margin: 0, lineHeight: 1.2 }}>
                        {member.name}
                      </p>
                      <p style={{ fontSize: '11.5px', color: C.sub, margin: '2px 0 0 0' }}>
                        {member.role === 'owner' ? 'Can manage invites & settings' : 'Can view and share recipes'}
                      </p>
                    </div>

                    <span style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '3px 8px', borderRadius: 999,
                      background: C.elevated, color: C.sub,
                      fontSize: 11, fontWeight: 600, flexShrink: 0,
                    }}>
                      {member.role === 'owner' && <Crown size={11} />}
                      {member.role}
                    </span>
                  </div>
                ))}

                {/* Invite flatmate — tertiary link at bottom of members card */}
                <div style={{ padding: '10px 16px' }}>
                  <button
                    onClick={ensureAndInvite}
                    className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0"
                    style={{ color: C.sub, fontSize: '13px', fontWeight: 500 }}
                  >
                    <UserPlus size={14} />
                    Invite flatmate
                  </button>
                </div>
              </div>

              {/* ── Shared Recipes section ── */}
              <div className="flex items-center justify-between" style={{ margin: '20px 0 10px 0' }}>
                <p style={{
                  fontSize: '11px', fontWeight: 600, color: C.sub,
                  textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0,
                }}>
                  Shared recipes
                </p>
                {getRecipesForGroup(detailGroup.id).length > 0 && (
                  <button
                    onClick={() => { setDetailGroupId(null); navigate('/recipes', { state: { tab: 'shared' } }) }}
                    className="flex items-center gap-1 bg-transparent border-none cursor-pointer"
                    style={{ fontSize: '12px', fontWeight: 600, color: C.sub, padding: 0 }}
                  >
                    See all <ChevronRight size={13} />
                  </button>
                )}
              </div>

              {getRecipesForGroup(detailGroup.id).length === 0 ? (
                <div style={{
                  background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 20, padding: '40px 24px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '40px', marginBottom: 12 }}>🍽️</div>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: C.text, margin: '0 0 6px 0' }}>
                    No shared recipes yet
                  </p>
                  <p style={{ fontSize: '13px', color: C.sub, margin: '0 0 20px 0', lineHeight: 1.5 }}>
                    Be the first to share a recipe with this group.
                  </p>
                  <button
                    onClick={() => { setDetailGroupId(null); navigate('/recipes/new', { state: { mode: 'share', lockedGroupId: detailGroup?.id } }) }}
                    className="flex items-center gap-2 border-none cursor-pointer mx-auto transition-smooth"
                    style={{
                      background: C.accent, color: '#FFF',
                      padding: '10px 20px', borderRadius: 14,
                      fontSize: '14px', fontWeight: 600,
                    }}
                  >
                    <BookOpen size={14} />
                    Share a recipe
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {getRecipesForGroup(detailGroup.id).slice(0, 5).map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => { setDetailGroupId(null); navigate(`/recipe/${recipe.id}`, { state: { recipe: { ...recipe, source: 'shared' } } }) }}
                      className="w-full flex items-center gap-3 text-left border-none cursor-pointer transition-smooth"
                      style={{
                        background: C.card, border: `1px solid ${C.border}`,
                        borderRadius: 13, padding: '11px 14px',
                      }}
                    >
                      <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: C.elevated, color: C.sub,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, flexShrink: 0,
                      }}>
                        {recipe.sharedBy?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: '14px', fontWeight: 600, color: C.text, margin: '0 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {recipe.name}
                        </p>
                        <p style={{ fontSize: '11.5px', color: C.sub, margin: 0 }}>
                          by {recipe.sharedBy}{recipe.mealType ? ` · ${recipe.mealType}` : ''}
                        </p>
                      </div>
                      <ChevronRight size={14} style={{ color: C.sub, flexShrink: 0 }} />
                    </button>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ── Create Group Sheet ── */}
      {showCreateGroup && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(28,27,31,0.4)' }}
          onClick={() => setShowCreateGroup(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md animate-slide-up"
            style={{
              background: C.sheetBg, borderRadius: '24px 24px 0 0',
              padding: '22px 22px 36px',
              boxShadow: '0 -4px 24px rgba(28,27,31,0.1)',
            }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: '0 auto 18px' }} />
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontFamily: serifFont2, fontSize: '22px', fontWeight: 400, color: C.text, margin: 0 }}>
                New group
              </h2>
              <button
                onClick={() => setShowCreateGroup(false)}
                className="flex items-center justify-center border-none cursor-pointer"
                style={{ width: 32, height: 32, borderRadius: '50%', background: C.card, color: C.sub, border: `1px solid ${C.border}` }}
              >
                <X size={15} />
              </button>
            </div>
            <p style={{ fontSize: '13px', color: C.sub, margin: '0 0 16px 0' }}>
              Create a new group to share recipes and meal plans.
            </p>
            <input
              type="text"
              placeholder="e.g. Flat 503 Kitchen"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
              autoFocus
              style={{
                width: '100%', height: 46, padding: '0 14px',
                border: `1px solid ${C.border}`, borderRadius: 14,
                background: C.card, fontSize: '15px', color: C.text,
                outline: 'none', marginBottom: 12, boxSizing: 'border-box',
              }}
            />
            <button
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim()}
              style={{
                width: '100%', height: 46, background: C.accent, border: 'none',
                borderRadius: 14, color: '#FFF', fontSize: '15px', fontWeight: 600,
                cursor: newGroupName.trim() ? 'pointer' : 'not-allowed',
                opacity: newGroupName.trim() ? 1 : 0.5,
              }}
            >
              Create group
            </button>
          </div>
        </div>
      )}

      {showInvite && <InviteSheet onClose={() => setShowInvite(false)} />}
      <BottomNav />
    </div>
  )
}
