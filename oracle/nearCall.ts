import * as nearAPI from "near-api-js";
import dotenv from "dotenv";
const { Near, Account, keyStores, KeyPair } = nearAPI;
dotenv.config();

const accountId = "leofrank.testnet";
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error("PRIVATE_KEY is not defined in the environment variables");
}

const contractId = "leorocks.testnet";

const keyStore = new keyStores.InMemoryKeyStore();
keyStore.setKey(
  "testnet",
  accountId,
  KeyPair.fromString(privateKey as nearAPI.utils.KeyPairString)
);

console.log("Near Chain Signature (NCS) call details:");
console.log("Near accountId", accountId);
console.log("NCS contractId", contractId);

const config = {
  networkId: "testnet",
  keyStore: keyStore,
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://testnet.mynearwallet.com/",
  helperUrl: "https://helper.testnet.near.org",
  explorerUrl: "https://testnet.nearblocks.io",
};
export const near = new Near(config);
export const account = new Account(near.connection, accountId);

export async function callback(response: string) {
  const args = {
    greeting: response,
  };

  console.log("this may take approx. 30 seconds to complete");
  console.log(args);

  let res: nearAPI.providers.FinalExecutionOutcome;
  try {
    res = await account.functionCall({
      contractId,
      methodName: "set_greeting",
      args: args,
      gas: BigInt(300000000000000),
    });
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
}
