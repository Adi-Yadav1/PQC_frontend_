/**
 * Dashboard.jsx — Main analytics dashboard
 *
 * Shows:
 *  - Stats grid: total blocks, transactions, pending, validity
 *  - Latest blocks table (clickable → BlockDetails)
 *  - Latest transactions table
 *  - Network status
 */

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBlockchain } from '../context/BlockchainContext'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { StatCard } from '../components/Card'
import Card from '../components/Card'
import Table from '../components/Table'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'

// Helper: format unix timestamp to readable string
function fmtTime(ts) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleString()
}

// Helper: truncate hash for display
function shortHash(hash, len = 16) {
  if (!hash) return '—'
  return `${hash.slice(0, len)}...`
}

export default function Dashboard() {
  const { user } = useAuth()
  const {
    fetchStats, fetchBlocks, fetchTransactions,
    blocks, transactions, stats, isValid, loading
  } = useBlockchain()
  const navigate = useNavigate()
  const [refreshing, setRefreshing] = useState(false)
  const [walletAddr, setWalletAddr] = useState('')

  const load = async () => {
    setRefreshing(true)
    await Promise.all([fetchStats(), fetchBlocks(), fetchTransactions()])
    if (user?.id) {
      try {
        const res = await authAPI.getProfile(user.id)
        setWalletAddr(res.data.wallet_address || '')
      } catch (err) {
        console.error(err)
      }
    }
    setRefreshing(false)
  }

  useEffect(() => { load() }, [user?.id])

  const latestBlocks = [...blocks].reverse().slice(0, 6)
  const userTxns = transactions.filter(tx => {
    if (!walletAddr) return false;
    const safeWallet = walletAddr.toLowerCase().trim();
    const safeSender = (tx.sender || '').toLowerCase().trim();
    const safeRecipient = (tx.recipient || '').toLowerCase().trim();
    return safeSender === safeWallet || safeRecipient === safeWallet;
  })
  const latestTxns = [...userTxns].slice(0, 8)

  // Table column definitions
  const blockColumns = [
    { key: 'index', label: '#', render: (v) => <strong style={{ color: 'var(--color-cyan)' }}>#{v}</strong> },
    { key: 'hash',  label: 'Hash', render: (v) => <span className="mono">{shortHash(v)}</span> },
    { key: 'transactions', label: 'Txns', render: (v) => v?.length ?? 0 },
    { key: 'timestamp', label: 'Time', render: (v) => fmtTime(v) },
  ]

  const txnColumns = [
    { key: 'sender',    label: 'From', render: (v) => <span className="mono">{shortHash(v, 12)}</span> },
    { key: 'recipient', label: 'To',   render: (v) => <span className="mono">{shortHash(v, 12)}</span> },
    { key: 'amount',    label: 'Amount', render: (v) => <strong style={{ color: 'var(--color-success)' }}>{v} PKC</strong> },
    { key: 'block_index', label: 'Block', render: (v) => v != null ? `#${v}` : '—' },
    { key: 'timestamp', label: 'Time', render: (v) => fmtTime(v) },
  ]

  if (loading && !stats) return <LoadingSpinner message="Loading blockchain..." />

  return (
    <main className="page-content animate-fade-in">
      {/* Hero */}
      <div className="dashboard-hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>
              Welcome back, <span>{user?.username}</span> 👋
            </h1>
            <p>Your post-quantum blockchain overview — all transactions secured with Lamport signatures.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <StatusBadge status={isValid ? 'valid' : 'invalid'} label={isValid ? 'Chain Valid' : 'Chain Invalid'} />
            <StatusBadge status="online" label="Network Online" />
            <button
              className="btn btn-secondary btn-sm"
              onClick={load}
              disabled={refreshing}
              id="dashboard-refresh-btn"
            >
              {refreshing ? <LoadingSpinner size="sm" inline /> : '🔄'} Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          label="Total Blocks"
          value={stats?.total_blocks ?? blocks.length}
          icon="⛓"
          color="cyan"
          sub="Including genesis block"
        />
        <StatCard
          label="Transactions"
          value={stats?.total_transactions ?? transactions.length}
          icon="💸"
          color="purple"
          sub="Confirmed on-chain"
        />
        <StatCard
          label="Pending"
          value={stats?.pending_transactions ?? 0}
          icon="⏳"
          color={stats?.pending_transactions > 0 ? '' : 'success'}
          sub="Awaiting mining"
        />
        <StatCard
          label="Chain Status"
          value={isValid ? '✓ Valid' : '✗ Invalid'}
          icon="🛡"
          color={isValid ? 'success' : ''}
          sub={isValid ? 'All signatures verified' : 'Integrity issue detected'}
        />
      </div>

      {/* Tables row */}
      <div className="dashboard-tables">
        {/* Latest Blocks */}
        <Card title="Latest Blocks" icon="⛓">
          <Table
            columns={blockColumns}
            data={latestBlocks}
            onRowClick={(row) => navigate(`/block/${row.index}`)}
            emptyMessage="No blocks yet — mine the first one!"
            pageSize={6}
            loading={loading && blocks.length === 0}
          />
        </Card>

        {/* Latest Transactions */}
        <Card title="Latest Transactions" icon="💸">
          <Table
            columns={txnColumns}
            data={latestTxns}
            emptyMessage="No transactions yet."
            pageSize={8}
            loading={loading && transactions.length === 0}
          />
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions" icon="⚡" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/wallet')} id="dashboard-wallet-btn">
            💼 Open Wallet
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/search')} id="dashboard-search-btn">
            🔍 Search Blockchain
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/history')} id="dashboard-history-btn">
            📋 Transaction History
          </button>
        </div>
      </Card>
    </main>
  )
}
