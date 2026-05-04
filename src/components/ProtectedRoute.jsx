/**
 * ProtectedRoute.jsx — Auth guard component
 *
 * Redirects unauthenticated users to /login.
 * Shows a full-page loading spinner while the initial session is being loaded.
 */

import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner fullScreen message="Restoring session..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
