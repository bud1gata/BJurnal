import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, FileText, Lock, BookOpen } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { noteApi } from '../../services/api'
import { Loader, EmptyState, Badge } from '../../components/ui/Components'
import { formatDate, stripHtml } from '../../utils/helpers'
import './Pages.css'

const STATUS_LABELS = {
  draft: { text: 'Draft', variant: 'warning' },
  submitted: { text: 'Terkirim', variant: 'success' },
  locked: { text: 'Terkunci', variant: 'neutral' },
}

export default function Archive() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function load() {
      try {
        const data = await noteApi.getNotesByStudent(user.id)
        setNotes(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  // Search
  useEffect(() => {
    if (!searchQuery.trim()) return
    const timer = setTimeout(async () => {
      const results = await noteApi.searchNotes(user.id, searchQuery)
      setNotes(results)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, user])

  // Reset on clear search
  useEffect(() => {
    if (!searchQuery.trim()) {
      noteApi.getNotesByStudent(user.id).then(setNotes)
    }
  }, [searchQuery, user])

  const filteredNotes = filter === 'all'
    ? notes
    : notes.filter(n => {
        const date = new Date(n.createdAt)
        const now = new Date()
        if (filter === 'week') {
          const weekAgo = new Date(now - 7 * 86400000)
          return date >= weekAgo
        }
        if (filter === 'month') {
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
        }
        return true
      })

  if (loading) return <Loader />

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-greeting">📚 Arsip Catatan</h1>
        <p className="page-subtitle">Semua catatan pertemuan kamu</p>
      </div>

      <div className="archive-header">
        <div className="archive-search">
          <Search size={16} className="archive-search-icon" />
          <input
            type="text"
            className="archive-search-input"
            placeholder="Cari catatan berdasarkan judul atau konten..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="archive-filters">
          {[['all', 'Semua'], ['week', 'Minggu Ini'], ['month', 'Bulan Ini']].map(([key, label]) => (
            <button
              key={key}
              className={`filter-chip ${filter === key ? 'active' : ''}`}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Belum Ada Catatan"
          description={searchQuery ? 'Tidak ada catatan yang cocok dengan pencarian.' : 'Mulai dari sesi aktif untuk membuat catatan pertamamu!'}
        />
      ) : (
        <div className="archive-list">
          {filteredNotes.map(note => {
            const status = STATUS_LABELS[note.status] || STATUS_LABELS.draft
            return (
              <div
                key={note.id}
                className="archive-item"
                onClick={() => navigate(`/archive/${note.id}`)}
              >
                <div className="archive-item-icon">
                  {note.status === 'submitted' ? <Lock size={20} /> : <FileText size={20} />}
                </div>
                <div className="archive-item-info">
                  <div className="archive-item-title">{note.title}</div>
                  <div className="archive-item-preview">{stripHtml(note.content) || 'Tidak ada konten'}</div>
                  <div className="archive-item-date">{formatDate(note.createdAt)}</div>
                </div>
                <div className="archive-item-badge">
                  <Badge variant={status.variant}>{status.text}</Badge>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
