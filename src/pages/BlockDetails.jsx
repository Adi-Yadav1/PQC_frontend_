/**
 * BlockDetails.jsx — Single block inspector
 *
 * Shows:
 *  - Block index badge
 *  - Block hash, previous hash, timestamp, signature
 *  - All transactions in the block
 *  - Navigation back to dashboard
 */

import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBlockchain } from '../context/BlockchainContext'
import { useAuth } from '../context/AuthContext'
import Card from '../components/Card'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import Table from '../components/Table'

function fmtTime(ts) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleString()
}

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
      {error && <span style={{color: 'var(--color-error)', fontSize: '0.65rem'}} title={error}>Failed to decrypt (Not recipient?)</span>}
    </div>
  )
}

export default function BlockDetails() {
  const { index } = useParams()
  const navigate = useNavigate()
  const { getBlock } = useBlockchain()

  const [block, setBlock]   = useState(null)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const result = await getBlock(parseInt(index, 10))
      setLoading(false)
      if (result.success) setBlock(result.data)
      else setError(result.message)
    }
    load()
  }, [index])

  const txnColumns = [
    { key: 'sender',    label: 'From', render: (v) => <span className="mono" title={v}>{v?.slice(0,20)}...</span> },
    { key: 'recipient', label: 'To',   render: (v) => <span className="mono" title={v}>{v?.slice(0,20)}...</span> },
    { key: 'amount',    label: 'Amount', render: (v) => <strong style={{ color: 'var(--color-success)' }}>{v} PKC</strong> },
    { key: 'encrypted_payload', label: 'Message', render: (_, row) => <DecryptMessage tx={row} /> },
    { key: 'timestamp', label: 'Time', render: (v) => fmtTime(v) },
  ]

  if (loading) return <LoadingSpinner message={`Loading Block #${index}...`} />

  if (error) {
    return (
      <main className="page-content">
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>⚠ {error}</div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
      </main>
    )
  }

  const isGenesis = block?.index === 0

  return (
    <main className="page-content animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
          ← Back
        </button>
        <div className="block-detail-header">
          <div className="block-index-badge">
            <div className="label">Block</div>
            <div className="value">#{block?.index}</div>
          </div>
          <div>
            <h1>{isGenesis ? '🌱 Genesis Block' : `Block #${block?.index}`}</h1>
            <p>
              {isGenesis
                ? 'The first block in the chain — created automatically on startup.'
                : `Contains ${block?.transaction_count ?? 0} transaction(s). Signed with Lamport PQC.`}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <StatusBadge status={block?.has_signature ? 'valid' : 'pending'} label={block?.has_signature ? 'Signed' : 'Unsigned'} />
          {isGenesis && <StatusBadge status="purple" label="Genesis" />}
          <StatusBadge status="info" label={`${block?.transaction_count ?? 0} Txns`} showDot={false} />
        </div>
      </div>

      <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Block Info */}
        <Card title="Block Information" icon="🧱">
          <div className="block-field">
            <div className="block-field-label">Block Hash</div>
            <div className="hash-display">
              <span className="hash-text">{block?.hash}</span>
            </div>
          </div>
          <div className="block-field" style={{ marginTop: '1rem' }}>
            <div className="block-field-label">Previous Hash</div>
            <div className="hash-display">
              <span className="hash-text">{block?.previous_hash}</span>
            </div>
          </div>
          <div className="block-field" style={{ marginTop: '1rem' }}>
            <div className="block-field-label">Timestamp</div>
            <div className="block-field-value">{block?.timestamp_human}</div>
          </div>
          {!isGenesis && (
            <div className="block-field" style={{ marginTop: '1rem' }}>
              <div className="block-field-label">View Previous Block</div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigate(`/block/${block.index - 1}`)}
              >
                ← Block #{block.index - 1}
              </button>
            </div>
          )}
        </Card>

        {/* Signature Info */}
        <Card title="Cryptographic Proof" icon="🔐">
          <div className="block-field">
            <div className="block-field-label">Signature Type</div>
            <div className="block-field-value">
              <StatusBadge status="purple" label="Lamport (Post-Quantum)" showDot={false} />
            </div>
          </div>
          <div className="block-field" style={{ marginTop: '1rem' }}>
            <div className="block-field-label">Miner Public Key</div>
            <div className="block-field-value" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              {block?.miner_key_present
                ? `✓ Present (${isGenesis ? 'Not used for genesis' : '256-pair Lamport key'})`
                : '✗ Not stored'}
            </div>
          </div>
          <div className="block-field" style={{ marginTop: '1rem' }}>
            <div className="block-field-label">Signature Status</div>
            <div className="block-field-value">
              <StatusBadge
                status={isGenesis ? 'info' : block?.has_signature ? 'valid' : 'invalid'}
                label={isGenesis ? 'Genesis (no sig needed)' : block?.has_signature ? 'Valid Signature' : 'Missing Signature'}
              />
            </div>
          </div>
          <div className="divider" />
          <p style={{ fontSize: '0.8rem' }}>
            Lamport signatures use SHA-256 hash functions to provide quantum-resistant security.
            Each key is used only once per block.
          </p>
        </Card>
      </div>

      {/* Transactions */}
      <Card title={`Transactions (${block?.transaction_count ?? 0})`} icon="💸">
        {block?.transactions?.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>No transactions in this block</h3>
            <p>{isGenesis ? 'The genesis block contains no transactions by design.' : 'This block was mined with an empty transaction pool.'}</p>
          </div>
        ) : (
          <Table
            columns={txnColumns}
            data={block?.transactions ?? []}
            emptyMessage="No transactions"
            pageSize={10}
          />
        )}
      </Card>
    </main>
  )
}
