import { api } from './api';

export async function getNotifications() {
  const response = await api.get('/notifications');
  return response.data.data;
}

export async function markNotificationRead(notificationId) {
  const response = await api.patch(`/notifications/${notificationId}/read`);
  return response.data.data;
}
