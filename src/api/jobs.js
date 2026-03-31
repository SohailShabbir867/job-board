// src/api/jobs.js
import request from './client';

export function getJobs() {
  return request('/jobs');
}

export function getJob(id) {
  return request(`/jobs/${id}`);
}

export function createJob(jobData) {
  return request('/jobs', {
    method: 'POST',
    body: JSON.stringify(jobData),
  });
}

export function deleteJob(id) {
  return request(`/jobs/${id}`, { method: 'DELETE' });
}
