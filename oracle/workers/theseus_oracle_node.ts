const zmq = require("zeromq");
import "dotenv/config";
var colors = require("colors");
const log = require("single-line-log").stdout;
import { getMessages } from "../utils/getMessages";
import { sendResponseToOracle } from "../utils/sendResponseOracle";
import { callOpenAI } from "../utils/openAi";

const theseus = new zmq.Request();

(async () => {
  await theseus.connect(
    `tcp://${process.env.RPC_HOST || "0.0.0.0"}:${
      process.env.THESUS_PORT || "7779"
    }`
  );

  log(
    colors.green(
      `Connected to server at ${process.env.RPC_HOST}:${process.env.THESUS_PORT}`
    )
  );

  await theseus.send("ready");

  while (true) {
    const msg = await theseus.receive();
    let dataToBeProcessed = msg.toString();
    console.log(colors.magenta("Received data:", dataToBeProcessed));

    // TODO Add logic to check if this was already processed

    // TODO Add logic to process the data

    // get the prompt form reciver cpontract
    console.log("dataToBeProcessed: " + dataToBeProcessed);
    const parsedData = dataToBeProcessed;
    console.log(dataToBeProcessed.data);
    console.log(JSON.stringify(parsedData));
    if (parsedData.data) {
      console.log("data" + parsedData.data);
      console.log(parsedData.data.promptCallbackID);
      console.log(parsedData.data.callbackAddress);
      if (parsedData.type === "createOpenAiLlmCall") {
        const message = await getMessages(
          parsedData.data.promptCallbackID,
          parsedData.data.callbackAddress
        );
        console.log("messgae :" + message);
        console.log(`typeof message` + message);
        const openAIResponse = await callOpenAI(
          message,
          parsedData.data.config
        );
        console.log(openAIResponse);
        await sendResponseToOracle(
          parseInt(parsedData.data.promptId),
          parseInt(parsedData.data.promptCallbackID),
          openAIResponse.response,
          openAIResponse.error
        );
      }
    }

    // await getMessages(
    //   dataToBeProcessed?.promptCallbackID,
    //   dataToBeProcessed?.callbackAddress
    // );

    // TODO: Call getMessageHistory() view from the contract
    // console.log("Response:", response);

    // TODO: Call getOpenAIResponse()
    // const response = await getOpenAIResponse(parsedData.data[0].greeting);

    // TODO: Call callback()
    // await callback(response);

    await theseus.send("done");
  }
})();
