export const API_BASE_URL = 'http://localhost:5000/api'

export const ROLES = {
  STUDENT: 'murid',
  TEACHER: 'guru',
  ADMIN: 'admin',
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
  { value: 45, label: '1 JP' },
  { value: 90, label: '2 JP' },
  { value: 135, label: '3 JP' },
  { value: 180, label: '4 JP' },
  { value: 225, label: '5 JP' },
  { value: 270, label: '6 JP' },
  { value: 315, label: '7 JP' },
  { value: 360, label: '8 JP' },
  { value: 420, label: '9 JP' },
  { value: 480, label: '10 JP' },
  { value: 540, label: '11 JP' },
]

export const KELAS_OPTIONS = [
  'X TKJ', 'X AK', 'X TB',
  'XI TKJ', 'XI AK', 'XI TB',
  'XII TKJ', 'XII AK', 'XII TB',
]
