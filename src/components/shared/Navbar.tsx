import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/hooks/useLang'
import { useNotifications } from '@/hooks/useNotifications'
import { Button } from './UI'
import clsx from 'clsx'

export function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const { T, toggleLang }   = useLang()
  const { isEnabled, enableNotifications } = useNotifications()
  const loc = useLocation()

  const userLinks = [
    { to: '/app/queries',  label: T('myQueries') },
    { to: '/app/ask',      label: T('askQuery') },
    { to: '/app/persons',  label: T('savedPersons') },
  ]
  const adminLinks = [
    { to: '/admin/dashboard', label: T('dashboard') },
    { to: '/admin/inbox',     label: T('queryInbox') },
    { to: '/admin/templates', label: T('templates') },
    { to: '/admin/remedies',  label: T('remedies') },
  ]
  const links = isAdmin ? adminLinks : userLinks

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🔮</span>
          <span className="font-semibold text-gray-900 hidden sm:block">
            {T('appName')}
          </span>
        </Link>

        {/* Nav links — desktop */}
        {user && (
          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-sm transition-colors',
                  loc.pathname.startsWith(l.to)
                    ? 'bg-saffron-50 text-saffron-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Notification Bell */}
          {user && !isEnabled && (
            <button
              onClick={enableNotifications}
              className="relative p-2 text-gray-600 hover:text-saffron-600 hover:bg-saffron-50 rounded-lg transition-colors"
              title="Enable notifications"
            >
              <span className="text-xl">🔔</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          )}
          
          {/* Language toggle */}
          <button
            onClick={toggleLang}
            className="text-xs font-medium bg-saffron-50 text-saffron-700 border border-saffron-200 px-2.5 py-1 rounded-full hover:bg-saffron-100 transition-colors"
          >
            {T('switchLang')}
          </button>

          {user ? (
            <Button variant="ghost" size="sm" onClick={logout}>
              {T('logout')}
            </Button>
          ) : (
            <Link to="/login">
              <Button size="sm">{T('login')}</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      {user && (
        <div className="md:hidden flex overflow-x-auto gap-1 px-4 pb-2 scrollbar-hide">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={clsx(
                'px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors shrink-0',
                loc.pathname.startsWith(l.to)
                  ? 'bg-saffron-500 text-white font-medium'
                  : 'bg-gray-100 text-gray-600'
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
