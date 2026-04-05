import { Link, useLocation } from 'react-router-dom'
import { Home, CalendarDays, BookOpen, User } from 'lucide-react'

const tabs = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/planner', icon: CalendarDays, label: 'Planner' },
  { href: '/recipes', icon: BookOpen, label: 'Recipes' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export default function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" style={{
      background: 'rgba(255,255,255,0.96)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderTop: '1px solid #EAE4DC',
    }}>
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href === '/home' && pathname.startsWith('/meal/'))
          return (
            <Link
              key={href}
              to={href}
              className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl no-underline transition-smooth"
              style={{ color: active ? '#1F1E2E' : '#A09DAB' }}
            >
              <Icon size={21} strokeWidth={active ? 2.2 : 1.5} />
              <span style={{
                fontSize: '10px',
                fontWeight: active ? 700 : 500,
                letterSpacing: '0.02em',
              }}>{label}</span>
              {active && (
                <div style={{
                  width: 4, height: 4, borderRadius: 2,
                  background: '#1F1E2E', marginTop: -1,
                }} />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
