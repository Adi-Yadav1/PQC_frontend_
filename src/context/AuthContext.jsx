/**
 * AuthContext.jsx — Authentication state management
 *
 * Provides: user, token, isAuthenticated, login(), register(), logout()
 * Persists session to localStorage for page refresh survival.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)        // { id, username }
  const [token, setToken] = useState(null)      // session token string
  const [loading, setLoading] = useState(true)  // loading stored session

  // ---------------------------------------------------------------- //
  //  Restore session from localStorage on mount                       //
  // ---------------------------------------------------------------- //
  useEffect(() => {
    const storedToken    = localStorage.getItem('token')
    const storedUserId   = localStorage.getItem('userId')
    const storedUsername = localStorage.getItem('username')

    if (storedToken && storedUserId && storedUsername) {
      setToken(storedToken)
      setUser({ id: parseInt(storedUserId, 10), username: storedUsername })
    }
    setLoading(false)
  }, [])

  // ---------------------------------------------------------------- //
  //  Persist session                                                   //
  // ---------------------------------------------------------------- //
  const persistSession = (userObj, tokenStr) => {
    localStorage.setItem('token',    tokenStr)
    localStorage.setItem('userId',   String(userObj.id))
    localStorage.setItem('username', userObj.username)
    setToken(tokenStr)
    setUser(userObj)
  }

  const clearSession = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    setToken(null)
    setUser(null)
  }

  // ---------------------------------------------------------------- //
  //  Auth Actions                                                      //
  // ---------------------------------------------------------------- //

  /**
   * Register a new user.
   * @returns {Promise<{ success, message }>}
   */
  const register = useCallback(async (username, password) => {
    try {
      await authAPI.register(username, password)
      return { success: true, message: 'Registered successfully! Please log in.' }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }, [])

  /**
   * Login a user.
   * @returns {Promise<{ success, message }>}
   */
  const login = useCallback(async (username, password) => {
    try {
      const res = await authAPI.login(username, password)
      const { user_id, username: uname, token: tok } = res.data
      persistSession({ id: user_id, username: uname }, tok)
      return { success: true, message: 'Login successful!' }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }, [])

  /**
   * Logout the current user.
   */
  const logout = useCallback(async () => {
    try { await authAPI.logout() } catch (_) {}
    clearSession()
  }, [])

  const isAuthenticated = Boolean(token && user)

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** Hook to consume AuthContext */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
