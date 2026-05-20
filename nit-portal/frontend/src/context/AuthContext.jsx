import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('nit_token')
    const storedUser = localStorage.getItem('nit_user')
    if (storedToken && storedUser) {
      try {
        const u = JSON.parse(storedUser)
        // Check token expiry
        const payload = JSON.parse(atob(storedToken.split('.')[1]))
        if (payload.exp * 1000 > Date.now()) {
          setToken(storedToken)
          setUser(u)
        } else {
          localStorage.removeItem('nit_token')
          localStorage.removeItem('nit_user')
        }
      } catch {
        localStorage.removeItem('nit_token')
        localStorage.removeItem('nit_user')
      }
    }
    setLoading(false)
  }, [])

  const login = (token, user) => {
    localStorage.setItem('nit_token', token)
    localStorage.setItem('nit_user', JSON.stringify(user))
    setToken(token)
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem('nit_token')
    localStorage.removeItem('nit_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      loading, 
      isAdmin: user?.role === 'admin',
      isCoordinator: user?.role === 'coordinator' || user?.role === 'admin',
      isStudent: user?.role === 'student'
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
