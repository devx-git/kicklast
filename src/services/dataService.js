import api from './api';

// Simple in-memory cache: { key → { data, ts } }
const cache = {};
const TTL = 30000; // 30s

function cached(key, fn) {
  const now = Date.now();
  if (cache[key] && now - cache[key].ts < TTL) return Promise.resolve(cache[key].data);
  return fn().then(data => { cache[key] = { data, ts: now }; return data; });
}

export const dataService = {
  getEventosActivos: () =>
    cached('eventos_activos', async () => {
      const { data } = await api.get('/eventos/activos');
      return data;
    }),

  getEvento: (id) =>
    cached(`evento_${id}`, async () => {
      const { data } = await api.get(`/eventos/${id}`);
      return data;
    }),

  getEventosBySlug: async (slug) => {
    const { data } = await api.get(`/eventos?limit=50`);
    const all = Array.isArray(data) ? data : [];
    return all.find(e => e.slug === slug) || null;
  },

  getCampeonatos: () =>
    cached('campeonatos', async () => {
      const { data } = await api.get('/campeonatos');
      return data;
    }),

  getEventos: (limit = 50) =>
    cached(`eventos_${limit}`, async () => {
      const { data } = await api.get(`/eventos?limit=${limit}`);
      return Array.isArray(data) ? data : [];
    }),

  // Intentionally not cached — auth-dependent
  getMisPredicciones: async () => {
    const { data } = await api.get('/predicciones/mis-predicciones');
    return Array.isArray(data) ? data : (data?.data || []);
  },

  getMisMovimientos: async () => {
    const { data } = await api.get('/movimientos/mis-movimientos');
    return Array.isArray(data) ? data : (data?.data || []);
  },

  getMisRetiros: async () => {
    const { data } = await api.get('/retiros/mis-retiros');
    return Array.isArray(data) ? data : (data?.data || []);
  },

  getPaquetes: async () => {
    const { data } = await api.get('/creditos/paquetes');
    return Array.isArray(data) ? data : [];
  },

  getPerfil: async () => {
    const { data } = await api.get('/usuarios/perfil');
    return data;
  },

  updatePerfil: async (payload) => {
    const { data } = await api.patch('/usuarios/perfil', payload);
    return data;
  },

  getMisApuestas: async () => {
    const { data } = await api.get('/apuestas/mis-apuestas');
    return Array.isArray(data) ? data : (data?.data || []);
  },

  getMembresias: async () => {
    const { data } = await api.get('/membresias');
    return Array.isArray(data) ? data : [];
  },

  canjearPin: async (codigo) => {
    const { data } = await api.post('/pines/canjear', { codigo });
    return data;
  },

  invalidate: (key) => { delete cache[key]; },
  invalidateAll: () => { Object.keys(cache).forEach(k => delete cache[k]); },
};
