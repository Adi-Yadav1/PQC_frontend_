/**
 * Search.jsx — Global blockchain search page
 *
 * Search by:
 *  - Block Index (number)
 *  - Block Hash (full or partial hex)
 *  - Wallet Address (shows all transactions)
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBlockchain } from '../context/BlockchainContext'
import Card from '../components/Card'
import Table from '../components/Table'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'

const SEARCH_TYPES = [
  { key: 'block',   label: '# Block Index',  placeholder: 'Enter block number (e.g. 1)',      icon: '⛓' },
  { key: 'hash',    label: '# Block Hash',   placeholder: 'Enter full or partial block hash', icon: '🔗' },
  { key: 'address', label: '🔑 Wallet Address', placeholder: 'Enter 64-char wallet address',  icon: '💼' },
]

function fmtTime(ts) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleString()
}
function shortStr(s, len = 16) {
  if (!s) return '—'
  return s.length > len + 3 ? `${s.slice(0, len)}...` : s
}

export default function Search() {
  const { searchBlockchain } = useBlockchain()
  const navigate = useNavigate()

  const [searchType, setSearchType]     = useState('block')
  const [query, setQuery]               = useState('')
  const [results, setResults]           = useState([])
  const [searched, setSearched]         = useState(false)
  const [found, setFound]               = useState(false)
  const [count, setCount]               = useState(0)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')

  const currentType = SEARCH_TYPES.find((t) => t.key === searchType)

  const handleSearch = async (e) => {
    e?.preventDefault()
    if (!query.trim()) { setError('Please enter a search query'); return }
    setError('')
    setLoading(true)
    const result = await searchBlockchain(searchType, query.trim())
    setLoading(false)
    setSearched(true)
    setResults(result.results || [])
    setFound(result.found || false)
    setCount(result.count || 0)
    if (!result.success) setError(result.message || 'Search failed')
  }

  const handleTypeChange = (type) => {
    setSearchType(type)
    setQuery('')
    setResults([])
    setSearched(false)
    setError('')
  }

  // Block result columns
  const blockColumns = [
    { key: 'index', label: 'Index', render: (v) => <strong style={{ color: 'var(--color-cyan)' }}>#{v}</strong> },
    { key: 'hash', label: 'Hash', render: (v) => <span className="mono">{shortStr(v)}</span> },
    { key: 'transaction_count', label: 'Txns' },
    { key: 'timestamp_human', label: 'Time' },
    { key: 'has_signature', label: 'Signed', render: (v) => <StatusBadge status={v ? 'valid' : 'invalid'} label="" showDot /> },
  ]

  // Address result columns (transactions)
  const txColumns = [
    { key: 'sender',    label: 'From',   render: (v) => <span className="mono">{shortStr(v)}</span> },
    { key: 'recipient', label: 'To',     render: (v) => <span className="mono">{shortStr(v)}</span> },
    { key: 'amount',    label: 'Amount', render: (v) => <strong style={{ color: 'var(--color-success)' }}>{v} PKC</strong> },
    { key: 'block_index', label: 'Block', render: (v) => v != null ? `#${v}` : '—' },
    { key: 'timestamp', label: 'Time', render: (v) => fmtTime(v) },
  ]

  const columns = searchType === 'address' ? txColumns : blockColumns
  const rowClickHandler = searchType !== 'address'
    ? (row) => navigate(`/block/${row.index}`)
    : undefined

  return (
    <main className="page-content animate-fade-in">
      <div className="page-header">
        <h1>🔍 Search Blockchain</h1>
        <p>Find blocks by index or hash, or explore transactions by wallet address.</p>
      </div>

      {/* Search Type Selector */}
      <div className="search-types">
        {SEARCH_TYPES.map((t) => (
          <button
            key={t.key}
            className={`search-type-btn ${searchType === t.key ? 'active' : ''}`}
            onClick={() => handleTypeChange(t.key)}
            id={`search-type-${t.key}-btn`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Search Form */}
      <Card>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '240px' }}>
            <label className="form-label" htmlFor="search-query">{currentType?.label}</label>
            <input
              id="search-query"
              className="form-input"
              placeholder={currentType?.placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type={searchType === 'block' ? 'number' : 'text'}
              min={searchType === 'block' ? 0 : undefined}
              disabled={loading}
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !query.trim()}
            id="search-submit-btn"
          >
            {loading ? <><LoadingSpinner size="sm" inline /> Searching...</> : '🔍 Search'}
          </button>
          {searched && (
            <button type="button" className="btn btn-secondary"
              onClick={() => { setQuery(''); setResults([]); setSearched(false); }}
            >
              ✕ Clear
            </button>
          )}
        </form>

        {error && (
          <div className="alert alert-error" style={{ marginTop: '1rem' }}>⚠ {error}</div>
        )}
      </Card>

      {/* Results */}
      {searched && !loading && (
        <Card style={{ marginTop: '1.5rem' }}
          title={`Search Results`}
          icon="📊"
          action={
            <StatusBadge
              status={found ? 'valid' : 'invalid'}
              label={found ? `${count} found` : 'Not found'}
              showDot
            />
          }
        >
          {!found ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔎</div>
              <h3>No results found</h3>
              <p>
                {searchType === 'block'
                  ? `Block #${query} does not exist in the chain.`
                  : searchType === 'hash'
                  ? 'No block matches this hash.'
                  : 'No transactions found for this wallet address.'}
              </p>
            </div>
          ) : (
            <Table
              columns={columns}
              data={results}
              onRowClick={rowClickHandler}
              pageSize={10}
            />
          )}
        </Card>
      )}

      {/* Tips */}
      {!searched && (
        <div className="grid-3" style={{ marginTop: '1.5rem' }}>
          {SEARCH_TYPES.map((t) => (
            <Card key={t.key} title={t.label} icon={t.icon}>
              <p style={{ fontSize: '0.875rem' }}>{t.placeholder}</p>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
