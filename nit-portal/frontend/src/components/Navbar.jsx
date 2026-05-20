import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import './Navbar.css'

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/drives', label: 'All Drives' },
    { to: '/stats', label: 'Statistics' },
  ]

  if (user?.role === 'student') {
    navLinks.push({ to: '/profile', label: 'My Profile' })
    navLinks.push({ to: '/applications', label: 'My Applications' })
  }

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          <span className="brand-badge">NIT</span>
          <div className="brand-name">
            <span>Placement</span>
            <small>Portal 2026</small>
          </div>
        </Link>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="nav-right">
          <button className="theme-toggle" onClick={toggle} title="Toggle theme">
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>

          {user ? (
            <div className="user-menu">
              <div className="user-pill">
                <span className="user-dot" />
                <span className="user-name">{user.name || user.username}</span>
                <span className="user-role">{user.role}</span>
              </div>
              <button className="btn-ghost" onClick={handleLogout}>Sign out</button>
            </div>
          ) : (
            <div style={{display: 'flex', gap: '10px'}}>
              <Link to="/login" className="btn-ghost">Login</Link>
              <Link to="/register" className="btn-primary-sm">Register</Link>
            </div>
          )}

          <button className="hamburger" onClick={() => setMenuOpen(o => !o)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  )
}
