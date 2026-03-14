import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Users, Zap, Clock, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { sessionApi } from '../../services/api'
import { getGreeting } from '../../utils/helpers'
import { Loader, Card, Badge } from '../../components/ui/Components'
import Button from '../../components/ui/Button'
import './Teacher.css'

export default function TeacherHome() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await sessionApi.getSessionsByTeacher()
        setSessions(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <Loader />

  const activeCount = sessions.filter(s => s.status === 'active').length
  const totalStudents = 0 // Future extension: count from notes/tracker across sessions?

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-greeting">{getGreeting()}, {user?.nama}! 👨‍🏫</h1>
        <p className="page-subtitle">Ringkasan aktivitas hari ini</p>
      </div>

      <div className="dashboard-stats">
        <Card className="stat-card">
          <div className="stat-icon stat-icon-cyan"><BookOpen size={22} /></div>
          <div>
            <div className="stat-value">{sessions.length}</div>
            <div className="stat-label">Total Sesi</div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon stat-icon-green"><Zap size={22} /></div>
          <div>
            <div className="stat-value">{activeCount}</div>
            <div className="stat-label">Sesi Berjalan</div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon stat-icon-amber"><Users size={22} /></div>
          <div>
            <div className="stat-value">Aktif</div>
            <div className="stat-label">Status Mengajar</div>
          </div>
        </Card>
      </div>

      <div className="section-header">
        <h2 className="section-title">⚡ Sesi Berjalan</h2>
        <Button variant="ghost" size="sm" onClick={() => navigate('/teacher/sessions')}>
          Kelola Semua
        </Button>
      </div>

      {activeCount === 0 ? (
        <div className="create-session-card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
            Belum ada sesi yang berjalan saat ini.
          </p>
          <Button onClick={() => navigate('/teacher/sessions')} icon={Zap}>
            Mulai Sesi Baru
          </Button>
        </div>
      ) : (
        <div className="session-grid">
          {sessions.filter(s => s.status === 'active').map(session => (
            <div key={session.id} className="session-card" onClick={() => navigate(`/teacher/session/${session.id}`)}>
              <div className="session-card-header">
                <h3 className="session-card-title">{session.title}</h3>
                <Badge variant="success" dot>Aktif</Badge>
              </div>
              <div className="session-card-meta">
                <div className="session-card-meta-row">
                  <Users size={14} /> Kelas {session.kelas}
                </div>
                <div className="session-card-meta-row">
                  <Clock size={14} /> {session.duration} menit
                </div>
              </div>
              <div className="session-card-footer" style={{ marginTop: 'auto' }}>
                <Button size="sm" variant="secondary" icon={ArrowRight} fullWidth>
                  Lihat Tracker
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
