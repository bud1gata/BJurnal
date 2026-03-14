import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock, Lightbulb, Calendar, User } from 'lucide-react'
import { noteApi } from '../../services/api'
import { Loader, Badge } from '../../components/ui/Components'
import Button from '../../components/ui/Button'
import { formatDate } from '../../utils/helpers'
import './Pages.css'

export default function NoteView() {
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

      <div className="note-view-header">
        <h1 className="note-view-title">{note.title}</h1>
        <div className="note-view-meta">
          <Badge variant={note.status === 'submitted' ? 'success' : 'warning'}>
            {note.status === 'submitted' ? '🔒 Terkirim' : 'Draft'}
          </Badge>
          <span><Calendar size={14} style={{ verticalAlign: 'text-bottom' }} /> {formatDate(note.createdAt)}</span>
          {note.submittedAt && <span>Dikirim: {formatDate(note.submittedAt)}</span>}
        </div>
      </div>

      {/* Note Content */}
      <div
        className="note-view-content"
        dangerouslySetInnerHTML={{ __html: note.content || '<p style="color: var(--text-muted)">Tidak ada konten catatan.</p>' }}
      />

      {/* Reflection */}
      {note.reflection && (
        <div className="note-view-reflection">
          <h3><Lightbulb size={18} /> Refleksi</h3>
          <p>{note.reflection}</p>
        </div>
      )}
    </div>
  )
}
