import socketIOClient from "socket.io-client";

export const URL = "http://192.168.47.40:8080";
export const io = socketIOClient(URL);