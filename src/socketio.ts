import * as SocketIo from "socket.io";
import http from "node:http";

export const createSocketIosServer = (server: http.Server) => {
  const io = new SocketIo.Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  io.on("connection", (socket) => {
    console.log("User connected ", socket.id);
    socket.on("send_message", (data) => {
      console.log("Message Received ", data);
      io.emit("receive_message", data);
    });
  });
  return io;
};
