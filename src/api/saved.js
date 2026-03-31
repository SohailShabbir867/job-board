// src/api/saved.js
import request from './client';

export function getSavedJobs() {
  return request('/users/me/saved');
}

export function saveJob(jobId) {
  return request(`/users/me/saved/${jobId}`, { method: 'POST' });
}

export function unsaveJob(jobId) {
  return request(`/users/me/saved/${jobId}`, { method: 'DELETE' });
}
