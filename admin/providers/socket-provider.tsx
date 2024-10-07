'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initSocket, getSocket } from '../lib/socket';
import { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  transport: string;
  error: string;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [error, setError] = useState("");
  useEffect(() => {
    const socketInstance = initSocket();

    setSocket(socketInstance);

    function onConnect() {
      console.log('Connected to server');
      setIsConnected(true);
      setTransport(socketInstance.io.engine.transport.name);
    }

    function onDisconnect(reason: string) {
      console.log('Disconnected from server:', reason);
      setIsConnected(false);
      setTransport("N/A");
    }

    function onConnectError(error: Error) {
      console.error('Connection error:', error);
      setError(error.message);
    }

    socketInstance.on("connect", onConnect);
    socketInstance.on("disconnect", onDisconnect);
    socketInstance.on("connect_error", onConnectError);

    socketInstance.io.engine.on("upgrade", (transport) => {
      setTransport(transport.name);
    });

    // Attempt to connect if not already connected
    if (!socketInstance.connected) {
      socketInstance.connect();
    }

    return () => {
      socketInstance.off("connect", onConnect);
      socketInstance.off("disconnect", onDisconnect);
      socketInstance.off("connect_error", onConnectError);
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, transport, error }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};