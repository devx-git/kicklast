import api from './api';

export const authService = {
  async login({ email, password }) {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.access_token) localStorage.setItem('token', data.access_token);
    return data;
  },

  async register(payload) {
    const body = { moneda: 'COP', pais: 'CO', ...payload };
    const { data } = await api.post('/auth/register', body);
    if (data.access_token) localStorage.setItem('token', data.access_token);
    return data;
  },

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
  },

  // Verifica token en localStorage Y que no haya expirado (exp del payload JWT)
  isAuthenticated() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        // Token expirado — limpiar silenciosamente
        localStorage.removeItem('token');
        return false;
      }
      return true;
    } catch {
      // Token malformado — limpiar
      localStorage.removeItem('token');
      return false;
    }
  },

  // Decodifica el payload del JWT sin verificar firma
  getPayload() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  },
};
