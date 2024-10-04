import { io, Socket } from "socket.io-client";

export function createSocketConnection(deviceId: string): Socket {
  const socket = io("https://192.168.1.82:4000", {
    rejectUnauthorized: false,
    transports: ['websocket']
  });

  return socket;
}