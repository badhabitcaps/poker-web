import { useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";

type MessageHandler = (data: any) => void;

export function useSocket() {
  const { data: session } = useSession();
  const socketRef = useRef<WebSocket | null>(null);
  const messageHandlersRef = useRef<Map<string, Set<MessageHandler>>>(new Map());

  const connect = useCallback(() => {
    if (!session?.user) return;

    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001");
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      // Send authentication message
      ws.send(
        JSON.stringify({
          type: "auth",
          token: session.user.id,
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const handlers = messageHandlersRef.current.get(message.type);
        if (handlers) {
          handlers.forEach((handler) => handler(message.data));
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      // Attempt to reconnect after a delay
      setTimeout(connect, 5000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, [session]);

  useEffect(() => {
    const cleanup = connect();
    return () => {
      cleanup?.();
    };
  }, [connect]);

  const subscribe = useCallback((type: string, handler: MessageHandler) => {
    if (!messageHandlersRef.current.has(type)) {
      messageHandlersRef.current.set(type, new Set());
    }
    messageHandlersRef.current.get(type)?.add(handler);

    return () => {
      messageHandlersRef.current.get(type)?.delete(handler);
    };
  }, []);

  const send = useCallback((type: string, data: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type,
          data,
        })
      );
    }
  }, []);

  return {
    subscribe,
    send,
  };
} 