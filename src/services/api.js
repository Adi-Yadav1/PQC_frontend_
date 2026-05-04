/**
 * api.js — Axios API client for PQC Blockchain Wallet
 *
 * Configured with base URL from env var VITE_API_URL (default: http://localhost:5000)
 * Automatically attaches Authorization header from localStorage.
 */

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Request interceptor: attach token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: unwrap data or throw error message
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

/* ---- Auth API ---- */
export const authAPI = {
  /** Register a new user */
  register: (username, password) =>
    api.post('/register', { username, password }),

  /** Login and receive a token */
  login: (username, password) =>
    api.post('/login', { username, password }),

  /** Logout (invalidate token) */
  logout: () =>
    api.post('/logout'),

  /** Get full profile including wallet address and balance */
  getProfile: (userId) =>
    api.get(`/profile/${userId}`),

  /** Verify user password */
  verifyPassword: (userId, password) =>
    api.post('/verify_password', { user_id: userId, password }),
}

/* ---- Blockchain API ---- */
export const blockchainAPI = {
  /** Get the full blockchain */
  getChain: () =>
    api.get('/chain'),

  /** Get chain validity and stats */
  verify: () =>
    api.get('/verify'),

  /** Get summary stats */
  getStats: () =>
    api.get('/stats'),

  /** Get a single block by index */
  getBlock: (index) =>
    api.get(`/block/${index}`),

  /** Get all confirmed transactions (optionally filtered by address) */
  getTransactions: (address = '') =>
    api.get('/transactions', { params: address ? { address } : {} }),

  /** Get pending (unconfirmed) transactions */
  getPending: () =>
    api.get('/pending'),

  /** Send a transaction */
  sendTransaction: (userId, recipient, amount, message, password) =>
    api.post('/send_transaction', { user_id: userId, recipient, amount, message, password }),

  /** Decrypt a transaction message */
  decryptTransaction: (txId, userId) =>
    api.get(`/decrypt_tx/${txId}`, { params: { user_id: userId } }),

  /** Mine a new block */
  mine: (minerAddress = '') =>
    api.post('/mine', { miner_address: minerAddress }),

  /** Get user balance */
  getBalance: (userId) =>
    api.get(`/balance/${userId}`),

  /**
   * Search blockchain
   * @param {string} type - 'block' | 'hash' | 'address'
   * @param {string} query - search value
   */
  search: (type, query) =>
    api.get('/search', { params: { type, query } }),
}

export default api
