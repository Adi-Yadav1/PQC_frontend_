/**
 * Login.jsx — User login page
 *
 * Features:
 *  - Username + password form
 *  - Form validation (inline errors)
 *  - Shows error from API on failure
 *  - Redirects to /dashboard on success
 *  - Link to /register
 */

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  // Already logged in → redirect
  React.useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  const validate = () => {
    const e = {}
    if (!form.username.trim()) e.username = 'Username is required'
    if (!form.password)        e.password = 'Password is required'
    return e
  }

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((er) => ({ ...er, [e.target.name]: '' }))
    setApiError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    const result = await login(form.username.trim(), form.password)
    setLoading(false)

    if (result.success) {
      navigate('/dashboard', { replace: true })
    } else {
      setApiError(result.message)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container animate-fade-in-up">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">🔐</div>
          <h1>PQC Blockchain Wallet</h1>
          <p>Post-Quantum Cryptography Secured</p>
        </div>

        {/* Card */}
        <div className="auth-card">
          <h2>Welcome Back</h2>
          <p>Sign in to your quantum-resistant wallet</p>

          {apiError && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              ⚠ {apiError}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-username">Username</label>
              <input
                id="login-username"
                type="text"
                name="username"
                className="form-input"
                placeholder="Enter your username"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
                autoFocus
                disabled={loading}
              />
              {errors.username && (
                <span style={{ fontSize: '0.8rem', color: 'var(--color-danger)' }}>
                  {errors.username}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                name="password"
                className="form-input"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={loading}
              />
              {errors.password && (
                <span style={{ fontSize: '0.8rem', color: 'var(--color-danger)' }}>
                  {errors.password}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              id="login-submit-btn"
            >
              {loading ? (
                <><LoadingSpinner size="sm" inline /> Signing in...</>
              ) : (
                '🔑 Sign In'
              )}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account?{' '}
            <Link to="/register">Create one now</Link>
          </div>
        </div>

        {/* PQC Notice */}
        <div className="pqc-notice">
          <span>🛡</span>
          <span>
            Protected by <strong>Lamport Signatures</strong> — a post-quantum
            cryptographic scheme resistant to quantum computing attacks.
          </span>
        </div>
      </div>
    </div>
  )
}
