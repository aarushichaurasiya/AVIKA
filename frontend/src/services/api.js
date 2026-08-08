import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const TOKEN_KEY = 'avika_token';

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function setToken(token) {
  try { localStorage.setItem(TOKEN_KEY, token); } catch { /* ignore */ }
}
export function clearToken() {
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
}

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalizes every response/error to { ok, data, error } — same shape the
// static site's api.js used, so callers don't need try/catch everywhere.
export async function call(promise) {
  try {
    const res = await promise;
    return { ok: true, data: res.data.data, meta: res.data.meta, error: null };
  } catch (err) {
    const message =
      err.response?.data?.error?.message ||
      (err.request ? `Could not reach the Avika API at ${API_URL}. Is the backend running?` : err.message);
    return { ok: false, data: null, error: message, details: err.response?.data?.error?.details };
  }
}

export default api;
