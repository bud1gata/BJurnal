import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered,
  Image as ImageIcon, Clock, Save, Send, ArrowLeft, Lightbulb
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { sessionApi, noteApi } from '../../services/api'
import { useCountdown, useAutoSave } from '../../hooks/useHooks'
import { Modal, Loader, Badge } from '../../components/ui/Components'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'
import './Session.css'

function Toolbar({ editor }) {
  if (!editor) return null

  const tools = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
    { icon: UnderlineIcon, action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive('underline') },
    { icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike') },
    'divider',
    { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }) },
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
    { icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }) },
    'divider',
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
  ]

  return (
    <div className="editor-toolbar">
      {tools.map((tool, i) =>
        tool === 'divider' ? (
          <div key={i} className="toolbar-divider" />
        ) : (
          <button
            key={i}
            type="button"
            className={`toolbar-btn ${tool.active ? 'is-active' : ''}`}
            onClick={tool.action}
            title={tool.icon.displayName || ''}
          >
            <tool.icon size={18} />
          </button>
        )
      )}
    </div>
  )
}

export default function Session() {
  const { sessionId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [note, setNote] = useState(null)
  const [reflection, setReflection] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  const isLocked = note?.status === 'submitted' || note?.status === 'locked'

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: 'Mulai menulis catatan di sini...' }),
    ],
    content: '',
    editable: !isLocked,
    onUpdate: () => {},
  })

  // Load session & note
  useEffect(() => {
    async function load() {
      try {
        const sessionData = await sessionApi.getSession(sessionId)
        setSession(sessionData)

        let noteData = await noteApi.getNoteBySessionAndStudent(sessionId, user.id)
        if (!noteData && sessionData) {
          noteData = await noteApi.createNote({
            sessionId,
            studentId: user.id,
            studentName: user.nama,
            title: sessionData.title,
          })
        }
        if (noteData) {
          setNote(noteData)
          setReflection(noteData.reflection || '')
          if (editor && noteData.content) {
            editor.commands.setContent(noteData.content)
          }
        }
      } catch (err) {
        console.error(err)
        toast.error('Gagal memuat sesi')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [sessionId, user, editor])

  // Update editor editable state when lock status changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!isLocked)
    }
  }, [isLocked, editor])

  // Countdown
  const { formatted, isExpired } = useCountdown(session?.endTime)

  // Auto-save
  const saveFn = useCallback(async () => {
    if (!note || isLocked) return
    const content = editor?.getHTML() || ''
    await noteApi.updateNote(note.id, { content, reflection })
  }, [note, isLocked, editor, reflection])

  const { isSaving, lastSaved, saveNow } = useAutoSave(
    editor?.getHTML() + reflection,
    saveFn,
    60000
  )

  // Handle session expiry
  useEffect(() => {
    if (isExpired && note && !isLocked) {
      handleSubmit(true)
    }
  }, [isExpired])

  // Submit
  const handleSubmit = async (auto = false) => {
    if (!note || isLocked) return
    setSubmitting(true)

    try {
      // Save latest content first
      const content = editor?.getHTML() || ''
      await noteApi.updateNote(note.id, { content, reflection })
      await noteApi.submitNote(note.id)
      setNote(prev => ({ ...prev, status: 'submitted' }))
      setShowSubmitModal(false)

      if (auto) {
        toast('⏰ Waktu habis! Catatan otomatis dikirim.', { icon: '🔒' })
      } else {
        toast.success('Catatan berhasil dikirim! 🎉')
      }

      setTimeout(() => navigate('/archive'), 1500)
    } catch (err) {
      toast.error('Gagal mengirim catatan')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loader />
  if (!session) return <div>Sesi tidak ditemukan</div>

  return (
    <div className="editor-page animate-fade-in">
      {/* Header */}
      <div className="editor-header">
        <div className="editor-title-area">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} icon={ArrowLeft}>
            Kembali
          </Button>
          <h1 className="editor-title">{session.title}</h1>
          <div className="editor-meta">
            <span>{session.teacherName}</span>
            <span>•</span>
            <span>{session.duration} menit</span>
          </div>
        </div>
        <div className="editor-actions">
          <div className={`save-indicator ${isSaving ? 'saving' : lastSaved ? 'saved' : ''}`}>
            <span className={`save-dot ${isSaving ? 'saving' : ''}`} />
            {isSaving ? 'Menyimpan...' : lastSaved ? 'Tersimpan ✓' : 'Auto-save aktif'}
          </div>
          <Badge variant={isExpired ? 'danger' : 'info'}>
            <Clock size={14} style={{ marginRight: '4px' }} />
            {formatted}
          </Badge>
        </div>
      </div>

      {isLocked && (
        <div style={{
          padding: 'var(--space-4)',
          background: 'var(--accent-subtle)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-6)',
          color: 'var(--accent)',
          fontSize: 'var(--fs-sm)',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          🔒 Catatan ini sudah dikunci dan tidak dapat diubah.
        </div>
      )}

      {/* Editor */}
      <div className="editor-container">
        <Toolbar editor={editor} />
        <div className="editor-content">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Reflection */}
      <div className="reflection-section">
        <div className="reflection-header">
          <Lightbulb size={20} />
          Refleksi & Jurnal
        </div>
        <textarea
          className="reflection-textarea"
          placeholder="Tulis refleksi kamu tentang pelajaran hari ini. Apa yang kamu pahami? Apa yang masih membingungkan?"
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          disabled={isLocked}
        />
      </div>

      {/* Submit */}
      {!isLocked && (
        <div className="submit-bar">
          <div className="submit-bar-info">
            Catatan akan otomatis tersimpan. Tekan "Selesai & Kirim" jika sudah selesai.
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="secondary" onClick={saveNow} icon={Save} loading={isSaving}>
              Simpan
            </Button>
            <Button onClick={() => setShowSubmitModal(true)} icon={Send}>
              Selesai & Kirim
            </Button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Kirim Catatan?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>Batal</Button>
            <Button onClick={() => handleSubmit(false)} loading={submitting}>Ya, Kirim</Button>
          </>
        }
      >
        <p>Setelah dikirim, catatan akan <strong>dikunci</strong> dan tidak dapat diubah lagi. Pastikan kamu sudah mengisi bagian refleksi.</p>
      </Modal>
    </div>
  )
}
