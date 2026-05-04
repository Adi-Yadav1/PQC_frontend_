/**
 * StatusBadge.jsx — Color-coded status indicator
 * Props:
 *   status: 'valid' | 'invalid' | 'pending' | 'info' | 'purple'
 *   label: string (override default label)
 *   showDot: bool (default true)
 */

import React from 'react'

const STATUS_CONFIG = {
  valid:   { label: 'Valid',    cls: 'badge-valid' },
  invalid: { label: 'Invalid',  cls: 'badge-invalid' },
  pending: { label: 'Pending',  cls: 'badge-pending' },
  info:    { label: 'Info',     cls: 'badge-info' },
  purple:  { label: 'PQC',     cls: 'badge-purple' },
  online:  { label: 'Online',   cls: 'badge-valid' },
  offline: { label: 'Offline',  cls: 'badge-invalid' },
  mined:   { label: 'Mined',    cls: 'badge-valid' },
}

export default function StatusBadge({ status = 'info', label, showDot = true }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.info
  const displayLabel = label || config.label

  return (
    <span className={`badge ${config.cls}`}>
      {showDot && <span className="badge-dot" />}
      {displayLabel}
    </span>
  )
}
