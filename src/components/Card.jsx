/**
 * Card.jsx — Glassmorphism card container
 * Props:
 *   title: string     (optional header title)
 *   icon: string      (optional emoji icon in header)
 *   action: ReactNode (optional right-side header action)
 *   glow: bool        (add cyan glow border)
 *   className: string
 *   children: ReactNode
 */

import React from 'react'

export default function Card({
  title,
  icon,
  action,
  glow = false,
  className = '',
  children,
  style,
}) {
  return (
    <div
      className={`card ${glow ? 'card-glow' : ''} ${className}`}
      style={style}
    >
      {(title || action) && (
        <div className="card-header">
          {title && (
            <h3 className="card-title">
              {icon && <span className="card-title-icon">{icon}</span>}
              {title}
            </h3>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  )
}

/**
 * StatCard — Compact metric display card
 * Props:
 *   label: string
 *   value: string | number
 *   icon: string
 *   color: 'cyan' | 'purple' | 'success' | ''
 *   sub: string (optional subtitle)
 */
export function StatCard({ label, value, icon, color = '', sub }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{icon && `${icon} `}{label}</div>
      <div className={`stat-value ${color}`}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}
