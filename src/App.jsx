/**
 * App.jsx — Main application router and provider setup
 *
 * Wraps the entire app in:
 *  - AuthProvider       (authentication state)
 *  - BlockchainProvider (blockchain data state)
 *  - BrowserRouter      (React Router)
 *
 * Route tree:
 *  /          → redirect to /dashboard (if authed) or /login
 *  /login     → Login page
 *  /register  → Register page
 *  /dashboard → Dashboard (protected)
 *  /wallet    → Wallet page (protected)
 *  /block/:id → Block details (protected)
 *  /history   → Transaction history (protected)
 *  /search    → Search page (protected)
 */

import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'
import { BlockchainProvider } from './context/BlockchainContext'

import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Wallet from './pages/Wallet'
import BlockDetails from './pages/BlockDetails'
import TransactionHistory from './pages/TransactionHistory'
import Search from './pages/Search'
import NetworkExplorer from './pages/NetworkExplorer'

export default function App() {
  return (
    <AuthProvider>
      <BlockchainProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes (no navbar) */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes (with Navbar) */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Routes>
                    <Route path="dashboard"   element={<Dashboard />} />
                    <Route path="wallet"      element={<Wallet />} />
                    <Route path="block/:index" element={<BlockDetails />} />
                    <Route path="history"     element={<TransactionHistory />} />
                    <Route path="search"      element={<Search />} />
                    <Route path="explorer"    element={<NetworkExplorer />} />
                    {/* Default redirect */}
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </ProtectedRoute>
              }
            />

            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </BlockchainProvider>
    </AuthProvider>
  )
}
