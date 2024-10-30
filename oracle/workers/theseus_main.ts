const zmq = require("zeromq");
const log = require("single-line-log").stdout;
import colors from "colors";
import dotenv from "dotenv";
import WebSocket from "ws";

dotenv.config();

const isMainnet = false;

const nearIndexerWS = isMainnet
  ? "wss://ws-events.intear.tech/events-mainnet/log_text"
  : "wss://ws-events.intear.tech/events-testnet/log_text";

const theseus = new zmq.Reply();
const ws = new WebSocket(nearIndexerWS);

(async () => {
  await theseus.bind(
    `tcp://${process.env.RPC_HOST || "0.0.0.0"}:${
      process.env.THESUS_PORT || "7779"
    }`
  );
  console.log(
    colors.green(
      `\nServer is ready on ${process.env.RPC_HOST}:${process.env.THESUS_PORT}`
    )
  );

  ws.on("open", () => {
    // console.log(
    //   colors.green(
    //     // "\nListening for events on the " + isMainnet ? "mainnet" : "testnet"
    //   )
    // );
    // TODO: Configure the oracle account id
    const message = JSON.stringify({ account_id: "oracletest2.testnet" });

    console.log("WebSocket connection established");
    console.log("Sending message:", message);
    ws.send(message);
    // ws.send(JSON.stringify({ account_id: "oracletest2.testnet" }));
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
        console.log(colors.magenta("Received data:" + dataToBeProcessed.data));
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
