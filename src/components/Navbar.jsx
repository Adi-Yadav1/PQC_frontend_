/**
 * Navbar.jsx — Top navigation bar
 *
 * Shows: logo, nav links, user info, logout button.
 * Active link is highlighted. Mobile-responsive with hamburger toggle.
 */

import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_LINKS = [
  { to: '/dashboard', label: '📊 Dashboard' },
  { to: '/wallet',    label: '💼 Wallet' },
  { to: '/history',   label: '📋 History' },
  { to: '/search',    label: '🔍 Search' },
  { to: '/explorer',  label: '🌐 Explorer' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??'

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      {/* Brand */}
      <NavLink to="/dashboard" className="navbar-brand" onClick={() => setMenuOpen(false)}>
        <div className="navbar-brand-icon">🔐</div>
        <span>PQC Wallet</span>
      </NavLink>

      {/* Nav Links */}
      <div className={`navbar-nav ${menuOpen ? 'open' : ''}`}>
        {NAV_LINKS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </NavLink>
        ))}
      </div>

      {/* User + Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {user && (
          <div className="navbar-user">
            <div className="navbar-avatar" aria-hidden="true">{initials}</div>
            <span className="navbar-username">{user.username}</span>
            <button
              className="navbar-logout"
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
            >
              ⏻
            </button>
          </div>
        )}

        {/* Mobile hamburger */}
        <button
          className="navbar-mobile-toggle"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  )
}
