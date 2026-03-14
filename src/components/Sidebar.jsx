import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Archive, User, Menu, X, LogOut, Settings, ClipboardList, CheckSquare } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getInitials, getAvatarColor } from '../utils/helpers'
import { ROLES } from '../utils/constants'
import './Sidebar.css'

const studentLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/archive', icon: Archive, label: 'Arsip Catatan' },
  { to: '/profile', icon: User, label: 'Profil' },
]

const teacherLinks = [
  { to: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/teacher/sessions', icon: ClipboardList, label: 'Kelola Sesi' },
  { to: '/teacher/approvals', icon: CheckSquare, label: 'Persetujuan' },
  { to: '/profile', icon: User, label: 'Profil' },
]

const adminLinks = [
  { to: '/admin/accounts', icon: User, label: 'Manajemen Akun' },
  { to: '/teacher/approvals', icon: CheckSquare, label: 'Persetujuan Kelas' },
  { to: '/profile', icon: User, label: 'Profil' },
]

export function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  let links = studentLinks
  if (user?.role === ROLES.TEACHER) links = teacherLinks
  if (user?.role === ROLES.ADMIN) links = adminLinks

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">Bj</div>
          <div className="sidebar-logo-text">
            B<span>Jurnal</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <link.icon size={20} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div
              className="sidebar-avatar"
              style={{ backgroundColor: getAvatarColor(user?.nama) }}
            >
              {getInitials(user?.nama)}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.nama}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          </div>
          <button className="sidebar-link" onClick={handleLogout} style={{ marginTop: '8px', width: '100%' }}>
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </aside>
    </>
  )
}

export function BottomTabBar() {
  const { user } = useAuth()
  const links = user?.role === ROLES.TEACHER
    ? [
        { to: '/teacher/dashboard', icon: LayoutDashboard, label: 'Home' },
        { to: '/teacher/sessions', icon: ClipboardList, label: 'Sesi' },
        { to: '/profile', icon: User, label: 'Profil' },
      ]
    : user?.role === ROLES.ADMIN
    ? [
        { to: '/admin/accounts', icon: User, label: 'Akun' },
        { to: '/teacher/approvals', icon: CheckSquare, label: 'Persetujuan' },
        { to: '/profile', icon: User, label: 'Profil' },
      ]
    : [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
        { to: '/archive', icon: Archive, label: 'Arsip' },
        { to: '/profile', icon: User, label: 'Profil' },
      ]

  return (
    <nav className="bottom-tab-bar">
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}
        >
          <link.icon size={22} />
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}

export function HamburgerButton({ onClick }) {
  return (
    <button className="hamburger-btn" onClick={onClick}>
      <Menu size={22} />
    </button>
  )
}
