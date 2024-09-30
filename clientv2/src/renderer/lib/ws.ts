import socketIOClient from "socket.io-client";

export const URL = "http://localhost:4000";
export const io = socketIOClient(URL);