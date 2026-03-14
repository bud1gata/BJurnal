import { createContext, useContext, useState, useEffect } from 'react'
import { ROLES } from '../utils/constants'

const AuthContext = createContext(null)

// Mock users for demo
const MOCK_USERS = [
  { id: '1', nomorInduk: '2024001', password: 'murid123', nama: 'Ahmad Rizky', kelas: 'X-IPA-1', role: ROLES.STUDENT },
  { id: '2', nomorInduk: '2024002', password: 'murid123', nama: 'Siti Nurhaliza', kelas: 'X-IPA-1', role: ROLES.STUDENT },
  { id: '3', nomorInduk: '2024003', password: 'murid123', nama: 'Budi Santoso', kelas: 'X-IPA-2', role: ROLES.STUDENT },
  { id: '4', nomorInduk: '2024004', password: 'murid123', nama: 'Dewi Anggraini', kelas: 'X-IPS-1', role: ROLES.STUDENT },
  { id: '5', nomorInduk: '2024005', password: 'murid123', nama: 'Fajar Nugroho', kelas: 'X-IPA-1', role: ROLES.STUDENT },
  { id: 'T1', nomorInduk: '1980001', password: 'guru123', nama: 'Pak Hendra Wijaya', kelas: null, role: ROLES.TEACHER },
  { id: 'T2', nomorInduk: '1980002', password: 'guru123', nama: 'Bu Ratna Sari', kelas: null, role: ROLES.TEACHER },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('bjurnal_user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('bjurnal_user')
      }
    }
    setLoading(false)
  }, [])

  const login = (nomorInduk, password) => {
    const found = MOCK_USERS.find(
      u => u.nomorInduk === nomorInduk && u.password === password
    )
    if (!found) {
      return { success: false, message: 'Nomor induk atau password salah' }
    }
    const userData = { id: found.id, nomorInduk: found.nomorInduk, nama: found.nama, kelas: found.kelas, role: found.role }
    setUser(userData)
    localStorage.setItem('bjurnal_user', JSON.stringify(userData))
    return { success: true, user: userData }
  }

  const register = ({ nomorInduk, password, nama, kelas, role }) => {
    const exists = MOCK_USERS.find(u => u.nomorInduk === nomorInduk)
    if (exists) {
      return { success: false, message: 'Nomor induk sudah terdaftar' }
    }
    const newUser = {
      id: `U${Date.now()}`,
      nomorInduk,
      password,
      nama,
      kelas: role === ROLES.TEACHER ? null : kelas,
      role,
    }
    MOCK_USERS.push(newUser)
    const userData = { id: newUser.id, nomorInduk: newUser.nomorInduk, nama: newUser.nama, kelas: newUser.kelas, role: newUser.role }
    setUser(userData)
    localStorage.setItem('bjurnal_user', JSON.stringify(userData))
    return { success: true, user: userData }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('bjurnal_user')
  }

  const updateProfile = (updates) => {
    const updated = { ...user, ...updates }
    setUser(updated)
    localStorage.setItem('bjurnal_user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
