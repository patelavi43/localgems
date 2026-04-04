import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('lg_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lg_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.patch('/auth/profile', data),
  changePassword: (data) => API.patch('/auth/change-password', data),
};

// ── Talent ───────────────────────────────────────────────────
export const talentAPI = {
  search: (params) => API.get('/talent', { params }),
  getById: (id) => API.get(`/talent/${id}`),
  getMyProfile: () => API.get('/talent/me'),

  // ✅ FIX: explicitly set multipart/form-data so Multer can read files
  createOrUpdate: (data) =>
    API.post('/talent', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateAvailability: (id, availability) =>
    API.patch(`/talent/${id}/availability`, { availability }),
  addPortfolio: (data) => API.post('/talent/portfolio', data),
};

// ── Bookings ─────────────────────────────────────────────────
export const bookingAPI = {
  create: (data) => API.post('/bookings', data),
  getMyBookings: (params) => API.get('/bookings/me', { params }),
  getById: (id) => API.get(`/bookings/${id}`),
  updateStatus: (id, data) => API.patch(`/bookings/${id}/status`, data),
};

// ── Reviews ──────────────────────────────────────────────────
export const reviewAPI = {
  create: (data) => API.post('/reviews', data),
  getTalentReviews: (talentId, params) =>
    API.get(`/reviews/talent/${talentId}`, { params }),
};

// ── Events ───────────────────────────────────────────────────
export const eventAPI = {
  create: (data) => API.post('/events', data),
  getAll: (params) => API.get('/events', { params }),
  getById: (id) => API.get(`/events/${id}`),
  apply: (id, data) => API.post(`/events/${id}/apply`, data),
  respondToApplicant: (id, applicantId, data) =>
    API.patch(`/events/${id}/applicants/${applicantId}`, data),
};

// ── Admin ────────────────────────────────────────────────────
export const adminAPI = {
  getAnalytics: () => API.get('/admin/analytics'),
  getUsers: (params) => API.get('/admin/users', { params }),
  toggleUser: (id) => API.patch(`/admin/users/${id}/toggle`),
  getPendingTalents: () => API.get('/admin/talents/pending'),
  verifyTalent: (id, action) =>
    API.patch(`/admin/talents/${id}/verify`, { action }),
};

// ── Chat ─────────────────────────────────────────────────────
export const chatAPI = {
  getConversations: () => API.get('/chat/conversations'),
  startConversation: (talentUserId) =>
    API.post('/chat/start', { talentUserId }),
  getMessages: (id) => API.get(`/chat/${id}`),
  sendMessage: (id, content) =>
    API.post(`/chat/${id}/message`, { content }),
};

export default API;
