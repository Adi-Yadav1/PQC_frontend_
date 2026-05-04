/**
 * TransactionHistory.jsx — Filterable transaction history
 */

import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useBlockchain } from '../context/BlockchainContext'
import { authAPI } from '../services/api'
import Card from '../components/Card'
import Table from '../components/Table'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'

function fmtTime(ts) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleString()
}
function shortAddr(addr, len = 14) {
  if (!addr) return '—'
  return addr.length > len + 3 ? `${addr.slice(0, len)}...` : addr
}

const FILTERS = ['All', 'Sent', 'Received']

function DecryptMessage({ tx }) {
  const { user } = useAuth()
  const { decryptTransaction } = useBlockchain()
  const [decryptedMsg, setDecryptedMsg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!tx.encrypted_payload) return <span style={{color: 'var(--color-text-muted)'}}>—</span>
  if (decryptedMsg) return <strong style={{color: 'var(--color-cyan)', fontSize: '0.85rem'}}>{decryptedMsg}</strong>

  const handleDecrypt = async () => {
    setLoading(true)
    setError(null)
    const result = await decryptTransaction(tx.tx_id, user?.id)
    setLoading(false)
    if (result.success && result.data.decrypted_data) {
      setDecryptedMsg(result.data.decrypted_data.message)
    } else {
      setError(result.message || 'Decryption failed')
    }
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '0.25rem'}}>
      <button className="btn btn-secondary btn-sm" onClick={handleDecrypt} disabled={loading} style={{fontSize: '0.7rem', padding: '0.25rem 0.5rem', whiteSpace: 'nowrap', maxWidth: 'fit-content'}}>
        {loading ? 'Decrypting...' : '🔐 Decrypt Kyber'}
      </button>
      {error && <span style={{color: 'var(--color-error)', fontSize: '0.65rem'}} title={error}>Failed (Not recipient?)</span>}
    </div>
  )
}

export default function TransactionHistory() {
  const { user } = useAuth()
  const { fetchTransactions, transactions, loading } = useBlockchain()
  const [walletAddr, setWalletAddr] = useState('')
  const [filter, setFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchTransactions()
    if (user?.id) {
      authAPI.getProfile(user.id)
        .then((res) => {
          setWalletAddr(res.data.wallet_address || '')
        })
        .catch(console.error)
    }
  }, [user?.id, fetchTransactions])

  const filtered = transactions.filter((tx) => {
    const safeWallet = (walletAddr || '').toLowerCase().trim()
    const safeSender = (tx.sender || '').toLowerCase().trim()
    const safeRecipient = (tx.recipient || '').toLowerCase().trim()
    
    // Always restrict to the current user's transactions for the history page
    const isMyTx = safeSender === safeWallet || safeRecipient === safeWallet
    if (!isMyTx && safeWallet) return false

    const matchFilter =
      filter === 'All'      ? true :
      filter === 'Sent'     ? safeSender === safeWallet :
      filter === 'Received' ? safeRecipient === safeWallet : true
      
    const matchSearch = !searchTerm || (
      safeSender.includes(searchTerm.toLowerCase()) ||
      safeRecipient.includes(searchTerm.toLowerCase()) ||
      String(tx.block_index) === searchTerm
    )
    return matchFilter && matchSearch
  })

  const columns = [
    {
      key: 'sender', label: 'From',
      render: (v) => {
        const isMe = (v || '').toLowerCase().trim() === (walletAddr || '').toLowerCase().trim()
        return <span className="mono" title={v} style={{ color: isMe ? 'var(--color-cyan)' : '' }}>{shortAddr(v)}</span>
      }
    },
    {
      key: 'recipient', label: 'To',
      render: (v) => {
        const isMe = (v || '').toLowerCase().trim() === (walletAddr || '').toLowerCase().trim()
        return <span className="mono" title={v} style={{ color: isMe ? 'var(--color-cyan)' : '' }}>{shortAddr(v)}</span>
      }
    },
    {
      key: 'amount', label: 'Amount',
      render: (v, row) => {
        const isSent = (row.sender || '').toLowerCase().trim() === (walletAddr || '').toLowerCase().trim()
        const isReceived = (row.recipient || '').toLowerCase().trim() === (walletAddr || '').toLowerCase().trim()
        const cls = isSent ? 'tx-amount sent' : isReceived ? 'tx-amount received' : 'tx-amount neutral'
        return <span className={cls}>{isSent ? '−' : isReceived ? '+' : ''}{v} PKC</span>
      }
    },
    { key: 'encrypted_payload', label: 'Message', render: (_, row) => <DecryptMessage tx={row} /> },
    { key: 'block_index', label: 'Block', render: (v) => v != null ? <span style={{ color: 'var(--color-purple)' }}>#{v}</span> : '—' },
    { key: 'timestamp', label: 'Time', render: (v) => <span style={{ fontSize: '0.8rem' }}>{fmtTime(v)}</span> },
    { key: 'signature', label: 'Sig', render: (v) => <StatusBadge status={v ? 'valid' : 'invalid'} label="" showDot /> },
  ]

  if (loading && transactions.length === 0) return <LoadingSpinner message="Loading transactions..." />

  return (
    <main className="page-content animate-fade-in">
      <div className="page-header">
        <h1>📋 Transaction History</h1>
        <p>All confirmed transactions recorded on the blockchain.</p>
      </div>
      <Card>
        <div className="history-filters">
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {FILTERS.map((f) => (
              <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)} id={`filter-${f.toLowerCase()}-btn`}>
                {f === 'All' ? '🌐' : f === 'Sent' ? '📤' : '📥'} {f}
              </button>
            ))}
          </div>
          <input className="form-input" style={{ maxWidth: '280px' }}
            placeholder="Search address or block #..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            id="tx-search-input" />
          <button className="btn btn-secondary btn-sm" onClick={() => fetchTransactions()} id="tx-refresh-btn">🔄 Refresh</button>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
          Showing <strong style={{ color: 'var(--color-cyan)' }}>{filtered.length}</strong> transaction(s)
        </div>
        <Table columns={columns} data={filtered}
          emptyMessage={filter !== 'All' ? `No ${filter.toLowerCase()} transactions.` : 'No transactions yet. Send one from the Wallet page!'}
          pageSize={15} loading={loading} />
      </Card>
    </main>
  )
}
