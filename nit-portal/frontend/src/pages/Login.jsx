import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginUser } from '../services/api'
import './Login.css'

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.username.trim() || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      const res = await loginUser(form)
      login(res.data.token, res.data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-art">
          <div className="art-grid">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="art-cell" style={{ animationDelay: `${i * 0.08}s` }} />
            ))}
          </div>
          <div className="art-text">
            <div className="art-badge">NIT Jamshedpur</div>
            <h2>Placement Portal</h2>
            <p>Connecting talent with opportunity. Powered by the Training & Placement Cell.</p>
            <div className="art-stats">
              <div className="art-stat"><strong>1200+</strong><span>Students placed</span></div>
              <div className="art-stat"><strong>150+</strong><span>Recruiters</span></div>
              <div className="art-stat"><strong>35 LPA</strong><span>Highest CTC</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-wrap">
          <div className="login-header">
            <span className="login-badge">Admin Access</span>
            <h1>Welcome back</h1>
            <p>Sign in to manage placement drives and records.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            {error && (
              <div className="login-error" role="alert">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <div className="field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                autoComplete="username"
                disabled={loading}
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="pass-wrap">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowPass(s => !s)}
                  tabIndex={-1}
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? (
                <span className="spinner" />
              ) : (
                <>
                  Sign in
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="login-footer">
            Only authorized T&P coordinators can sign in.
          </p>
        </div>
      </div>
    </div>
  )
}
