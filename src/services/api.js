import axios from 'axios';

// In dev: Vite proxies /api y /uploads → https://api.devxsolutions.pro
// In prod: set VITE_API_BASE to the real backend URL
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

/**
 * Base URL para imágenes subidas desde el admin.
 * En dev: '' (las URLs /uploads/... las proxea Vite)
 * En prod con VITE_API_BASE=https://api.devxsolutions.pro: 'https://api.devxsolutions.pro'
 */
export const UPLOADS_BASE = API_BASE.startsWith('http')
  ? API_BASE.replace(/\/+$/, '')   // quita trailing slash si lo hay
  : '';                             // relativo → Vite proxy en dev

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// No auto-logout en interceptor — cada página maneja su propio 401.
// La sesión se gestiona en authService.isAuthenticated() verificando exp del JWT.
api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);

export default api;
