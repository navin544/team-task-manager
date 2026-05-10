import { useEffect } from 'react';
import { io } from 'socket.io-client';

import { SOCKET_URL } from '../utils/constants';

export function useSocket({ enabled, token, handlers = {} }) {
  useEffect(() => {
    if (!enabled || !token) {
      return undefined;
    }

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: {
        token
      }
    });

    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
      socket.disconnect();
    };
  }, [enabled, handlers, token]);
}
