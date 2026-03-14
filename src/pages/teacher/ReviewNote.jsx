import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Lightbulb, User, Calendar } from 'lucide-react'
import { noteApi } from '../../services/api'
import { Loader, Badge } from '../../components/ui/Components'
import Button from '../../components/ui/Button'
import { formatDate, getInitials, getAvatarColor } from '../../utils/helpers'
import '../../pages/student/Pages.css'
import './Teacher.css'

export default function ReviewNote() {
  const { noteId } = useParams()
  const navigate = useNavigate()
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await noteApi.getNote(noteId)
        setNote(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [noteId])

  if (loading) return <Loader />
  if (!note) return <div>Catatan tidak ditemukan</div>

  return (
    <div className="note-view animate-fade-in">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} icon={ArrowLeft} style={{ marginBottom: '16px' }}>
        Kembali
      </Button>

      {/* Review Header */}
      <div className="review-header">
        <div className="review-student-info">
          <div
            style={{
              width: '40px', height: '40px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: getAvatarColor(note.studentName),
              color: 'white', fontWeight: 'bold', fontSize: '14px',
              flexShrink: 0,
            }}
          >
            {getInitials(note.studentName)}
          </div>
          <div>
            <div style={{ fontWeight: 'var(--fw-semibold)' }}>{note.studentName}</div>
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
              {formatDate(note.createdAt)}
            </div>
          </div>
        </div>
        <Badge variant={note.status === 'submitted' ? 'success' : 'warning'}>
          {note.status === 'submitted' ? 'Terkirim' : 'Draft'}
        </Badge>
      </div>

      <div className="note-view-header">
        <h1 className="note-view-title">{note.title}</h1>
        <div className="note-view-meta">
          <span><Calendar size={14} style={{ verticalAlign: 'text-bottom' }} /> {formatDate(note.createdAt)}</span>
          {note.submittedAt && <span>Dikirim: {formatDate(note.submittedAt)}</span>}
        </div>
      </div>

      {/* Content */}
      <div
        className="note-view-content"
        dangerouslySetInnerHTML={{ __html: note.content || '<p style="color: var(--text-muted)">Tidak ada konten catatan.</p>' }}
      />

      {/* Reflection */}
      {note.reflection ? (
        <div className="note-view-reflection">
          <h3><Lightbulb size={18} /> Refleksi Murid</h3>
          <p>{note.reflection}</p>
        </div>
      ) : (
        <div className="note-view-reflection" style={{ borderLeftColor: 'var(--warning)' }}>
          <h3 style={{ color: 'var(--warning)' }}><Lightbulb size={18} /> Refleksi</h3>
          <p>Murid tidak mengisi bagian refleksi.</p>
        </div>
      )}
    </div>
  )
}
