/**
 * Register.jsx — New user registration page
 *
 * Features:
 *  - Username + password + confirm password form
 *  - Client-side validation
 *  - API error display (e.g., duplicate username)
 *  - Success message with redirect to /login
 */

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Register() {
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  React.useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  const validate = () => {
    const e = {}
    if (!form.username.trim())          e.username = 'Username is required'
    else if (form.username.trim().length < 3) e.username = 'Username must be at least 3 characters'
    if (!form.password)                 e.password = 'Password is required'
    else if (form.password.length < 6)  e.password = 'Password must be at least 6 characters'
    if (!form.confirm)                  e.confirm = 'Please confirm your password'
    else if (form.confirm !== form.password) e.confirm = 'Passwords do not match'
    return e
  }

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((er) => ({ ...er, [e.target.name]: '' }))
    setApiError('')
    setSuccessMsg('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    const result = await register(form.username.trim(), form.password)
    setLoading(false)

    if (result.success) {
      setSuccessMsg('Account created! Redirecting to login...')
      setTimeout(() => navigate('/login'), 1800)
    } else {
      setApiError(result.message)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container animate-fade-in-up">
        <div className="auth-logo">
          <div className="auth-logo-icon">⛓</div>
          <h1>PQC Blockchain Wallet</h1>
          <p>Create your quantum-resistant account</p>
        </div>

        <div className="auth-card">
          <h2>Create Account</h2>
          <p>Join the post-quantum blockchain network</p>

          {apiError && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              ⚠ {apiError}
            </div>
          )}
          {successMsg && (
            <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
              ✓ {successMsg}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-username">Username</label>
              <input
                id="reg-username"
                type="text"
                name="username"
                className="form-input"
                placeholder="Choose a username (min 3 chars)"
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
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                name="password"
                className="form-input"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading}
              />
              {errors.password && (
                <span style={{ fontSize: '0.8rem', color: 'var(--color-danger)' }}>
                  {errors.password}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
              <input
                id="reg-confirm"
                type="password"
                name="confirm"
                className="form-input"
                placeholder="Re-enter your password"
                value={form.confirm}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading}
              />
              {errors.confirm && (
                <span style={{ fontSize: '0.8rem', color: 'var(--color-danger)' }}>
                  {errors.confirm}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              id="register-submit-btn"
            >
              {loading ? (
                <><LoadingSpinner size="sm" inline /> Creating account...</>
              ) : (
                '🚀 Create Account'
              )}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?{' '}
            <Link to="/login">Sign in here</Link>
          </div>
        </div>

        <div className="pqc-notice">
          <span>🎁</span>
          <span>
            New accounts receive <strong>1000 PKC</strong> tokens automatically
            to start exploring the blockchain.
          </span>
        </div>
      </div>
    </div>
  )
}
