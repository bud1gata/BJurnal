import { useState, useEffect } from 'react'
import { UserCheck, UserX, User, Calendar, ShieldCheck } from 'lucide-react'
import { adminApi } from '../../services/api'
import { Badge, Loader, EmptyState } from '../../components/ui/Components'
import Button from '../../components/ui/Button'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function AccountApprovals() {
  const [pendingUsers, setPendingUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  const loadAccounts = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getPendingAccounts()
      setPendingUsers(data)
    } catch (err) {
      console.error(err)
      toast.error('Gagal memuat daftar akun')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAccounts()
  }, [])

  const handleApprove = async (id) => {
    try {
      setActionLoading(id)
      await adminApi.approveAccount(id)
      toast.success('Akun disetujui')
      setPendingUsers(prev => prev.filter(u => u.id !== id))
    } catch (err) {
      toast.error('Gagal menyetujui akun')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id) => {
    if (!window.confirm('Yakin ingin menolak pendaftaran akun ini? Akun akan dihapus.')) return
    try {
      setActionLoading(id)
      await adminApi.rejectAccount(id)
      toast.success('Pendaftaran ditolak')
      setPendingUsers(prev => prev.filter(u => u.id !== id))
    } catch (err) {
      toast.error('Gagal menolak akun')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-greeting">🔑 Manajemen Akun</h1>
        <p className="page-subtitle">Persetujuan pendaftaran akun Guru dan Murid baru.</p>
      </div>

      <div className="create-session-card">
        <h2><ShieldCheck size={20} /> Daftar Pengajuan Akun</h2>
        
        {pendingUsers.length === 0 ? (
          <EmptyState 
            title="Tidak ada pengajuan" 
            message="Semua pendaftaran akun sudah diproses."
          />
        ) : (
          <div className="tracker-table-wrapper">
            <table className="tracker-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Lengkap</th>
                  <th>Nomor Induk</th>
                  <th>Role</th>
                  <th>Kelas/Info</th>
                  <th>Tgl Daftar</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map((user, i) => (
                  <tr key={user.id}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 'var(--fw-medium)' }}>{user.nama}</td>
                    <td>{user.nomorInduk}</td>
                    <td>
                      <Badge variant={user.role === 'guru' ? 'info' : 'neutral'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td>{user.role === 'murid' ? user.kelas : '—'}</td>
                    <td style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
                      {formatDate(user.createdAt)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          icon={UserX} 
                          onClick={() => handleReject(user.id)}
                          disabled={actionLoading === user.id}
                          className="text-danger-hover"
                        >
                          Tolak
                        </Button>
                        <Button 
                          size="sm" 
                          icon={UserCheck} 
                          onClick={() => handleApprove(user.id)}
                          loading={actionLoading === user.id}
                        >
                          Setuju
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
