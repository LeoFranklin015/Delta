import {
  NearBindgen,
  near,
  call,
  view,
  initialize,
  LookupSet,
  LookupMap,
  assert,
  NearPromise,
  PromiseIndex,
} from "near-sdk-js";
import { AccountId } from "near-sdk-js";
import { IOracle, openAIRequest, openAIResponse } from "../interfaces/IOracle";

const THIRTY_TGAS = BigInt("30000000000000");

@NearBindgen({ requireInit: true })
class Oracle implements IOracle {
  private owner: AccountId;
  private promptsCount: number;
  private functionsCount: number;
  private whitelistedAddresses: LookupSet<AccountId> = new LookupSet<AccountId>(
    "WA"
  );
  private callbackAddresses: LookupMap<AccountId> = new LookupMap<AccountId>(
    "CA"
  );

  private promptCallbackIds: LookupMap<number> = new LookupMap<number>("pCI");
  private isPromptProcessed: LookupMap<boolean> = new LookupMap<boolean>("iPP");

  // @notice Mapping of prompt ID to the OpenAI configuration
  private openAiConfigurations: LookupMap<openAIRequest> =
    new LookupMap<openAIRequest>("oAC");

  constructor() {
    this.owner = near.signerAccountId();
    this.promptsCount = 0;
    this.functionsCount = 0;
  }
  @initialize({})
  init() {
    this.owner = near.signerAccountId();
    this.promptsCount = 0;
    this.functionsCount = 0;
  }

  private onlyOwner(): void {
    assert(near.predecessorAccountId() == this.owner, "Caller is not owner");
  }

  private onlyWhitelisted(): void {
    assert(
      this.whitelistedAddresses.contains(near.predecessorAccountId()) == true,
      "Caller is not whitelisted"
    );
  }

  private promptAlreadyProcessed(promptID: number): void {
    assert(
      this.isPromptProcessed.get(promptID.toString()) == false,
      "Prompt Already processed"
    );
  }

  @call({})
  addWhitelistedAdress(addressToWhitelist: AccountId): void {
    this.onlyOwner();
    this.whitelistedAddresses.set(addressToWhitelist);
  }

  @call({})
  createOpenAiLlmCall({
    promptCallbackID,
    config,
  }: {
    promptCallbackID: number;
    config: openAIRequest;
  }): number {
    const promptId = this.promptsCount;
    this.callbackAddresses.set(
      promptId.toString(),
      near.predecessorAccountId()
    );

    this.promptCallbackIds.set(promptId.toString(), promptCallbackID);
    this.isPromptProcessed.set(promptId.toString(), false);
    this.openAiConfigurations.set(promptId.toString(), config);
    this.promptsCount += 1;
    near.log(
      JSON.stringify({
        type: "createOpenAiLlmCall",
        data: {
          promptId: promptId,
          promptCallbackID: promptCallbackID,
          config: config,
          callbackAddress: near.predecessorAccountId(),
        },
      })
    );
    return promptId;
  }

  @call({})
  addOpenAiResponse({
    promptId,
    promptCallbackID,
    response,
    error,
  }: {
    promptId: number;
    promptCallbackID: number;
    response: openAIResponse;
    error: string;
  }): NearPromise {
    // this.onlyWhitelisted();
    // this.promptAlreadyProcessed(promptId);
    this.isPromptProcessed.set(promptId.toString(), true);

    const callbackAddress = this.callbackAddresses.get(promptId.toString());
    assert(callbackAddress != null, "Callback address not found");

    const promise = NearPromise.new(callbackAddress)
      .functionCall(
        "onOracleOpenAiLlmResponse",
        JSON.stringify({
          runId: promptCallbackID,
          response: response,
          errorMessage: error,
        }),
        BigInt(0),
        THIRTY_TGAS
      )
      .then(
        NearPromise.new(near.currentAccountId()).functionCall(
          "addOpenAiResponse_callback",
          JSON.stringify({}),
          BigInt(0),
          THIRTY_TGAS
        )
      );
    near.log(
      JSON.stringify({
        type: "onOracleOpenAiLlmResponse",
        data: {
          promptId: promptId,
          promptCallbackID: promptCallbackID,
          response: response,
          error: error,
        },
      })
    );

    return promise.asReturn();
  }

  @call({ privateFunction: true })
  addOpenAiResponse_callback(): any {
    let { result, success } = promiseResult();

    if (success) {
      near.log(
        JSON.stringify({
          message: "Successfully added the response to consumer",
        })
      );
      return result;
    } else {
      near.log(
        JSON.stringify({
          message: "Failed adding the response to consumer",
        })
      );

      return "";
    }
  }

  @view({})
  getMessages(promptId: number, promptCallbackID: number): any {
    const callbackAddress = this.callbackAddresses.get(promptId.toString());
    assert(callbackAddress != null, "Callback address not found");
    const promise = NearPromise.new(callbackAddress).functionCall(
      "getMessageHistoryContents",
      JSON.stringify({}),
      BigInt(0),
      THIRTY_TGAS
    );

    return promise;
  }

  @view({})
  getRoles(promptId: number, promptCallbackID: number): any {
    const callbackAddress = this.callbackAddresses.get(promptId.toString());
    assert(callbackAddress != null, "Callback address not found");
    const promise = NearPromise.new(callbackAddress).functionCall(
      "getMessageHistoryRoles",
      JSON.stringify({}),
      BigInt(0),
      THIRTY_TGAS
    );

    return promise;
  }

  @view({})
  getMessagesAndRoles(promptId: number, promptCallbackId: number): any {
    const callbackAddress = this.callbackAddresses.get(promptId.toString());
    assert(callbackAddress != null, "Callback address not found");
    const promise = NearPromise.new(callbackAddress).functionCall(
      "getMessageHistory",
      JSON.stringify({}),
      BigInt(0),
      THIRTY_TGAS
    );

    return promise;
  }

  createFunctionCall(
    functionCallbackId: number,
    functionType: string,
    functionInput: string
  ): number {
    return 1;
  }

  @view({})
  getOwner(): AccountId {
    return this.owner;
  }

  @view({})
  getCallbackAddress(promptId: string): AccountId | null {
    return this.callbackAddresses.get(promptId);
  }

  @view({})
  getPromptCallbackId(promptId: string): number | null {
    return this.promptCallbackIds.get(promptId);
  }

  @view({})
  getIsPromptProcessed(promptId: string): boolean | null {
    return this.isPromptProcessed.get(promptId);
  }
}

function promiseResult(): { result: string; success: boolean } {
  let result, success;

  try {
    result = near.promiseResult(0 as PromiseIndex);
    success = true;
  } catch {
    result = undefined;
    success = false;
  }

  return { result, success };
}
