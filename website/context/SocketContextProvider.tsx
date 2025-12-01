"use client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

export interface SocketContextType {
  socket: Socket | null;
  joinProject: (projectId: string) => void;
  sendLogs: (projectId: string, logs: any) => void;
}

export const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context as SocketContextType;
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  const joinProject = useCallback(
    (projectId: string) => {
      if (!socket) return;
      socket.emit("join:project", projectId);
    },
    [socket]
  );

  const sendLogs = useCallback(
    (projectId: string, logs: any) => {
      if (!socket) return;
      socket.emit("send:logs", projectId, logs);
    },
    [socket]
  );

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;

    if (!apiUrl) {
      console.error(
        "NEXT_PUBLIC_API_SERVER_URL is not defined. Socket will not connect."
      );
      return;
    }

    const _socket: Socket = io(apiUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      withCredentials: true, // send cookies (accessToken) for backend auth
    });

    // Connection event handlers
    _socket.on("connect", () => {
      console.log("Socket connected:", _socket.id);
    });

    _socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    _socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      toast.error(`Socket error: ${err.message}`);
    });

    setSocket(_socket);

    return () => {
      _socket.off("connect");
      _socket.off("disconnect");
      _socket.off("connect_error");
      _socket.disconnect();
      setSocket(null);
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        joinProject,
        sendLogs,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
