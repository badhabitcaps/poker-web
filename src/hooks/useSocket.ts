import { useEffect } from "react";
import { getSocket } from '@/lib/socket';

export function useSocketIO(event: string, handler: (...args: any[]) => void) {
  useEffect(() => {
    const socket = getSocket();
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, [event, handler]);
} 