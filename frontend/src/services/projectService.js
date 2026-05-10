import { api } from './api';

export async function getProjects(params) {
  const response = await api.get('/projects', { params });
  return response.data.data;
}

export async function getProjectById(projectId) {
  const response = await api.get(`/projects/${projectId}`);
  return response.data.data;
}

export async function createProject(payload) {
  const response = await api.post('/projects', payload);
  return response.data.data;
}

export async function updateProject(projectId, payload) {
  const response = await api.put(`/projects/${projectId}`, payload);
  return response.data.data;
}

export async function deleteProject(projectId) {
  const response = await api.delete(`/projects/${projectId}`);
  return response.data;
}

export async function addProjectMember(projectId, payload) {
  const response = await api.post(`/projects/${projectId}/members`, payload);
  return response.data.data;
}

export async function removeProjectMember(projectId, userId) {
  const response = await api.delete(`/projects/${projectId}/members/${userId}`);
  return response.data;
}
