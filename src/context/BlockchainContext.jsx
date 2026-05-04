/**
 * BlockchainContext.jsx — Blockchain data state management
 *
 * Provides: blocks, transactions, stats, loading, error,
 *           fetchBlocks(), fetchTransactions(), addTransaction(),
 *           mineBlock(), verifyBlockchain(), searchBlockchain()
 */

import React, { createContext, useContext, useState, useCallback } from 'react'
import { blockchainAPI } from '../services/api'

const BlockchainContext = createContext(null)

export function BlockchainProvider({ children }) {
  const [blocks, setBlocks]               = useState([])
  const [transactions, setTransactions]   = useState([])
  const [pending, setPending]             = useState([])
  const [stats, setStats]                 = useState(null)
  const [isValid, setIsValid]             = useState(true)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState(null)

  const withLoading = async (fn) => {
    setLoading(true)
    setError(null)
    try {
      return await fn()
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /** Fetch all blocks */
  const fetchBlocks = useCallback(async () => {
    return withLoading(async () => {
      const res = await blockchainAPI.getChain()
      setBlocks(res.data.blocks || [])
      setIsValid(res.data.is_valid)
      return res.data
    })
  }, [])

  /** Fetch all confirmed transactions, optionally filtered by address */
  const fetchTransactions = useCallback(async (address = '') => {
    return withLoading(async () => {
      const res = await blockchainAPI.getTransactions(address)
      setTransactions(res.data.transactions || [])
      return res.data
    })
  }, [])

  /** Fetch pending (unconfirmed) transactions */
  const fetchPending = useCallback(async () => {
    const res = await blockchainAPI.getPending()
    setPending(res.data.pending_transactions || [])
    return res.data
  }, [])

  /** Fetch dashboard stats */
  const fetchStats = useCallback(async () => {
    const res = await blockchainAPI.getStats()
    setStats(res.data)
    setIsValid(res.data.is_valid)
    return res.data
  }, [])

  /**
   * Send a transaction.
   * @returns {{ success, data, message }}
   */
  const addTransaction = useCallback(async (userId, recipient, amount, message, password) => {
    try {
      const res = await blockchainAPI.sendTransaction(userId, recipient, amount, message, password)
      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }, [])

  /**
   * Decrypt a transaction message.
   * @returns {{ success, data, message }}
   */
  const decryptTransaction = useCallback(async (txId, userId) => {
    try {
      const res = await blockchainAPI.decryptTransaction(txId, userId)
      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }, [])

  /**
   * Mine a new block.
   * @returns {{ success, data, message }}
   */
  const mineBlock = useCallback(async (minerAddress = '') => {
    try {
      const res = await blockchainAPI.mine(minerAddress)
      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }, [])

  /** Verify blockchain integrity */
  const verifyBlockchain = useCallback(async () => {
    const res = await blockchainAPI.verify()
    setIsValid(res.data.valid)
    return res.data
  }, [])

  /**
   * Search the blockchain.
   * @param {string} type - 'block' | 'hash' | 'address'
   * @param {string} query
   * @returns {{ success, results, count, found }}
   */
  const searchBlockchain = useCallback(async (type, query) => {
    try {
      const res = await blockchainAPI.search(type, query)
      return { success: true, ...res.data }
    } catch (err) {
      return { success: false, results: [], count: 0, found: false, message: err.message }
    }
  }, [])

  /** Get a single block by index */
  const getBlock = useCallback(async (index) => {
    try {
      const res = await blockchainAPI.getBlock(index)
      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }, [])

  const value = {
    blocks, transactions, pending, stats, isValid, loading, error,
    fetchBlocks, fetchTransactions, fetchPending, fetchStats,
    addTransaction, mineBlock, verifyBlockchain, searchBlockchain, getBlock,
    decryptTransaction,
  }

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  )
}

/** Hook to consume BlockchainContext */
export function useBlockchain() {
  const ctx = useContext(BlockchainContext)
  if (!ctx) throw new Error('useBlockchain must be used inside <BlockchainProvider>')
  return ctx
}
