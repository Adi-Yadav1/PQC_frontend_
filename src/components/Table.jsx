/**
 * Table.jsx — Reusable data table with pagination
 * Props:
 *   columns: Array<{ key, label, render? }>
 *   data: Array<object>
 *   onRowClick?: (row) => void
 *   emptyMessage?: string
 *   pageSize?: number (default 10)
 *   loading?: bool
 */

import React, { useState } from 'react'
import LoadingSpinner from './LoadingSpinner'

export default function Table({
  columns = [],
  data = [],
  onRowClick,
  emptyMessage = 'No data available',
  pageSize = 10,
  loading = false,
}) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize))
  const start = (page - 1) * pageSize
  const pageData = data.slice(start, start + pageSize)

  // Reset to page 1 when data changes
  React.useEffect(() => { setPage(1) }, [data.length])

  if (loading) return <LoadingSpinner message="Fetching data..." />

  return (
    <div>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="table-empty">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageData.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className={onRowClick ? 'table-row-link' : ''}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
              acc.push(p)
              return acc
            }, [])
            .map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="pagination-info">…</span>
              ) : (
                <button
                  key={p}
                  className={`pagination-btn ${page === p ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              )
            )}

          <button
            className="pagination-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next →
          </button>

          <span className="pagination-info">
            {start + 1}–{Math.min(start + pageSize, data.length)} of {data.length}
          </span>
        </div>
      )}
    </div>
  )
}
