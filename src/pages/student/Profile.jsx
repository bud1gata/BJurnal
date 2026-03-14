import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Save, Lock, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { noteApi, authApi } from '../../services/api'
import { Input, Select } from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { getInitials, getAvatarColor } from '../../utils/helpers'
import { KELAS_OPTIONS, ROLES } from '../../utils/constants'
import toast from 'react-hot-toast'
import './Pages.css'

function ChangePasswordCard() {
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      return toast.error('Konfirmasi password baru tidak cocok')
    }
    if (passwords.newPassword === passwords.currentPassword) {
      return toast.error('Password baru tidak boleh sama dengan password saat ini')
    }
    if (passwords.newPassword.length < 6) {
      return toast.error('Password baru minimal 6 karakter')
    }

    try {
      setLoading(true)
      await authApi.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      })
      toast.success('Password berhasil diperbarui')
      setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
      setShowForm(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui password')
    } finally {
      setLoading(false)
    }
  }

  if (!showForm) {
    return (
      <div className="profile-card" style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} className="text-secondary" />
            <h3 style={{ margin: 0 }}>Keamanan Akun</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowForm(true)}>Ubah Password</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-card animate-slide-up" style={{ marginTop: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <ShieldCheck size={20} className="text-accent" />
        <h3 style={{ margin: 0 }}>Ubah Password</h3>
      </div>
      <form onSubmit={handleUpdate} className="profile-form">
        <Input
          label="Password Saat Ini"
          type="password"
          icon={Lock}
          value={passwords.currentPassword}
          onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
          required
        />
        <Input
          label="Password Baru"
          type="password"
          icon={Lock}
          value={passwords.newPassword}
          onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
          required
        />
        <Input
          label="Konfirmasi Password Baru"
          type="password"
          icon={Lock}
          value={passwords.confirmNewPassword}
          onChange={e => setPasswords({ ...passwords, confirmNewPassword: e.target.value })}
          required
        />
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Batal</Button>
          <Button type="submit" loading={loading} icon={Save}>Perbarui Password</Button>
        </div>
      </form>
    </div>
  )
}

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

  const handleSave = async () => {
    const result = await updateProfile(form)
    if (result.success) {
      setEditing(false)
      toast.success('Profil diperbarui')
    }
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
            {user?.isPendingApproval && (
              <div className="pending-badge" style={{ 
                marginTop: '12px', 
                padding: '12px', 
                background: 'rgba(245, 158, 11, 0.1)', 
                border: '1px solid var(--warning)',
                borderRadius: '8px',
                fontSize: 'var(--fs-xs)',
                color: 'var(--warning)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '16px' }}>⏳</span>
                Pengajuan pindah ke kelas <strong>{user.requestedKelas}</strong> sedang menunggu persetujuan admin.
              </div>
            )}
            <div className="profile-info-row">
              <span className="profile-info-label">Role</span>
              <span className="profile-info-value" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
            </div>
            {user?.role !== ROLES.STUDENT && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => {
                  setForm({ nama: user?.nama || '', kelas: user?.kelas || '' })
                  setEditing(true)
                }} 
                style={{ marginTop: '16px' }}
                disabled={user?.isPendingApproval}
              >
                {user?.isPendingApproval ? 'Menunggu Persetujuan' : 'Edit Profil'}
              </Button>
            )}
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

      {/* Change Password Card */}
      <ChangePasswordCard />

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
