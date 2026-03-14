/**
 * Mock API Service — simulates backend with in-memory data.
 * Replace these with real axios calls when backend is ready.
 */

import { NOTE_STATUS, SESSION_STATUS } from '../utils/constants'

// ====== Mock Data Store ======

let sessions = [
  {
    id: 'S1',
    title: 'Matematika: Logaritma',
    teacherId: 'T1',
    teacherName: 'Pak Hendra Wijaya',
    kelas: 'X-IPA-1',
    duration: 45,
    status: SESSION_STATUS.ACTIVE,
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    endTime: new Date(Date.now() + 35 * 60000).toISOString(),
  },
  {
    id: 'S2',
    title: 'Bahasa Indonesia: Puisi Modern',
    teacherId: 'T2',
    teacherName: 'Bu Ratna Sari',
    kelas: 'X-IPA-1',
    duration: 60,
    status: SESSION_STATUS.ACTIVE,
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    endTime: new Date(Date.now() + 55 * 60000).toISOString(),
  },
  {
    id: 'S3',
    title: 'Fisika: Hukum Newton',
    teacherId: 'T1',
    teacherName: 'Pak Hendra Wijaya',
    kelas: 'X-IPA-1',
    duration: 45,
    status: SESSION_STATUS.CLOSED,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    endTime: new Date(Date.now() - 3 * 86400000 + 45 * 60000).toISOString(),
  },
]

let notes = [
  {
    id: 'N1',
    sessionId: 'S3',
    studentId: '1',
    studentName: 'Ahmad Rizky',
    title: 'Fisika: Hukum Newton',
    content: '<h2>Hukum Newton</h2><p><strong>Hukum I Newton (Inersia):</strong> Setiap benda cenderung mempertahankan keadaannya — diam atau bergerak lurus beraturan — kecuali ada gaya yang bekerja padanya.</p><p><strong>Hukum II Newton:</strong> F = m × a</p><ul><li>F = Gaya (Newton)</li><li>m = Massa (kg)</li><li>a = Percepatan (m/s²)</li></ul><p><strong>Hukum III Newton:</strong> Setiap aksi memiliki reaksi yang sama besar tapi berlawanan arah.</p>',
    reflection: 'Hari ini saya memahami hubungan antara gaya dan percepatan. Rumus F=ma ternyata sangat fundamental. Yang masih membingungkan adalah penerapan hukum III pada benda yang bergerak di bidang miring.',
    status: NOTE_STATUS.SUBMITTED,
    submittedAt: new Date(Date.now() - 3 * 86400000 + 40 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 86400000 + 5 * 60000).toISOString(),
  },
  {
    id: 'N2',
    sessionId: 'S3',
    studentId: '2',
    studentName: 'Siti Nurhaliza',
    title: 'Fisika: Hukum Newton',
    content: '<h2>Catatan Hukum Newton</h2><p>Newton merumuskan 3 hukum dasar tentang gerak benda.</p><p>Rumus penting: <strong>F = m.a</strong></p>',
    reflection: 'Pelajaran hari ini cukup padat. Saya perlu belajar lagi tentang hukum III Newton.',
    status: NOTE_STATUS.SUBMITTED,
    submittedAt: new Date(Date.now() - 3 * 86400000 + 38 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 86400000 + 3 * 60000).toISOString(),
  },
  {
    id: 'N3',
    sessionId: 'S3',
    studentId: '3',
    studentName: 'Budi Santoso',
    title: 'Fisika: Hukum Newton',
    content: '<p>Hukum Newton tentang gerak</p>',
    reflection: '',
    status: NOTE_STATUS.DRAFT,
    submittedAt: null,
    createdAt: new Date(Date.now() - 3 * 86400000 + 10 * 60000).toISOString(),
  },
]

// Simulate async delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// ====== Session API ======

export const sessionApi = {
  async getActiveSessions(kelas) {
    await delay()
    return sessions.filter(s => s.status === SESSION_STATUS.ACTIVE && (!kelas || s.kelas === kelas))
  },

  async getSessionsByTeacher(teacherId) {
    await delay()
    return sessions.filter(s => s.teacherId === teacherId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  async getSession(sessionId) {
    await delay()
    return sessions.find(s => s.id === sessionId) || null
  },

  async createSession({ title, teacherId, teacherName, kelas, duration }) {
    await delay(500)
    const newSession = {
      id: `S${Date.now()}`,
      title,
      teacherId,
      teacherName,
      kelas,
      duration,
      status: SESSION_STATUS.ACTIVE,
      createdAt: new Date().toISOString(),
      endTime: new Date(Date.now() + duration * 60000).toISOString(),
    }
    sessions.unshift(newSession)
    return newSession
  },

  async closeSession(sessionId) {
    await delay(500)
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      session.status = SESSION_STATUS.CLOSED
      // Lock all draft notes
      notes.forEach(n => {
        if (n.sessionId === sessionId && n.status === NOTE_STATUS.DRAFT) {
          n.status = NOTE_STATUS.LOCKED
        }
      })
    }
    return session
  },

  async getSubmissionTracker(sessionId) {
    await delay()
    const allStudents = [
      { id: '1', nama: 'Ahmad Rizky' },
      { id: '2', nama: 'Siti Nurhaliza' },
      { id: '3', nama: 'Budi Santoso' },
      { id: '4', nama: 'Dewi Anggraini' },
      { id: '5', nama: 'Fajar Nugroho' },
    ]
    return allStudents.map(student => {
      const note = notes.find(n => n.sessionId === sessionId && n.studentId === student.id)
      return {
        studentId: student.id,
        studentName: student.nama,
        status: note ? note.status : 'belum_masuk',
        noteId: note?.id || null,
        submittedAt: note?.submittedAt || null,
      }
    })
  },
}

// ====== Note API ======

export const noteApi = {
  async getNotesByStudent(studentId) {
    await delay()
    return notes
      .filter(n => n.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  async getNote(noteId) {
    await delay()
    return notes.find(n => n.id === noteId) || null
  },

  async getNoteBySessionAndStudent(sessionId, studentId) {
    await delay()
    return notes.find(n => n.sessionId === sessionId && n.studentId === studentId) || null
  },

  async createNote({ sessionId, studentId, studentName, title }) {
    await delay(300)
    const newNote = {
      id: `N${Date.now()}`,
      sessionId,
      studentId,
      studentName,
      title,
      content: '',
      reflection: '',
      status: NOTE_STATUS.DRAFT,
      submittedAt: null,
      createdAt: new Date().toISOString(),
    }
    notes.push(newNote)
    return newNote
  },

  async updateNote(noteId, { content, reflection }) {
    await delay(200)
    const note = notes.find(n => n.id === noteId)
    if (note && note.status === NOTE_STATUS.DRAFT) {
      if (content !== undefined) note.content = content
      if (reflection !== undefined) note.reflection = reflection
    }
    return note
  },

  async submitNote(noteId) {
    await delay(500)
    const note = notes.find(n => n.id === noteId)
    if (note) {
      note.status = NOTE_STATUS.SUBMITTED
      note.submittedAt = new Date().toISOString()
    }
    return note
  },

  async searchNotes(studentId, query) {
    await delay()
    const q = query.toLowerCase()
    return notes
      .filter(n => n.studentId === studentId && (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.reflection.toLowerCase().includes(q)
      ))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },
}
