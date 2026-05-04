/**
 * LoadingSpinner.jsx — Animated spinner component
 * Props:
 *   size: 'sm' | 'md' | 'lg'  (default: 'md')
 *   fullScreen: bool           (overlay the whole page)
 *   message: string            (optional text below spinner)
 *   inline: bool               (no wrapper div)
 */

import React from 'react'

export default function LoadingSpinner({
  size = 'md',
  fullScreen = false,
  message = 'Loading...',
  inline = false,
}) {
  const spinnerClass = `spinner ${size === 'sm' ? 'spinner-sm' : size === 'lg' ? 'spinner-lg' : ''}`

  if (inline) {
    return <div className={spinnerClass} role="status" aria-label="Loading" />
  }

  if (fullScreen) {
    return (
      <div className="loading-full" role="status">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className={`spinner spinner-lg`} />
          {message && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{message}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="loading-overlay" role="status">
      <div className={spinnerClass} />
      {message && <p>{message}</p>}
    </div>
  )
}
