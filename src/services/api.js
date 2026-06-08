import axios from 'axios';

// In dev: Vite proxies /api → https://api.devxsolutions.pro (avoids CORS)
// In prod: set VITE_API_BASE to the real URL
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

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
