import * as nearAPI from "near-api-js";
import { account } from "../nearCall";

export const sendFunctionResponse = async (
  functionId: number,
  functionCallbackId: number,
  response: any,
  error: string
) => {
  const args = {
    functionId,
    functionCallbackId,
    response,
    error,
  };
  let res: nearAPI.providers.FinalExecutionOutcome;
  try {
    res = await account.functionCall({
      contractId: "oracletest2.testnet",
      methodName: "addFunctionResponse",
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
