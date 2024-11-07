import * as nearAPI from "near-api-js";
import { account } from "../nearCall";

export const sendResponseToOracle = async (
  promptId: number,
  promptCallbackID: number,
  response: any,
  error: string
) => {
  const args = {
    promptId,
    promptCallbackID,
    response,
    error,
  };
  let res: nearAPI.providers.FinalExecutionOutcome;
  try {
    res = await account.functionCall({
      contractId: "oracletest2.testnet",
      methodName: "addOpenAiResponse",
      args: args,
      gas: BigInt(300000000000000),
    });
    console.log(res);
  } catch (e) {
    console.log(e);
    throw new Error(`error signing ${JSON.stringify(e)}`);
  }
  console.log(res);
};
