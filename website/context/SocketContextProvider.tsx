import React, { createContext, useCallback, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";


export interface SocketContextType {
  socket: Socket | null;
  sendMessage: (message: any) => void;
}


export const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<SocketContextType["socket"]>();


  const sendMessage = useCallback(
    (message: any) => {
      
    },
    [socket]
  );



  const onMessageRec = useCallback(
    (msg: any) => {
      console.log("Message received:", msg);
      
    },
    []
  );



  useEffect(() => {

    const _socket = io(process.env.NEXT_PUBLIC_API_SERVER_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    // Connection event handlers
    _socket.on("connect", () => {
      console.log("Socket connected:", _socket.id);
    });

    _socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    setSocket(_socket as Socket);

    return () => {
      _socket.off("connect");
      _socket.off("disconnect");
      _socket.off("connect_error");
      _socket.off("reconnect");
      _socket.off("reconnect_attempt");
      _socket.off("reconnect_error");
      _socket.off("reconnect_failed");
      _socket.disconnect();
      setSocket(undefined);
    };
  }, []);


  return (
    <SocketContext.Provider
      value={{
        socket: socket as Socket,
        sendMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
