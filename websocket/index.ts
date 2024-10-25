import WebSocket from "ws";
import { getOpenAIResponse } from "./Openapi";
import { callback } from "./nearCall";
const socketUrl = "wss://ws-events.intear.tech/events-testnet/log_text";
const message = JSON.stringify({ account_id: "leorocks.testnet" });

console.log("Attempting to connect to WebSocket...");

const ws = new WebSocket(socketUrl);

ws.on("open", () => {
  console.log("WebSocket connection established");
  console.log("Sending message:", message);
  ws.send(message);
});

ws.on("message", async (data) => {
  const parseddata = JSON.parse(data.toString()).log_text;

  console.log("Received:", parseddata);
  const parsedData = JSON.parse(parseddata);

  // Accessing the `data` array from the log_text
  if (parsedData.data && Array.isArray(parsedData.data)) {
    console.log("Greeting:", parsedData.data[0].greeting);
    const response = await getOpenAIResponse(parsedData.data[0].greeting);
    console.log("Response:", response);
    // await callback(response);
  }
});

ws.on("error", (error) => {
  console.error("WebSocket error:", error);
});

ws.on("close", (code, reason) => {
  console.log(`WebSocket connection closed. Code: ${code}, Reason: ${reason}`);
});

console.log("Script started. Waiting for WebSocket events...");

// Keep the script running
process.on("SIGINT", () => {
  console.log("Received SIGINT. Closing WebSocket connection.");
  ws.close();
  process.exit(0);
});
