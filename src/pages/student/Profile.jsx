import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Save } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { noteApi } from '../../services/api'
import { Input, Select } from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { getInitials, getAvatarColor } from '../../utils/helpers'
import { KELAS_OPTIONS, ROLES } from '../../utils/constants'
import toast from 'react-hot-toast'
import './Pages.css'

export default function Profile() {
  const { user, updateProfile, logout } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ nama: user?.nama || '', kelas: user?.kelas || '' })
  const [stats, setStats] = useState({ total: 0, submitted: 0, drafts: 0 })

  useEffect(() => {
    async function loadStats() {
      try {
        const notes = await noteApi.getNotesByStudent(user.id)
        setStats({
          total: notes.length,
          submitted: notes.filter(n => n.status === 'submitted').length,
          drafts: notes.filter(n => n.status === 'draft').length,
        })
      } catch (err) {
        console.error(err)
      }
    }
    if (user?.role === ROLES.STUDENT) loadStats()
  }, [user])

  const handleSave = () => {
    updateProfile(form)
    setEditing(false)
    toast.success('Profil diperbarui')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="profile-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-greeting">👤 Profil</h1>
      </div>

      {/* Avatar + Name */}
      <div className="profile-header">
        <div
          className="profile-avatar"
          style={{ backgroundColor: getAvatarColor(user?.nama) }}
        >
          {getInitials(user?.nama)}
        </div>
        <div>
          <div className="profile-name">{user?.nama}</div>
          <div className="profile-role">{user?.role === ROLES.TEACHER ? '📚 Guru' : `🎓 Murid • ${user?.kelas}`}</div>
        </div>
      </div>

      {/* Info Card */}
      <div className="profile-card">
        <h3>Informasi Akun</h3>
        {!editing ? (
          <>
            <div className="profile-info-row">
              <span className="profile-info-label">Nama Lengkap</span>
              <span className="profile-info-value">{user?.nama}</span>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-label">Nomor Induk</span>
              <span className="profile-info-value">{user?.nomorInduk}</span>
            </div>
            {user?.role === ROLES.STUDENT && (
              <div className="profile-info-row">
                <span className="profile-info-label">Kelas</span>
                <span className="profile-info-value">{user?.kelas}</span>
              </div>
            )}
            <div className="profile-info-row">
              <span className="profile-info-label">Role</span>
              <span className="profile-info-value" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)} style={{ marginTop: '16px' }}>
              Edit Profil
            </Button>
          </>
        ) : (
          <div className="profile-form">
            <Input
              label="Nama Lengkap"
              value={form.nama}
              onChange={e => setForm({ ...form, nama: e.target.value })}
            />
            {user?.role === ROLES.STUDENT && (
              <Select
                label="Kelas"
                options={KELAS_OPTIONS}
                value={form.kelas}
                onChange={e => setForm({ ...form, kelas: e.target.value })}
              />
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="secondary" onClick={() => setEditing(false)}>Batal</Button>
              <Button onClick={handleSave} icon={Save}>Simpan</Button>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      {user?.role === ROLES.STUDENT && (
        <div className="profile-card" style={{ marginTop: '16px' }}>
          <h3>Statistik</h3>
          <div className="profile-stats-grid">
            <div className="profile-stat">
              <div className="profile-stat-value">{stats.total}</div>
              <div className="profile-stat-label">Total Catatan</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-value">{stats.submitted}</div>
              <div className="profile-stat-label">Terkirim</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-value">{stats.drafts}</div>
              <div className="profile-stat-label">Draft</div>
            </div>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="profile-logout">
        <Button variant="danger" fullWidth onClick={handleLogout} icon={LogOut}>
          Keluar dari Akun
        </Button>
      </div>
    </div>
  )
}
