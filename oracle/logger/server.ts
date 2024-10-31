import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

// Handle incoming connections
io.on("connection", (socket) => {
  console.log("a user connected");

  // Handle incoming messages
  socket.on("message", (data) => {
    console.log("message received:", data);

    // Broadcast the message to all connected clients
    realtimeLogger(io, data);
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// Start the server
server.listen(3000, () => {
  console.log("listening on PORT 3000");
});

function realtimeLogger(io: Server, message: string) {
  io.emit("message", message);
}
