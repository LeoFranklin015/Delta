// import WebSocket from "ws";
const { WebSocket } = require("ws");
import { getOpenAIResponse } from "./Openapi";
import { callback } from "./nearCall";
import { getMessages } from "./utils/getMessages";
import { callOpenAI } from "./utils/openAi";
import { sendResponseToOracle } from "./utils/sendResponseOracle";
import { tools } from "./utils/tools";
import { sendFunctionResponse } from "./utils/sendFunctionResponse";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const socketUrl = "wss://ws-events.intear.tech/events-testnet/log_text";
const message = JSON.stringify({ account_id: "oracletest2.testnet" });

const app = express();
const server = createServer(app);
const loggerService = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Handle incoming connections
loggerService.on("connection", (socket) => {
  console.log("a user connected");

  // Handle incoming messages
  socket.on("message", (data) => {
    console.log("message received:", data);

    // Broadcast the message to all connected clients
    realtimeLogger(data);
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
    <title>Logger Client</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 p-6 min-h-screen">
    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div id="messages-container" class="h-[400px] overflow-y-auto mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
        </div>

        <form class="flex gap-2">
            <input type="text" 
                   placeholder="Type your message..." 
                   class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <button type="submit" 
                    class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Send
            </button>
        </form>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        const messagesContainer = document.getElementById('messages-container');

        // Handle incoming messages
        socket.on('message', (data) => {
            console.log('message received:', data);
            // Create a new message element
            const messageElement = document.createElement('div');
            messageElement.textContent = data;
            messageElement.className = 'p-3 mb-2 bg-white rounded-lg shadow-sm border border-gray-200';
            
            // Add the message to the container
            messagesContainer.appendChild(messageElement);
            
            // Auto-scroll to the bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });

        // Send a message when the form is submitted
        const form = document.querySelector('form');
        const input = document.querySelector('input');
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const message = input.value;
            socket.emit('message', message);
            input.value = '';
        });
    </script>
</body>
</html>`);
});
// Start the server
server.listen(4000, () => {
  console.log("listening on PORT 4000");
});

function realtimeLogger(message: string) {
  loggerService.emit("log", message);
}

console.log("Attempting to connect to WebSocket...");

const nearStream = new WebSocket(socketUrl);

nearStream.on("open", () => {
  console.log("WebSocket connection established");
  console.log("Sending message:", message);
  nearStream.send(message);
});

nearStream.on("message", async (data) => {
  const parseddata = JSON.parse(data.toString()).log_text;
  console.log("Received:", parseddata);
  const parsedData = JSON.parse(parseddata);

  // Accessing the `data` array from the log_text
  if (parsedData.data) {
    // get the prompt form reciver cpontract
    if (parsedData.type === "createOpenAiLlmCall") {
      realtimeLogger(
        JSON.stringify({
          type: "createdOpenAiLlmCall",
          id: parsedData.data.promptCallbackID,
        })
      );
    } else if (parsedData.type === "openAiResponseAdded") {
      realtimeLogger(
        JSON.stringify({
          type: "openAiResponseAdded",
          id: parsedData.data.promptCallbackID,
        })
      );
    } else if (parsedData.type === "createFunctionCall") {
      realtimeLogger(
        JSON.stringify({
          type: "createdFunctionCall",
          id: parsedData.data.functionCallbackId,
          functionType: parsedData.data.functionType,
        })
      );
    } else if (parsedData.type === "functionResponseAdded") {
      realtimeLogger(
        JSON.stringify({
          type: "functionResponseAdded",
          id: parsedData.data.functionCallbackId,
        })
      );
    }

    console.log("data" + parsedData.data);
    if (parsedData.type === "createOpenAiLlmCall") {
      const message = await getMessages(
        parsedData.data.promptCallbackID,
        parsedData.data.callbackAddress
      );
      console.log("messgae :" + message);
      console.log(`typeof message` + message);
      const openAIResponse = await callOpenAI(message, parsedData.data.config);
      console.log(openAIResponse);
      await sendResponseToOracle(
        parseInt(parsedData.data.promptId),
        parseInt(parsedData.data.promptCallbackID),
        openAIResponse.response,
        openAIResponse.error
      );
    } else if (parsedData.type == "createFunctionCall") {
      console.log(parsedData.data.functionType);
      console.log(parsedData.data.functionInput);
      const response = await tools(
        parsedData.data.functionType,
        parsedData.data.functionInput
      );

      await sendFunctionResponse(
        parseInt(parsedData.data.functionId),
        parseInt(parsedData.data.functionCallbackId),
        response.response,
        response.error
      );
    }
  }
});

nearStream.on("error", (error) => {
  console.error("WebSocket error:", error);
});

nearStream.on("close", (code, reason) => {
  console.log(`WebSocket connection closed. Code: ${code}, Reason: ${reason}`);
});

console.log("Script started. Waiting for WebSocket events...");

// Keep the script running
process.on("SIGINT", () => {
  console.log("Received SIGINT. Closing WebSocket connection.");
  nearStream.close();
  process.exit(0);
});
