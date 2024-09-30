import cors from "cors";
import express, { Express } from "express";
import { remoteHandler } from "./remote";
import { createServer as createHttpServer } from 'http';
import { Server, Socket } from 'socket.io';

// let server;
// let io: Server;

export const startServer = (): void => {
  // const app: Express = express();
  // app.use(cors);

  // const port = 8080;

  // server = createHttpServer((req, res) => {
  //   app(req, res);
  // });

  // io = new Server(server, {
  //   cors: {
  //     origin: "*",
  //     methods: ["GET", "POST"],
  //   },
  // });

  // io.on("connection", (socket: Socket) => {
  //   console.log("a user connected");
  //   remoteHandler(socket);
  //   socket.on("disconnect", () => {
  //     console.log("user disconnected");
  //   });
  // });

  // server.listen(port, () => {
  //   console.log(`listening on *:${port}`);
  // });
}

export const stopServer = (): void => {
  // io.close();
}


