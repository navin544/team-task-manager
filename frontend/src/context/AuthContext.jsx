import { useEffect, useMemo, useState } from 'react';

import { AuthContext } from './authContext';
import {
  clearAccessToken,
  setAccessToken,
  setUnauthorizedHandler
} from '../services/api';
import {
  forgotPassword as forgotPasswordRequest,
  login as loginRequest,
  logout as logoutRequest,
  refreshSession as refreshSessionRequest,
  register as registerRequest,
  resetPassword as resetPasswordRequest,
  updateProfile as updateProfileRequest
} from '../services/authService';

const SESSION_HINT_KEY = 'ttm_session_hint';

function hasSessionHint() {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.localStorage.getItem(SESSION_HINT_KEY) === '1';
  } catch {
    return false;
  }
}

function persistSessionHint() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(SESSION_HINT_KEY, '1');
  } catch {
    return;
  }
}

function clearSessionHint() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(SESSION_HINT_KEY);
  } catch {
    return;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessTokenState] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAccessToken();
      clearSessionHint();
      setAccessTokenState(null);
      setUser(null);
    });
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      if (!hasSessionHint()) {
        clearAccessToken();
        setAccessTokenState(null);
        setIsBootstrapping(false);
        return;
      }

      try {
        const session = await refreshSessionRequest();
        persistSessionHint();
        setAccessToken(session.accessToken);
        setAccessTokenState(session.accessToken);
        setUser(session.user);
      } catch {
        clearAccessToken();
        clearSessionHint();
        setAccessTokenState(null);
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrap();
  }, []);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'ADMIN',
      isBootstrapping,
      login: async (payload) => {
        const session = await loginRequest(payload);
        persistSessionHint();
        setAccessToken(session.accessToken);
        setAccessTokenState(session.accessToken);
        setUser(session.user);
        return session.user;
      },
      register: async (payload) => {
        const session = await registerRequest(payload);
        persistSessionHint();
        setAccessToken(session.accessToken);
        setAccessTokenState(session.accessToken);
        setUser(session.user);
        return session.user;
      },
      logout: async () => {
        try {
          await logoutRequest();
        } finally {
          clearAccessToken();
          clearSessionHint();
          setAccessTokenState(null);
          setUser(null);
        }
      },
      forgotPassword: forgotPasswordRequest,
      resetPassword: resetPasswordRequest,
      updateProfile: async (payload) => {
        const updatedUser = await updateProfileRequest(user.id, payload);
        setUser(updatedUser);
        return updatedUser;
      }
    }),
    [accessToken, isBootstrapping, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
