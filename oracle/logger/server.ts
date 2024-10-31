import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const loggerService = new Server(server);

// Handle incoming connections
loggerService.on("connection", (socket) => {
  console.log("a user connected");

  // Handle incoming messages
  socket.on("message", (data) => {
    console.log("message received:", data);

    // Broadcast the message to all connected clients
    realtimeLogger(loggerService, data);
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

function realtimeLogger(loggerService: Server, message: string) {
  loggerService.emit("message", message);
}
