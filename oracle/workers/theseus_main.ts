import zmq from "zeromq";
import { log } from "single-line-log";
import colors from "colors";
import "dotenv/config";
import WebSocket from "ws";

const isMainnet = process.env.NETWORK === "mainnet";

const nearIndexerWS = isMainnet
  ? "wss://ws-events.intear.tech/events-mainnet/log_text"
  : "wss://ws-events.intear.tech/events-testnet/log_text";

const theseus = new zmq.Reply();
const ws = new WebSocket(nearIndexerWS);

(async () => {
  await theseus.bind(
    `tcp://${process.env.ZMQ_SERVER || "0.0.0.0"}:${
      process.env.ZMQ_TOKENS_PORT || "7779"
    }`
  );
  console.log(
    colors.green(
      `\nServer is ready on ${process.env.ZMQ_SERVER}:${process.env.ZMQ_TOKENS_PORT}`
    )
  );

  ws.on("open", () => {
    log(
      colors.green(
        "Listening for events on the " + isMainnet ? "mainnet" : "testnet"
      )
    );
    // TODO: Configure the oracle account id
    ws.send(JSON.stringify({ account_id: "oracletest1.testnet" }));
  });

  ws.on("message", async (data) => {
    const parsedMessage = JSON.parse(data.toString()).log_text;

    console.log("Received:", parsedMessage);
    const response = JSON.parse(parsedMessage);

    const { data: dataToBeProcessed } = response;

    // Accessing the `data` array from the log_text
    if (dataToBeProcessed) {
      // Check if there are any nodes ready to process the message
      const msgBytes = await theseus.receive();
      let msg: string = msgBytes.toString();

      if (msg === "ready" || msg === "done") {
        theseus.send(dataToBeProcessed);
      }
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  ws.on("close", (code, reason) => {
    console.log(
      `WebSocket connection closed. Code: ${code}, Reason: ${reason}`
    );
  });

  process.on("SIGINT", () => {
    log(colors.red("Received SIGINT. Closing WebSocket connection."));
    ws.close();
    theseus.close();
    process.exit(0);
  });
})();
