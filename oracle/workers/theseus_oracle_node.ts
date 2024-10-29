const zmq = require("zeromq");
import "dotenv/config";
var colors = require("colors");
const log = require("single-line-log").stdout;
import { getMessages } from "../utils/getMessages";

const theseus = new zmq.Request();

(async () => {
  await theseus.connect(
    `tcp://${process.env.ZMQ_SERVER || "0.0.0.0"}:${
      process.env.ZMQ_TOKENS_PORT || "7779"
    }`
  );

  log(
    colors.green(
      `Connected to server at ${process.env.ZMQ_SERVER}:${process.env.ZMQ_TOKENS_PORT}`
    )
  );

  await theseus.send("ready");

  while (true) {
    const msg = await theseus.receive();
    let dataToBeProcessed = msg.toString();
    log(colors.magenta("Received data:", dataToBeProcessed));

    // TODO Add logic to check if this was already processed

    // TODO Add logic to process the data

    // get the prompt form reciver cpontract
    log("dataToBeProcessed: " + dataToBeProcessed);
    log(dataToBeProcessed.promptCallbackID);
    log(dataToBeProcessed.callbackAddress);
    await getMessages(
      dataToBeProcessed?.promptCallbackID,
      dataToBeProcessed?.callbackAddress
    );

    // TODO: Call getMessageHistory() view from the contract
    // console.log("Response:", response);

    // TODO: Call getOpenAIResponse()
    // const response = await getOpenAIResponse(parsedData.data[0].greeting);

    // TODO: Call callback()
    // await callback(response);

    await theseus.send("done");
  }
})();
