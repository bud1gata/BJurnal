import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Users, CheckSquare } from 'lucide-react'
import { adminApi } from '../../services/api'
import Button from '../../components/ui/Button'
import { Loader, EmptyState, Card, Badge } from '../../components/ui/Components'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'
import './Teacher.css'

export default function Approvals() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null) // ID of request being processed

  useEffect(() => {
    loadRequests()
  }, [])

  async function loadRequests() {
    try {
      const data = await adminApi.getPendingRequests()
      setRequests(data)
    } catch (err) {
      console.error(err)
      toast.error('Gagal memuat daftar pengajuan')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    setProcessing(id)
    try {
      await adminApi.approveRequest(id)
      toast.success('Pengajuan disetujui')
      setRequests(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      toast.error('Gagal menyetujui')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (id) => {
    setProcessing(id)
    try {
      await adminApi.rejectRequest(id)
      toast.success('Pengajuan ditolak')
      setRequests(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      toast.error('Gagal menolak')
    } finally {
      setProcessing(null)
    }
  }

  const handleApproveAll = async () => {
    if (!window.confirm(`Setujui semua ${requests.length} pengajuan?`)) return
    setLoading(true)
    try {
      await adminApi.approveAll()
      toast.success('Semua pengajuan berhasil disetujui')
      setRequests([])
    } catch (err) {
      toast.error('Gagal menyetujui semua')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-greeting">Persetujuan Kelas ⚖️</h1>
          <p className="page-subtitle">Setujui permintaan murid yang ingin pindah kelas</p>
        </div>
        {requests.length > 0 && (
          <Button icon={CheckSquare} onClick={handleApproveAll}>
            Setujui Semua ({requests.length})
          </Button>
        )}
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Tidak ada permintaan"
          description="Semua permintaan pindah kelas telah diproses."
        />
      ) : (
        <div className="tracker-table-wrapper card" style={{ padding: '0', overflow: 'hidden' }}>
          <table className="tracker-table">
            <thead>
              <tr>
                <th>Murid</th>
                <th>Nomor Induk</th>
                <th>Kelas Saat Ini</th>
                <th>Kelas Tujuan</th>
                <th>Tgl Pengajuan</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td>
                    <div style={{ fontWeight: 'var(--fw-semibold)' }}>{req.nama}</div>
                  </td>
                  <td>{req.nomorInduk}</td>
                  <td><Badge variant="secondary">{req.kelas}</Badge></td>
                  <td><Badge variant="success">{req.requestedKelas}</Badge></td>
                  <td>{formatDate(req.updatedAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn-icon btn-icon-danger" 
                        onClick={() => handleReject(req.id)}
                        disabled={processing === req.id}
                        title="Tolak"
                      >
                        <XCircle size={18} />
                      </button>
                      <button 
                        className="btn-icon btn-icon-success" 
                        onClick={() => handleApprove(req.id)}
                        disabled={processing === req.id}
                        title="Setujui"
                      >
                        <CheckCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
