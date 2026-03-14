import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Users, Eye, Send } from 'lucide-react'
import { sessionApi } from '../../services/api'
import { useCountdown } from '../../hooks/useHooks'
import { Badge, Loader, EmptyState } from '../../components/ui/Components'
import Button from '../../components/ui/Button'
import { formatDate, formatDateTime } from '../../utils/helpers'
import { SESSION_STATUS } from '../../utils/constants'
import './Teacher.css'

const STATUS_MAP = {
  submitted: { text: 'Terkirim', variant: 'success' },
  draft: { text: 'Draft', variant: 'warning' },
  locked: { text: 'Terkunci', variant: 'neutral' },
  belum_masuk: { text: 'Belum Masuk', variant: 'danger' },
}

export default function SessionDetail() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [tracker, setTracker] = useState([])
  const [loading, setLoading] = useState(true)

  const { formatted } = useCountdown(session?.endTime)

  useEffect(() => {
    async function load() {
      try {
        const [sessionData, trackerData] = await Promise.all([
          sessionApi.getSession(sessionId),
          sessionApi.getSubmissionTracker(sessionId),
        ])
        setSession(sessionData)
        setTracker(trackerData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [sessionId])

  if (loading) return <Loader />
  if (!session) return <div>Sesi tidak ditemukan</div>

  const submitted = tracker.filter(t => t.status === 'submitted').length
  const drafts = tracker.filter(t => t.status === 'draft').length
  const notJoined = tracker.filter(t => t.status === 'belum_masuk').length

  return (
    <div className="animate-fade-in">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} icon={ArrowLeft} style={{ marginBottom: '16px' }}>
        Kembali
      </Button>

      <div className="page-header">
        <h1 className="page-greeting">{session.title}</h1>
        <p className="page-subtitle">
          {session.kelas} • {session.duration} menit •{' '}
          <Badge variant={session.status === SESSION_STATUS.ACTIVE ? 'success' : 'neutral'}>
            {session.status === SESSION_STATUS.ACTIVE ? `Aktif — ${formatted}` : 'Selesai'}
          </Badge>
        </p>
      </div>

      {/* Summary */}
      <div className="tracker-summary">
        <div className="tracker-summary-item">
          <Send size={16} style={{ color: 'var(--success)' }} />
          <span className="tracker-summary-count" style={{ color: 'var(--success)' }}>{submitted}</span>
          <span>Terkirim</span>
        </div>
        <div className="tracker-summary-item">
          <Clock size={16} style={{ color: 'var(--warning)' }} />
          <span className="tracker-summary-count" style={{ color: 'var(--warning)' }}>{drafts}</span>
          <span>Draft</span>
        </div>
        <div className="tracker-summary-item">
          <Users size={16} style={{ color: 'var(--text-muted)' }} />
          <span className="tracker-summary-count">{notJoined}</span>
          <span>Belum Masuk</span>
        </div>
      </div>

      {/* Tracker Table */}
      <div className="create-session-card">
        <h2><Users size={20} /> Daftar Murid</h2>
        <div className="tracker-table-wrapper">
          <table className="tracker-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Murid</th>
                <th>Status</th>
                <th>Waktu Kirim</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tracker.map((item, i) => {
                const status = STATUS_MAP[item.status] || STATUS_MAP.belum_masuk
                return (
                  <tr key={item.studentId}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 'var(--fw-medium)' }}>{item.studentName}</td>
                    <td><Badge variant={status.variant}>{status.text}</Badge></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-xs)' }}>
                      {item.submittedAt ? formatDateTime(item.submittedAt) : '—'}
                    </td>
                    <td>
                      {item.noteId && (item.status === 'submitted' || item.status === 'locked') ? (
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/teacher/review/${item.noteId}`)} icon={Eye}>
                          Review
                        </Button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-xs)' }}>—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
