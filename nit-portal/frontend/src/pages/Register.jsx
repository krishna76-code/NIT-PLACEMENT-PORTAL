import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { registerStudent } from '../services/api'
import { toast } from 'react-hot-toast'
import './Login.css' // We can reuse the login styling

export default function RegisterPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.username.trim() || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      await registerStudent(form)
      toast.success('Registration successful! Please sign in.')
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
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
            <h2>Student Registration</h2>
            <p>Join the Placement Portal to apply for drives, track applications, and more.</p>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-wrap">
          <div className="login-header">
            <span className="login-badge">Student Access</span>
            <h1>Create an Account</h1>
            <p>Sign up to start applying to campus drives.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <div className="field">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="e.g. John Doe"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="field">
              <label htmlFor="username">Email / Username</label>
              <input
                id="username"
                type="text"
                placeholder="e.g. 2020ugcs001@nitjsr.ac.in"
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
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowPass(s => !s)}
                  tabIndex={-1}
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Sign up'}
            </button>
          </form>

          <p className="login-footer">
            Already have an account? <Link to="/login" style={{color: 'var(--primary)'}}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
