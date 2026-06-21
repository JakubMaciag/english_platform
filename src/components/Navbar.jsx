import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { authService } from '../services/supabase'

const LEVEL_COLOR = { B2: 'bg-green-100 text-green-800', C1: 'bg-blue-100 text-blue-800', C2: 'bg-purple-100 text-purple-800' }

const navLinks = [
  { to: '/dashboard',  label: 'Dashboard' },
  { to: '/dictionary', label: 'Dictionary' },
  { to: '/exercises',  label: 'Exercises' },
  { to: '/progress',   label: 'Progress' },
]

export default function Navbar() {
  const { profile } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await authService.logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <NavLink to="/dashboard" className="flex items-center gap-2 font-bold text-primary-700 text-lg">
            <span className="text-2xl">🇬🇧</span>
            <span className="hidden sm:block">EngPlatform</span>
          </NavLink>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            {profile?.role === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'bg-orange-50 text-orange-700' : 'text-orange-600 hover:bg-orange-50'
                  }`
                }
              >
                Admin
              </NavLink>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {profile && (
              <>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LEVEL_COLOR[profile.level]}`}>
                  {profile.level}
                </span>
                <span className="text-sm text-gray-700 font-medium">{profile.username}</span>
              </>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors px-2 py-1"
            >
              Logout
            </button>
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            {profile?.role === 'admin' && (
              <NavLink to="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-md">
                Admin
              </NavLink>
            )}
            <div className="pt-2 border-t border-gray-200 flex items-center justify-between px-3">
              <div className="flex items-center gap-2">
                {profile && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LEVEL_COLOR[profile?.level]}`}>
                    {profile.level}
                  </span>
                )}
                <span className="text-sm text-gray-700">{profile?.username}</span>
              </div>
              <button onClick={handleLogout} className="text-sm text-red-500">Logout</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
