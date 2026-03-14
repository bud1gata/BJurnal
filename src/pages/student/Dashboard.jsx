import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, FileText, Clock, ArrowRight, Zap } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { sessionApi, noteApi } from '../../services/api'
import { useCountdown } from '../../hooks/useHooks'
import { Card } from '../../components/ui/Components'
import { Badge, EmptyState, Loader } from '../../components/ui/Components'
import Button from '../../components/ui/Button'
import { getGreeting, formatDate, formatCountdown } from '../../utils/helpers'
import './Dashboard.css'

// Countdown component for session cards
function SessionCountdown({ endTime }) {
  const { formatted, secondsLeft } = useCountdown(endTime)
  return (
    <span className={`session-card-timer ${secondsLeft < 300 ? 'expiring' : ''}`}>
      <Clock size={18} />
      {formatted}
    </span>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [recentNotes, setRecentNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [activeSessions, notes] = await Promise.all([
          sessionApi.getActiveSessions(user.kelas),
          noteApi.getNotesByStudent(user.id),
        ])
        setSessions(activeSessions)
        setRecentNotes(notes.slice(0, 3))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const handleJoinSession = (sessionId) => {
    navigate(`/session/${sessionId}`)
  }

  if (loading) return <Loader />

  const totalNotes = recentNotes.length
  const submittedNotes = recentNotes.filter(n => n.status === 'submitted').length

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-greeting">{getGreeting()}, {user?.nama}! 👋</h1>
        <p className="page-subtitle">Kelas {user.kelas} • Siap belajar hari ini?</p>
      </div>

      {/* Stats */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon stat-icon-cyan"><FileText size={22} /></div>
          <div>
            <div className="stat-value">{totalNotes}</div>
            <div className="stat-label">Total Catatan</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green"><BookOpen size={22} /></div>
          <div>
            <div className="stat-value">{submittedNotes}</div>
            <div className="stat-label">Sudah Dikirim</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-amber"><Zap size={22} /></div>
          <div>
            <div className="stat-value">{sessions.length}</div>
            <div className="stat-label">Sesi Aktif</div>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="section-header">
        <h2 className="section-title">🟢 Sesi Aktif</h2>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Belum Ada Sesi Aktif"
          description="Guru belum memulai sesi pelajaran. Cek kembali nanti!"
        />
      ) : (
        <div className="session-grid">
          {sessions.map(session => (
            <div key={session.id} className="session-card" onClick={() => handleJoinSession(session.id)}>
              <div className="session-card-header">
                <h3 className="session-card-title">{session.title}</h3>
                <Badge variant="success" dot>Aktif</Badge>
              </div>
              <div className="session-card-meta">
                <div className="session-card-meta-row">
                  <BookOpen size={14} /> {session.teacherName}
                </div>
                <div className="session-card-meta-row">
                  <Clock size={14} /> {session.duration} menit
                </div>
              </div>
              <SessionCountdown endTime={session.endTime} />
              <div className="session-card-footer">
                <Button size="sm" icon={ArrowRight}>Gabung</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Notes */}
      {recentNotes.length > 0 && (
        <>
          <div className="section-header">
            <h2 className="section-title">📝 Catatan Terbaru</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/archive')}>
              Lihat Semua
            </Button>
          </div>
          <div className="recent-notes-list">
            {recentNotes.map(note => (
              <div
                key={note.id}
                className="recent-note-item"
                onClick={() => navigate(`/archive/${note.id}`)}
              >
                <div className="recent-note-icon"><FileText size={20} /></div>
                <div className="recent-note-info">
                  <div className="recent-note-title">{note.title}</div>
                  <div className="recent-note-date">{formatDate(note.createdAt)}</div>
                </div>
                <Badge variant={note.status === 'submitted' ? 'success' : note.status === 'draft' ? 'warning' : 'neutral'}>
                  {note.status === 'submitted' ? 'Terkirim' : note.status === 'draft' ? 'Draft' : 'Terkunci'}
                </Badge>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
