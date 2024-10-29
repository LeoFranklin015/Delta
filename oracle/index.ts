import WebSocket from "ws";
import { getOpenAIResponse } from "./Openapi";
import { callback } from "./nearCall";
import { getMessages } from "./utils/getMessages";
import { callOpenAI } from "./utils/openAi";
const socketUrl = "wss://ws-events.intear.tech/events-testnet/log_text";
const message = JSON.stringify({ account_id: "oracletest1.testnet" });

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
  if (parsedData.data) {
    // console.log("Greeting:", parsedData.data[0].greeting);

    // get the prompt form reciver cpontract
    console.log("data" + parsedData.data);
    console.log(parsedData.data.promptCallbackID);
    console.log(parsedData.data.callbackAddress);
    const message = await getMessages(
      parsedData.data.promptCallbackID,
      parsedData.data.callbackAddress
    );
    console.log("messgae :" + message.decodedValue);
    console.log(message.decodedValue);
    console.log("Type of decodedValue:", typeof message.decodedValue);
    console.log(message.decodedValue);
    const openAIResponse = await callOpenAI(
      message.decodedValue,
      parsedData.data.config
    );
    console.log(openAIResponse);

    //get messageHoistrtoy from the contract - prompt - use wit

    // const response = await getOpenAIResponse(parsedData.data[0].greeting);
    // console.log("Response:", response);
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
