const BASE = (window.__API_URL__ || import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(BASE + path, { headers: { 'Content-Type': 'application/json' }, ...options });
  } catch {
    throw new Error('Không thể kết nối tới backend. Vui lòng thử lại sau.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Lỗi ${res.status}`);
  return data;
}

export const api = {
  list: (search = '') => request(`/api/devices${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  get: (id) => request(`/api/devices/${id}`),
  create: (body) => request('/api/devices', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/api/devices/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id) => request(`/api/devices/${id}`, { method: 'DELETE' }),
};
