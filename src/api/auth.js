// src/api/auth.js
import request from './client';

export async function register({ name, email, password }) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  if (data.token) localStorage.setItem('token', data.token);
  return data.user;
}

export async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.token) localStorage.setItem('token', data.token);
  return data.user;
}

export async function getMe() {
  return request('/auth/me');
}

export function logoutUser() {
  try {
    localStorage.removeItem('token');
  } catch {
    // ignore
  }
}
