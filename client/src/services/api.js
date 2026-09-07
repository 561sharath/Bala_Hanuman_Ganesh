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

// Collectors API
export const fetchCollectors = async () => {
  const res = await API.get('/collectors');
  return res.data;
};

export const addCollector = async (name) => {
  const res = await API.post('/collectors', { name });
  return res.data;
};

// Collections API
export const fetchCollections = async (sortBy, order) => {
  const res = await API.get('/collections', {
    params: { sortBy, order },
  });
  return res.data;
};

export const createCollectionRecord = async (data) => {
  const res = await API.post('/collections', data);
  return res.data;
};

export const searchCollectionsByName = async (query) => {
  const res = await API.get('/collections/search', {
    params: { q: query },
  });
  return res.data;
};

export const fetchCollectionsByDate = async (dateStr) => {
  const res = await API.get(`/collections/date/${dateStr}`);
  return res.data;
};

export const fetchCollectionsByCollector = async (collectorId) => {
  const res = await API.get(`/collections/collector/${collectorId}`);
  return res.data;
};

export const updateCollectionRecord = async (id, data) => {
  const res = await API.put(`/collections/${id}`, data);
  return res.data;
};
