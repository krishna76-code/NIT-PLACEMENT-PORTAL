import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Dashboard from './pages/Dashboard'
import DrivesPage from './pages/Drives'
import StatsPage from './pages/Stats'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import StudentProfilePage from './pages/StudentProfile'
import MyApplicationsPage from './pages/MyApplications'
import DriveApplicantsPage from './pages/DriveApplicants'
import NotFound from './pages/NotFound'

// Layout wrapper — hides Navbar/Footer on login page
function AppLayout() {
  const location = useLocation()
  const isLogin = location.pathname === '/login'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isLogin && <Navbar />}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/"        element={<Dashboard />} />
          <Route path="/drives"  element={<DrivesPage />} />
          <Route path="/drives/:id/applicants" element={<DriveApplicantsPage />} />
          <Route path="/stats"   element={<StatsPage />} />
          <Route path="/login"   element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<StudentProfilePage />} />
          <Route path="/applications" element={<MyApplicationsPage />} />
          <Route path="*"        element={<NotFound />} />
        </Routes>
      </main>
      {!isLogin && <Footer />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppLayout />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.88rem',
              },
              success: {
                iconTheme: { primary: '#1a7a4a', secondary: '#fff' }
              },
              error: {
                iconTheme: { primary: '#c23b22', secondary: '#fff' }
              }
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
