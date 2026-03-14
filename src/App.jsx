import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthLayout, MainLayout, StudentGuard, TeacherGuard } from './layouts/Layout'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Student Pages
import Dashboard from './pages/student/Dashboard'
import Session from './pages/student/Session'
import Archive from './pages/student/Archive'
import NoteView from './pages/student/NoteView'
import Profile from './pages/student/Profile'

// Teacher Pages
import TeacherHome from './pages/teacher/TeacherHome'
import ManageSessions from './pages/teacher/ManageSessions'
import SessionDetail from './pages/teacher/SessionDetail'
import ReviewNote from './pages/teacher/ReviewNote'

export default function App() {
  return (
    <Routes>
      {/* Auth routes (no sidebar) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Main routes (with sidebar) */}
      <Route element={<MainLayout />}>
        {/* Student routes */}
        <Route element={<StudentGuard />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/session/:sessionId" element={<Session />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/archive/:noteId" element={<NoteView />} />
        </Route>

        {/* Teacher routes */}
        <Route element={<TeacherGuard />}>
          <Route path="/teacher/dashboard" element={<TeacherHome />} />
          <Route path="/teacher/sessions" element={<ManageSessions />} />
          <Route path="/teacher/session/:sessionId" element={<SessionDetail />} />
          <Route path="/teacher/review/:noteId" element={<ReviewNote />} />
        </Route>

        {/* Shared routes */}
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
