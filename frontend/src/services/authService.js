import { api, publicApi } from './api';

export async function register(payload) {
  const response = await publicApi.post('/auth/register', payload);
  return response.data.data;
}

export async function login(payload) {
  const response = await publicApi.post('/auth/login', payload);
  return response.data.data;
}

export async function logout() {
  await publicApi.post('/auth/logout');
}

export async function refreshSession() {
  const response = await publicApi.post('/auth/refresh');
  return response.data.data;
}

export async function forgotPassword(payload) {
  const response = await publicApi.post('/auth/forgot-password', payload);
  return response.data;
}

export async function resetPassword(payload) {
  const response = await publicApi.post('/auth/reset-password', payload);
  return response.data;
}

export async function updateProfile(userId, payload) {
  const response = await api.put(`/users/${userId}`, payload);
  return response.data.data;
}
