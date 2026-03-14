import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Clock, BookOpen, Eye, XCircle, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { sessionApi } from '../../services/api'
import { useCountdown } from '../../hooks/useHooks'
import { Input, Select } from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { Badge, Modal, Loader, EmptyState } from '../../components/ui/Components'
import { DURATIONS, KELAS_OPTIONS, SESSION_STATUS } from '../../utils/constants'
import { getGreeting, formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'
import './Teacher.css'

function SessionTimer({ endTime }) {
  const { formatted, secondsLeft } = useCountdown(endTime)
  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatted}</span>
}

export default function TeacherDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(null)
  const [closing, setClosing] = useState(false)
  const [form, setForm] = useState({ title: '', duration: 45, kelas: '' })

  useEffect(() => {
    loadSessions()
  }, [user])

  async function loadSessions() {
    try {
      const data = await sessionApi.getSessionsByTeacher(user.id)
      setSessions(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.kelas) {
      toast.error('Lengkapi judul materi dan kelas')
      return
    }
    setCreating(true)
    try {
      await sessionApi.createSession({
        title: form.title,
        teacherId: user.id,
        teacherName: user.nama,
        kelas: form.kelas,
        duration: form.duration,
      })
      toast.success('Sesi berhasil dimulai! 🎉')
      setForm({ title: '', duration: 45, kelas: '' })
      loadSessions()
    } catch (err) {
      toast.error('Gagal membuat sesi')
    } finally {
      setCreating(false)
    }
  }

  const handleClose = async () => {
    if (!showCloseModal) return
    setClosing(true)
    try {
      await sessionApi.closeSession(showCloseModal)
      toast.success('Sesi ditutup')
      setShowCloseModal(null)
      loadSessions()
    } catch (err) {
      toast.error('Gagal menutup sesi')
    } finally {
      setClosing(false)
    }
  }

  const activeSessions = sessions.filter(s => s.status === SESSION_STATUS.ACTIVE)
  const pastSessions = sessions.filter(s => s.status === SESSION_STATUS.CLOSED)

  if (loading) return <Loader />

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-greeting">{getGreeting()}, {user.nama?.split(' ').pop()}! 📚</h1>
        <p className="page-subtitle">Kelola sesi pelajaran Anda</p>
      </div>

      <div className="teacher-grid">
        {/* Create Session */}
        <div className="create-session-card">
          <h2><Plus size={20} /> Mulai Sesi Baru</h2>
          <form className="create-session-form" onSubmit={handleCreate}>
            <Input
              label="Judul Materi"
              placeholder='Contoh: "Matematika: Logaritma"'
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
            <Select
              label="Kelas"
              placeholder="Pilih kelas"
              options={KELAS_OPTIONS}
              value={form.kelas}
              onChange={e => setForm({ ...form, kelas: e.target.value })}
            />
            <Select
              label="Durasi"
              options={DURATIONS}
              value={form.duration}
              onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
            />
            <Button type="submit" fullWidth loading={creating} icon={Plus}>
              Mulai Sesi
            </Button>
          </form>
        </div>

        {/* Sessions List */}
        <div className="sessions-list-card">
          <h2><BookOpen size={20} /> Sesi Aktif ({activeSessions.length})</h2>

          {activeSessions.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Tidak ada sesi aktif"
              description="Mulai sesi baru dari form di samping."
            />
          ) : (
            activeSessions.map(session => (
              <div key={session.id} className="session-list-item">
                <div className="session-list-info">
                  <div className="session-list-title">{session.title}</div>
                  <div className="session-list-meta">
                    <span>{session.kelas}</span>
                    <span>•</span>
                    <Clock size={12} />
                    <SessionTimer endTime={session.endTime} />
                  </div>
                </div>
                <div className="session-list-actions">
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/teacher/session/${session.id}`)} icon={Eye}>
                    Detail
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setShowCloseModal(session.id)} icon={XCircle}>
                    Tutup
                  </Button>
                </div>
              </div>
            ))
          )}

          {pastSessions.length > 0 && (
            <>
              <h3 style={{ marginTop: '24px', marginBottom: '12px', color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)' }}>
                Riwayat Sesi
              </h3>
              {pastSessions.slice(0, 5).map(session => (
                <div key={session.id} className="session-list-item">
                  <div className="session-list-info">
                    <div className="session-list-title">{session.title}</div>
                    <div className="session-list-meta">
                      <span>{session.kelas}</span>
                      <span>•</span>
                      <span>{formatDate(session.createdAt)}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/teacher/session/${session.id}`)} icon={Eye}>
                    Lihat
                  </Button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Close Modal */}
      <Modal
        isOpen={!!showCloseModal}
        onClose={() => setShowCloseModal(null)}
        title="Tutup Sesi?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCloseModal(null)}>Batal</Button>
            <Button variant="danger" onClick={handleClose} loading={closing}>Ya, Tutup Sesi</Button>
          </>
        }
      >
        <p>Semua catatan yang belum dikirim akan otomatis dikunci. Apakah Anda yakin ingin menutup sesi ini?</p>
      </Modal>
    </div>
  )
}
