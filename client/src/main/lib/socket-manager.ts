import { Socket, io } from "socket.io-client";

let socketInstance: Socket | null = null;

export function createSocketConnection(): Socket {
  if (!socketInstance) {
    socketInstance = io("https://192.168.1.82:4000", {
      rejectUnauthorized: false,
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socketInstance;
}

export function getSocketInstance(): Socket | null {
  return socketInstance;
}

export function isSocketConnected(): boolean {
  return socketInstance !== null && socketInstance.connected;
}

export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

export function reconnectSocket(): void {
  if (socketInstance && !socketInstance.connected) {
    socketInstance.connect();
  } else if (!socketInstance) {
    createSocketConnection();
  }
}