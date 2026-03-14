import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menyisipkan token JWT ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bjurnal_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Function to normalize MongoDB _id to id recursively
const normalizeDbResp = (data) => {
  if (Array.isArray(data)) {
    return data.map(item => normalizeDbResp(item));
  } else if (data !== null && typeof data === 'object') {
    const newData = { ...data };
    if (newData._id) {
      newData.id = newData._id.toString();
    }
    for (const key in newData) {
      if (typeof newData[key] === 'object') {
        newData[key] = normalizeDbResp(newData[key]);
      }
    }
    return newData;
  }
  return data;
}

api.interceptors.response.use((response) => {
  response.data = normalizeDbResp(response.data);
  return response;
});

// ====== Auth API ======
export const authApi = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  async updateProfile(userData) {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  }
};

// ====== Session API ======
export const sessionApi = {
  async getActiveSessions() {
    // Backend endpoint restricts to 'murid' and filters by their class
    const response = await api.get('/sessions/active');
    return response.data;
  },
  async getSessionsByTeacher() {
    // Backend endpoint restricts to 'guru'
    const response = await api.get('/sessions/me');
    return response.data;
  },
  async getSession(sessionId) {
    const response = await api.get(`/sessions/${sessionId}`);
    return response.data;
  },
  async createSession(sessionData) {
    const response = await api.post('/sessions', sessionData);
    return response.data;
  },
  async closeSession(sessionId) {
    const response = await api.put(`/sessions/${sessionId}/close`);
    return response.data;
  },
  async getSubmissionTracker(sessionId) {
    const response = await api.get(`/sessions/${sessionId}/tracker`);
    return response.data;
  }
};

// ====== Note API ======
export const noteApi = {
  // Alias for archive (to match previous mock function name if needed or use getArchiveNotes directly)
  async getNotesByStudent() {
    const response = await api.get('/notes/archive');
    return response.data;
  },
  async getNote(noteId) {
    const response = await api.get(`/notes/${noteId}`);
    return response.data;
  },
  async createNote(data) {
    const response = await api.post('/notes', data);
    return response.data;
  },
  async getNoteBySessionAndStudent(sessionId) {
    // We can use createNote here because the backend handles find-or-create logic
    // or we could add a specific search endpoint. For now, createNote is sufficient
    // as it returns the existing note if found.
    const response = await api.post('/notes', { sessionId });
    return response.data;
  },
  async updateNote(noteId, data) {
    const response = await api.put(`/notes/${noteId}/autosave`, data);
    return response.data;
  },
  async submitNote(noteId, data = {}) {
    const response = await api.put(`/notes/${noteId}/submit`, data);
    return response.data;
  },
  async searchNotes(studentId, query) {
    // Implementasi pencarian di sisi client dari data arsip
    const response = await api.get('/notes/archive');
    const notes = response.data;
    const q = query.toLowerCase();
    return notes.filter(n => (
      (n.title && n.title.toLowerCase().includes(q)) ||
      (n.content && n.content.toLowerCase().includes(q)) ||
      (n.reflection && n.reflection.toLowerCase().includes(q))
    ));
  }
};

export default api;
