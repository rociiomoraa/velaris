// ================================================================
// VELARIS — API client (src/api/client.js)
// ================================================================
import axios from 'axios';

// En desarrollo: http://localhost:8080
// En Docker (producción): '' (URL relativa, nginx hace el proxy)
const BASE = import.meta.env.VITE_API_URL ?? '';

const api = axios.create({ baseURL: BASE });

// ── Rutas públicas que nunca deben disparar redirección al 401 ───
const PUBLIC_PATHS = ['/api/auth/', '/api/trips', '/api/flights', '/api/escapadas', '/api/ai/chat', '/api/reviews'];
const isPublic = (url = '') => PUBLIC_PATHS.some(p => url.includes(p));

let isRedirecting = false;

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('velaris_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status;
    const url    = err.config?.url ?? '';

    if (status === 401 && !isPublic(url) && !isRedirecting) {
      isRedirecting = true;
      localStorage.removeItem('velaris_token');
      localStorage.removeItem('velaris_user');
      // Pequeño delay para no cortar peticiones en vuelo
      setTimeout(() => {
        window.location.href = '/login';
        isRedirecting = false;
      }, 100);
    }

    return Promise.reject(err);
  }
);

// ── AUTH ──────────────────────────────────────────────────────────
export const authApi = {
  login:    body => api.post('/api/auth/login', body),
  register: body => api.post('/api/auth/register', body),
};

// ── TRIPS ─────────────────────────────────────────────────────────
export const tripsApi = {
  getAll:      params => api.get('/api/trips', { params }),
  getById:     id     => api.get(`/api/trips/${id}`),
  getSimilar:  id     => api.get(`/api/trips/${id}/similar`),
  getRandom:   ()     => api.get('/api/trips/random'),
  getAllForMap: ()     => api.get('/api/trips', { params: { size: 200, page: 0 } }),
  getAllAdmin:  ()     => api.get('/api/trips/all'),
};

// ── BOOKINGS ──────────────────────────────────────────────────────
export const bookingsApi = {
  create:     body       => api.post('/api/bookings', body),
  myBookings: (page = 0) => api.get('/api/bookings/my', { params: { page, size: 10 } }),
  cancel:     id         => api.patch(`/api/bookings/${id}/cancel`),
};

// ── FLIGHTS ───────────────────────────────────────────────────────
export const flightsApi = {
  getAll: params => api.get('/api/flights', { params }),
};

// ── ESCAPADAS ─────────────────────────────────────────────────────
export const escapadasApi = {
  getAll: params => api.get('/api/escapadas', { params }),
};

// ── FAVORITES ─────────────────────────────────────────────────────
export const favoritesApi = {
  getAll: ()  => api.get('/api/favorites'),
  add:    id  => api.post(`/api/favorites/${id}`),
  remove: id  => api.delete(`/api/favorites/${id}`),
};

// ── REVIEWS ───────────────────────────────────────────────────────
export const reviewsApi = {
  create:    body            => api.post('/api/reviews', body),
  getByTrip: (id, page = 0) => api.get(`/api/reviews/trip/${id}`, { params: { page, size: 10 } }),
  getRating: id              => api.get(`/api/reviews/trip/${id}/rating`),
};

// ── USERS ─────────────────────────────────────────────────────────
export const usersApi = {
  getMe:          ()   => api.get('/api/users/me'),
  updateMe:       body => api.put('/api/users/me', body),
  changePassword: body => api.put('/api/users/me/password', body),
};

// ── AI (VERA) ─────────────────────────────────────────────────────
export const aiApi = {
  chat:            body => api.post('/api/ai/chat', body),
  chatPersistent:  body => api.post('/api/ai/chat/persistent', body),
  recommendations: ()   => api.get('/api/ai/recommendations'),
  clearHistory:    ()   => api.delete('/api/ai/history'),
};

// ── ADMIN ─────────────────────────────────────────────────────────
export const adminApi = {
  getStats:            ()           => api.get('/api/admin/stats'),
  createTrip:          body         => api.post('/api/admin/trips', body),
  updateTrip:          (id, body)   => api.put(`/api/admin/trips/${id}`, body),
  deleteTrip:          id           => api.delete(`/api/admin/trips/${id}`),
  toggleTrip:          id           => api.patch(`/api/admin/trips/${id}/toggle`),          // ← NUEVO
  allBookings:         (page = 0)   => api.get('/api/admin/bookings', { params: { page, size: 20 } }),
  updateBookingStatus: (id, status) => api.patch(`/api/admin/bookings/${id}/status`, { status }),
  exportBookings:      ()           => api.get('/api/admin/bookings/export', { responseType: 'blob' }),
  getAllUsers:          ()           => api.get('/api/admin/users'),                         // ← NUEVO
  toggleUser:          id           => api.patch(`/api/admin/users/${id}/toggle`),          // ← NUEVO
  getTripsByType: (type, page = 0) => api.get('/api/admin/trips/by-type', { params: { type, page, size: 15 } }),
};

export default api;