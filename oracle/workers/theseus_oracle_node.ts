const zmq = require("zeromq");
import "dotenv/config";
var colors = require("colors");
const log = require("single-line-log").stdout;
import { getMessages } from "../utils/getMessages";
import { sendResponseToOracle } from "../utils/sendResponseOracle";
import { callOpenAI } from "../utils/openAi";
import { tools } from "../utils/tools";
import { sendFunctionResponse } from "../utils/sendFunctionResponse";

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
    let parsedData = msg.toString();
    // console.log(msg.type);
    console.log(colors.magenta("Received data:", parsedData));
    console.log(JSON.parse(parsedData).type);
    // console.log(parsedData.type);
    parsedData = JSON.parse(parsedData);

    // // TODO Add logic to check if this was already processed

    // // TODO Add logic to process the data

    // // get the prompt form reciver cpontract
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
    else if (parsedData.type == "createFunctionCall") {
      console.log(parsedData.data.functionType);
      console.log(parsedData.data.functionInput);
      const response = await tools(
        parsedData.data.functionType,
        parsedData.data.functionInput
      );

      console.log(response);
      await sendFunctionResponse(
        parseInt(parsedData.data.functionId),
        parseInt(parsedData.data.functionCallbackId),
        response.response,
        response.error
      );
    }

    await theseus.send("done");
  }
})();
