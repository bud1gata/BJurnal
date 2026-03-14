import { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Sidebar, BottomTabBar, HamburgerButton } from '../components/Sidebar'
import { Loader } from '../components/ui/Components'
import { ROLES } from '../utils/constants'
import './Layout.css'

// Auth Layout — for Login/Register (no sidebar)
export function AuthLayout() {
  const { user, loading } = useAuth()

  if (loading) return <Loader fullscreen />
  if (user) {
    if (user.role === ROLES.ADMIN) return <Navigate to="/admin/accounts" replace />
    return <Navigate to={user.role === ROLES.TEACHER ? '/teacher/dashboard' : '/dashboard'} replace />
  }

  return (
    <div className="auth-layout">
      <Outlet />
    </div>
  )
}

// Main Layout — with sidebar for authenticated users
export function MainLayout() {
  const { user, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) return <Loader fullscreen />
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="main-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <HamburgerButton onClick={() => setSidebarOpen(true)} />
      <main className="main-content">
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  )
}

// Student Only Layout Guard
export function StudentGuard() {
  const { user } = useAuth()
  if (user?.role !== ROLES.STUDENT) {
    return <Navigate to="/teacher/dashboard" replace />
  }
  return <Outlet />
}

// Teacher Only Layout Guard
export function TeacherGuard() {
  const { user } = useAuth()
  // Admin can also access teacher tools
  if (user?.role !== ROLES.TEACHER && user?.role !== ROLES.ADMIN) {
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}

// Admin Only Layout Guard
export function AdminGuard() {
  const { user } = useAuth()
  if (user?.role !== ROLES.ADMIN) {
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}
