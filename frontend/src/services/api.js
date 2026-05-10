import axios from 'axios';

import { API_URL } from '../utils/constants';

let accessToken = null;
let unauthorizedHandler = null;
let refreshPromise = null;

export const publicApi = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

export function setAccessToken(token) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !String(originalRequest.url || '').includes('/auth/')
    ) {
      originalRequest._retry = true;

      try {
        refreshPromise =
          refreshPromise ||
          publicApi
            .post('/auth/refresh')
            .then((response) => {
              setAccessToken(response.data.data.accessToken);
              return response.data.data.accessToken;
            })
            .finally(() => {
              refreshPromise = null;
            });

        const token = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearAccessToken();
        unauthorizedHandler?.();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
