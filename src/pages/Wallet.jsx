/**
 * Wallet.jsx — Wallet management page
 *
 * Features:
 *  - Show wallet address (copy-to-clipboard)
 *  - Show current balance (live from API)
 *  - Send transaction form (with balance enforcement)
 *  - Mine block button
 *  - Pending transactions display
 */

import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useBlockchain } from '../context/BlockchainContext'
import { authAPI, blockchainAPI } from '../services/api'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'

export default function Wallet() {
  const { user } = useAuth()
  const { addTransaction, mineBlock, fetchPending, pending } = useBlockchain()

  const [profile, setProfile]         = useState(null)
  const [balance, setBalance]         = useState(0)
  const [loadingProfile, setLoadingProfile] = useState(true)

  // Send form state
  const [recipient, setRecipient]     = useState('')
  const [amount, setAmount]           = useState('')
  const [message, setMessage]         = useState('')
  const [sendLoading, setSendLoading] = useState(false)
  const [sendMsg, setSendMsg]         = useState(null) // { type, text }

  // Mine state
  const [mineLoading, setMineLoading] = useState(false)
  const [mineMsg, setMineMsg]         = useState(null)

  // Copy state
  const [copied, setCopied]           = useState(false)

  // Unlock state
  const [walletUnlocked, setWalletUnlocked] = useState(false)
  const [walletPassword, setWalletPassword] = useState('')
  const [unlockLoading, setUnlockLoading]   = useState(false)
  const [unlockError, setUnlockError]       = useState(null)

  // ---- Load Profile & Balance ---- //
  const loadProfile = useCallback(async () => {
    if (!user?.id) return
    setLoadingProfile(true)
    try {
      const [profileRes, balRes] = await Promise.all([
        authAPI.getProfile(user.id),
        blockchainAPI.getBalance(user.id),
      ])
      setProfile(profileRes.data)
      setBalance(balRes.data.balance ?? 0)
    } catch (err) {
      console.error('Failed to load profile:', err.message)
    } finally {
      setLoadingProfile(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadProfile()
    fetchPending()
  }, [loadProfile])

  // ---- Copy Address ---- //
  const copyAddress = async () => {
    const addr = profile?.wallet_address
    if (!addr) return
    await navigator.clipboard.writeText(addr)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ---- Send Transaction ---- //
  const handleSend = async (e) => {
    e.preventDefault()
    setSendMsg(null)

    const amt = parseFloat(amount)
    if (!recipient.trim()) { setSendMsg({ type: 'error', text: 'Recipient address is required' }); return }
    if (!amount || isNaN(amt) || amt <= 0) { setSendMsg({ type: 'error', text: 'Enter a valid positive amount' }); return }
    if (amt > balance) { setSendMsg({ type: 'error', text: `Insufficient balance (${balance.toFixed(2)} PKC available)` }); return }
    if (recipient.trim() === profile?.wallet_address) { setSendMsg({ type: 'error', text: 'Cannot send to your own wallet' }); return }

    setSendLoading(true)
    const result = await addTransaction(user.id, recipient.trim(), amt, message.trim(), walletPassword)
    setSendLoading(false)

    if (result.success) {
      const newBal = result.data.new_balance
      setBalance(newBal)
      setSendMsg({ type: 'success', text: `✓ Transaction sent! New balance: ${newBal.toFixed(2)} PKC` })
      setRecipient('')
      setAmount('')
      setMessage('')
      fetchPending()
    } else {
      if (result.message === 'Invalid wallet password') {
        setWalletUnlocked(false)
        setWalletPassword('')
      }
      setSendMsg({ type: 'error', text: result.message })
    }
  }

  // ---- Unlock Wallet ---- //
  const handleUnlock = async (e) => {
    e.preventDefault()
    setUnlockError(null)
    setUnlockLoading(true)
    try {
      const res = await authAPI.verifyPassword(user.id, walletPassword)
      if (res.data.valid) {
        setWalletUnlocked(true)
      }
    } catch (err) {
      setUnlockError(err.message || 'Invalid password')
      setWalletPassword('')
    } finally {
      setUnlockLoading(false)
    }
  }

  // ---- Mine Block ---- //
  const handleMine = async () => {
    setMineMsg(null)
    setMineLoading(true)
    const result = await mineBlock(profile?.wallet_address || '')
    setMineLoading(false)

    if (result.success) {
      const { block, mined_transactions } = result.data
      setMineMsg({
        type: 'success',
        text: `✓ Block #${block.index} mined! Confirmed ${mined_transactions} transaction(s).`
      })
      // Refresh balance (might receive mining rewards in future)
      const balRes = await blockchainAPI.getBalance(user.id)
      setBalance(balRes.data.balance ?? balance)
      fetchPending()
    } else {
      setMineMsg({ type: 'error', text: result.message })
    }
  }

  if (loadingProfile) return <LoadingSpinner message="Loading wallet..." />

  if (!walletUnlocked) {
    return (
      <main className="page-content animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Card title="Unlock Wallet" icon="🔐" style={{ maxWidth: '400px', width: '100%' }}>
          <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>
            Please enter your password to unlock your wallet for making transactions.
          </p>
          {unlockError && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              {unlockError}
            </div>
          )}
          <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="wallet-password">Password</label>
              <input
                id="wallet-password"
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={walletPassword}
                onChange={(e) => setWalletPassword(e.target.value)}
                disabled={unlockLoading}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={unlockLoading || !walletPassword}
            >
              {unlockLoading ? <LoadingSpinner size="sm" inline /> : 'Unlock Wallet'}
            </button>
          </form>
        </Card>
      </main>
    )
  }

  return (
    <main className="page-content animate-fade-in">
      <div className="page-header">
        <h1>💼 My Wallet</h1>
        <p>Manage your PKC tokens and send transactions using Lamport-signed transfers.</p>
      </div>

      <div className="wallet-grid">
        {/* Left: Wallet Info */}
        <div>
          <Card title="Wallet Information" icon="🗂" glow>
            {/* Balance */}
            <div className="balance-display">
              <div className="balance-label">Current Balance</div>
              <div className="balance-amount">{balance.toFixed(2)}</div>
              <div className="balance-currency">PKC tokens</div>
            </div>

            {/* Address */}
            <div className="wallet-address-box">
              <div className="wallet-address-label">Your Wallet Address</div>
              <div className="wallet-address-value">
                {profile?.wallet_address || 'Not assigned'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                className={`btn btn-secondary btn-sm copy-btn ${copied ? 'copied' : ''}`}
                onClick={copyAddress}
                id="copy-address-btn"
                disabled={!profile?.wallet_address}
              >
                {copied ? '✓ Copied!' : '📋 Copy Address'}
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={loadProfile}
                id="refresh-wallet-btn"
              >
                🔄 Refresh
              </button>
            </div>

            <div className="divider" />

            {/* User info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Username</span>
              <strong>{user?.username}</strong>
            </div>
          </Card>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Send Transaction */}
          <Card title="Send Transaction" icon="💸">
            {sendMsg && (
              <div className={`alert alert-${sendMsg.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '1rem' }}>
                {sendMsg.text}
              </div>
            )}
            <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="tx-from">From</label>
                <input
                  id="tx-from"
                  className="form-input"
                  value={profile?.wallet_address ? `${profile.wallet_address.slice(0, 20)}...` : ''}
                  readOnly
                  style={{ opacity: 0.6 }}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="tx-to">To (Wallet Address)</label>
                <input
                  id="tx-to"
                  className="form-input"
                  placeholder="Paste recipient's 64-char wallet address"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  disabled={sendLoading}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="tx-amount">Amount (PKC)</label>
                <input
                  id="tx-amount"
                  type="number"
                  className="form-input"
                  placeholder={`Max: ${balance.toFixed(2)} PKC`}
                  min="0.01"
                  max={balance}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={sendLoading}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="tx-message">Secure Message (Optional, encrypted via Kyber)</label>
                <input
                  id="tx-message"
                  className="form-input"
                  placeholder="Only the recipient can read this message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={sendLoading}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={sendLoading || balance <= 0}
                id="send-tx-btn"
              >
                {sendLoading ? <><LoadingSpinner size="sm" inline /> Signing & Sending...</> : '🚀 Send Transaction'}
              </button>
            </form>
          </Card>

          {/* Mining */}
          <Card title="Block Mining" icon="⛏">
            {/* Pending count */}
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                Pending transactions:
              </span>
              <span className={`pending-badge ${pending.length > 0 ? '' : ''}`}>
                {pending.length > 0 ? `⏳ ${pending.length}` : '0'} pending
              </span>
            </div>

            <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
              Mining collects all pending transactions into a new block,
              signs it with a Lamport key, and appends it to the blockchain.
            </p>

            {mineMsg && (
              <div className={`alert alert-${mineMsg.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '1rem' }}>
                {mineMsg.text}
              </div>
            )}

            <button
              className="btn btn-primary"
              onClick={handleMine}
              disabled={mineLoading || pending.length === 0}
              id="mine-block-btn"
            >
              {mineLoading ? <><LoadingSpinner size="sm" inline /> Mining...</> : '⛏ Mine Block'}
            </button>
          </Card>
        </div>
      </div>
    </main>
  )
}
