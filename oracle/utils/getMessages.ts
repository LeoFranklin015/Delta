import * as nearAPI from "near-api-js";
import { account } from "../nearCall";

export const getMessages = async (chatId: number, callbackAddress: string) => {
  const args = {
    chatId: chatId,
  };
  let res: nearAPI.providers.FinalExecutionOutcome;
  try {
    res = await account.functionCall({
      contractId: callbackAddress,
      methodName: "getMessageHistory",
      args: args,
      gas: BigInt(300000000000000),
    });
    console.log(res);
  } catch (e) {
    throw new Error(`error signing ${JSON.stringify(e)}`);
  }

  // parse result into signature values we need r, s but we don't need first 2 bytes of r (y-parity)
  if ("SuccessValue" in (res.status as any)) {
    const successValue = (res.status as any).SuccessValue;
    const decodedValue = Buffer.from(successValue, "base64").toString();
    console.log("decoded value: ", decodedValue);

    return {
      decodedValue,
    };
  } else {
    throw new Error(`error signing ${JSON.stringify(res)}`);
  }
};
