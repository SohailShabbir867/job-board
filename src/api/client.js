// src/api/client.js
// Base fetch wrapper that automatically attaches the JWT Authorization header.

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  try {
    return localStorage.getItem('token') || '';
  } catch {
    return '';
  }
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export default request;
