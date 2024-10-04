import { Socket, io } from "socket.io-client";

let socketInstance: Socket | null = null;

export function createSocketConnection(): Socket {
  if (!socketInstance) {
    socketInstance = io("https://192.168.1.82:4000", {
      rejectUnauthorized: false,
      transports: ['websocket'],
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