import { api } from './api';

export async function getUsers() {
  const response = await api.get('/users');
  return response.data.data;
}

export async function getUserById(userId) {
  const response = await api.get(`/users/${userId}`);
  return response.data.data;
}

export async function updateUser(userId, payload) {
  const response = await api.put(`/users/${userId}`, payload);
  return response.data.data;
}

export async function deleteUser(userId) {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
}
