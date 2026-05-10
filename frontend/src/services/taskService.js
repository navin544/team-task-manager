import { api } from './api';

export async function getTasks(params) {
  const response = await api.get('/tasks', { params });
  return response.data.data;
}

export async function getTaskById(taskId) {
  const response = await api.get(`/tasks/${taskId}`);
  return response.data.data;
}

export async function createTask(payload) {
  const response = await api.post('/tasks', payload);
  return response.data.data;
}

export async function updateTask(taskId, payload) {
  const response = await api.put(`/tasks/${taskId}`, payload);
  return response.data.data;
}

export async function deleteTask(taskId) {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
}

export async function createComment(payload) {
  const response = await api.post('/comments', payload);
  return response.data.data;
}

export async function getComments(taskId) {
  const response = await api.get(`/comments/${taskId}`);
  return response.data.data;
}

export async function uploadAttachment(taskId, file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data.data;
}
