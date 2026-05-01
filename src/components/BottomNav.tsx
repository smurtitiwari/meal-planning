import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Home, CalendarDays, BookOpen, Plus, Users } from 'lucide-react'

const tabs = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/planner', icon: CalendarDays, label: 'Planner' },
  { isFab: true },
  { href: '/recipes', icon: BookOpen, label: 'Recipes' },
  { href: '/group', icon: Users, label: 'Group' },
]

function FilledIcon({ label, color }: { label: string; color: string }) {
  if (label === 'Home') {
    return (
      <svg width="21" height="21" viewBox="0 0 24 24" fill={color} aria-hidden="true">
        <path d="M12 3.3 4 10v9a2 2 0 0 0 2 2h3.7a.8.8 0 0 0 .8-.8v-5.4c0-.44.36-.8.8-.8h1.4c.44 0 .8.36.8.8v5.4c0 .44.36.8.8.8H18a2 2 0 0 0 2-2v-9l-8-6.7Z" />
      </svg>
    )
  }
  if (label === 'Planner') {
    return (
      <svg width="21" height="21" viewBox="0 0 24 24" fill={color} aria-hidden="true">
        <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8Z" />
      </svg>
    )
  }
  if (label === 'Group') {
    return (
      <svg width="21" height="21" viewBox="0 0 24 24" fill={color} aria-hidden="true">
        <path d="M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.5 20.2C2.5 16.9 5.2 14 8.5 14s6 2.9 6 6.2c0 .44-.36.8-.8.8H3.3a.8.8 0 0 1-.8-.8Zm12.8.8h5.4c.44 0 .8-.36.8-.8 0-2.7-2.1-5.1-4.8-5.6.6 1.05.95 2.27.95 3.6 0 1.22-.96 2.8-2.35 2.8Z" />
      </svg>
    )
  }
  if (label === 'Recipes') {
    return (
      <svg width="21" height="21" viewBox="0 0 24 24" fill={color} aria-hidden="true">
        <path d="M6 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h11a1 1 0 0 0 1-1V6a3 3 0 0 0-3-3H6Zm1.5 4h6a1 1 0 1 1 0 2h-6a1 1 0 1 1 0-2Zm0 4h6a1 1 0 1 1 0 2h-6a1 1 0 1 1 0-2Zm0 4H11a1 1 0 1 1 0 2H7.5a1 1 0 1 1 0-2ZM19 7.5V19a3 3 0 0 0 2-2.82V7.5a2.5 2.5 0 0 0-2-2.45v2.45Z" />
      </svg>
    )
  }
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 12c4.54 0 8 2.4 8 5.2 0 .99-.81 1.8-1.8 1.8H5.8A1.8 1.8 0 0 1 4 20.2C4 17.4 7.46 15 12 15Z" />
    </svg>
  )
}

export default function BottomNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const darkMode = useStore((s) => s.preferences.darkMode)
  const activeColor = darkMode ? '#F0C7CF' : '#4A1F23'
  const inactiveColor = darkMode ? '#A9A0A3' : '#6F6B73'

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40" style={{
        background: darkMode ? 'rgba(17,17,17,0.97)' : 'rgba(247,244,239,0.97)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: `1px solid ${darkMode ? '#2E2E2E' : '#E6E0D8'}`,
      }}>
        <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
          {tabs.map((tab) => {
            if (tab.isFab) {
              return (
                <button
                  key="fab"
                  onClick={() => navigate('/recipes', { state: { openTypePicker: true } })}
                  className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl border-none cursor-pointer outline-none transition-smooth bg-transparent"
                  style={{ color: inactiveColor }}
                >
                  <Plus size={21} strokeWidth={1.7} />
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 500,
                    letterSpacing: '0.02em',
                  }}>Add</span>
                </button>
              )
            }

            const { href, icon: Icon, label } = tab
            const active = pathname === href || (href === '/home' && pathname.startsWith('/meal/'))
            return (
              <Link
                key={href}
                to={href!}
                className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl no-underline transition-smooth"
                style={{ color: active ? activeColor : inactiveColor, background: 'transparent' }}
              >
                {active ? <FilledIcon label={label} color={activeColor} /> : Icon && <Icon size={21} strokeWidth={1.7} />}
                <span style={{
                  fontSize: '10px',
                  fontWeight: active ? 700 : 500,
                  letterSpacing: '0.02em',
                }}>{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

    </>
  )
}
