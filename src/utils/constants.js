export const API_BASE_URL = 'http://localhost:5000/api'

export const ROLES = {
  STUDENT: 'murid',
  TEACHER: 'guru',
}

export const NOTE_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  LOCKED: 'locked',
}

export const SESSION_STATUS = {
  ACTIVE: 'active',
  CLOSED: 'closed',
}

export const AUTO_SAVE_INTERVAL = 60000 // 60 seconds

export const MAX_IMAGE_SIZE = 2 * 1024 * 1024 // 2MB

export const DURATIONS = [
  { value: 30, label: '30 Menit' },
  { value: 45, label: '45 Menit' },
  { value: 60, label: '60 Menit' },
  { value: 90, label: '90 Menit' },
]

export const KELAS_OPTIONS = [
  'VII-A', 'VII-B', 'VII-C',
  'VIII-A', 'VIII-B', 'VIII-C',
  'IX-A', 'IX-B', 'IX-C',
  'X-IPA-1', 'X-IPA-2', 'X-IPS-1', 'X-IPS-2',
  'XI-IPA-1', 'XI-IPA-2', 'XI-IPS-1', 'XI-IPS-2',
  'XII-IPA-1', 'XII-IPA-2', 'XII-IPS-1', 'XII-IPS-2',
]
