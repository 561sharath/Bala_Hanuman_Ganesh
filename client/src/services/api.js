import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization Bearer token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const loginAdmin = async (username, password) => {
  const res = await API.post('/auth/login', { username, password });
  return res.data;
};

export const fetchCurrentUser = async () => {
  const res = await API.get('/auth/me');
  return res.data;
};

// Collectors API
export const fetchCollectors = async () => {
  const res = await API.get('/collectors');
  return res.data;
};

export const addCollector = async (name) => {
  const res = await API.post('/collectors', { name });
  return res.data;
};

// Collections API with Server-side Pagination
export const fetchCollections = async (page = 1, limit = 20, sortBy, order) => {
  const res = await API.get('/collections', {
    params: { page, limit, sortBy, order },
  });
  return res.data;
};

export const createCollectionRecord = async (data) => {
  const res = await API.post('/collections', data);
  return res.data;
};

export const searchCollectionsByName = async (query, page = 1, limit = 20) => {
  const res = await API.get('/collections/search', {
    params: { q: query, page, limit },
  });
  return res.data;
};

export const fetchCollectionsByDate = async (dateStr, page = 1, limit = 20) => {
  const res = await API.get(`/collections/date/${dateStr}`, {
    params: { page, limit },
  });
  return res.data;
};

export const fetchCollectionsByCollector = async (collectorId, page = 1, limit = 20) => {
  const res = await API.get(`/collections/collector/${collectorId}`, {
    params: { page, limit },
  });
  return res.data;
};

export const fetchExportCollections = async () => {
  const res = await API.get('/collections/export');
  return res.data;
};

export const updateCollectionRecord = async (id, data) => {
  const res = await API.put(`/collections/${id}`, data);
  return res.data;
};

export const deleteCollectionRecord = async (id) => {
  const res = await API.delete(`/collections/${id}`);
  return res.data;
};

// Spendings API with Server-side Pagination
export const createSpendingRecord = async (data) => {
  const res = await API.post('/spendings', data);
  return res.data;
};

export const fetchSpendings = async ({ q, date, spentBy, page = 1, limit = 20 } = {}) => {
  const res = await API.get('/spendings', {
    params: { q, date, spentBy, page, limit },
  });
  return res.data;
};

export const updateSpendingRecord = async (id, data) => {
  const res = await API.put(`/spendings/${id}`, data);
  return res.data;
};

export const deleteSpendingRecord = async (id) => {
  const res = await API.delete(`/spendings/${id}`);
  return res.data;
};
