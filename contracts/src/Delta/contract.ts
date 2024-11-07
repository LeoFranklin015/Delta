import {
  NearBindgen,
  near,
  call,
  view,
  LookupMap,
  assert,
  NearPromise,
  PromiseIndex,
  initialize,
} from "near-sdk-js";
import { AccountId } from "near-sdk-js";
import { openAIRequest, openAIResponse, Message } from "../interfaces/IOracle";
import { IFunctionCall } from "../interfaces/IFunctionCall";

const THIRTY_TGAS = BigInt("30000000000000");

interface ChatRun {
  messages: Message[];
  messagesCount: number;
  address: AccountId;
}

@NearBindgen({ requireInit: true })
class FunctionCall implements IFunctionCall {
  public owner: AccountId = "";
  public amount: bigint = BigInt(0);
  public chatRuns: LookupMap<ChatRun> = new LookupMap<ChatRun>("chatRuns");
  public verifyRuns: LookupMap<ChatRun> = new LookupMap<ChatRun>("verifyRuns");
  public requests: LookupMap<string> = new LookupMap<string>("requests");
  public requestResults: LookupMap<string> = new LookupMap<string>(
    "requestResults"
  );
  public chatRunsCount: number = 0;
  public oracleAddress: AccountId = "oracletest2.testnet";
  public config: openAIRequest = {
    model: "gpt-3.5-turbo",
    frequencyPenalty: 0.0,
    logitBias: "",
    maxTokens: 1000,
    presencePenalty: 0.0,
    responseFormat: '{"type":"text"}',
    seed: 0,
    stop: "",
    temperature: 0.7,
    topP: 1,
    tools:
      '[{"type":"function","function":{"name":"predictWeather","description":"Search the web for weather forecast","parameters":{"type":"object","properties":{"location":{"type":"string","description":"The location to search for the weather details"},"day":{"type":"number","description":"the number of days ahead to search"}},"required":["location","day"]}},{"type":"function","function":{"name":"currentWeather","description":"Search for the current weather data","parameters":{"type":"object","properties":{"location":{"type":"string","description":"The location to search for the weather details"}},"required":["location"]}}}]',
    toolChoice: "auto",
    user: "",
  };

  public prompt: string =
    "You are a weather agent , who will analyse the weather data and provide the information , in general , you will be given a reason why they need fund for and their lat and lang , you will use the predictWeather tool and analyze the weather data and the final answer you provide must be either true or false, nothing else . IF true the reason he stated is valid , if not provide false ";

  @initialize({ payable: true })
  init({ oracleAddress }: { oracleAddress: AccountId }): void {
    this.owner = near.predecessorAccountId();
    this.oracleAddress = oracleAddress;
    this.amount = near.attachedDeposit();
    this.config = {
      model: "gpt-3.5-turbo",
      frequencyPenalty: 0.0,
      logitBias: "",
      maxTokens: 1000,
      presencePenalty: 0.0,
      responseFormat: '{"type":"text"}',
      seed: 0,
      stop: "",
      temperature: 0.7,
      topP: 1,
      tools:
        '[{"type":"function","function":{"name":"predictWeather","description":"Search the web for weather forecast","parameters":{"type":"object","properties":{"location":{"type":"string","description":"The location to search for the weather details"},"day":{"type":"number","description":"the number of days ahead to search"}},"required":["location","day"]}},{"type":"function","function":{"name":"currentWeather","description":"Search for the current weather data","parameters":{"type":"object","properties":{"location":{"type":"string","description":"The location to search for the weather details"}},"required":["location"]}}}]',
      toolChoice: "auto",
      user: "",
    };
  }

  private onlyOwner(): void {
    assert(near.predecessorAccountId() === this.owner, "Caller is not owner");
  }

  private onlyOracle(): void {
    assert(
      near.predecessorAccountId() === this.oracleAddress,
      "Caller is not oracle"
    );
  }

  @call({})
  setOracleAddress(oracleAddress: AccountId): void {
    this.onlyOwner();
    this.oracleAddress = oracleAddress;
  }

  @call({})
  request_Check({
    message,
    address,
  }: {
    message: string;
    address: AccountId;
  }): NearPromise {
    const run: ChatRun = {
      messages: [],
      messagesCount: 0,
      address: address,
    };

    const systemPrompt = this.createTextMessage("system", this.prompt);
    run.messages.push(systemPrompt);
    const newMessage = this.createTextMessage("user", message);
    run.messages.push(newMessage);
    run.messagesCount = 1;
    const currentId = this.chatRunsCount;
    this.chatRuns.set(currentId.toString(), run);
    this.requests.set(currentId.toString(), message);
    this.chatRunsCount += 1;
    const promise = NearPromise.new(this.oracleAddress)
      .functionCall(
        "createOpenAiLlmCall",
        JSON.stringify({
          promptCallbackID: currentId,
          config: this.config,
        }),
        BigInt(0),
        THIRTY_TGAS
      )
      .then(
        NearPromise.new(near.currentAccountId()).functionCall(
          "startChat_callback",
          JSON.stringify({ runId: currentId }),
          BigInt(0),
          THIRTY_TGAS
        )
      );
    return promise.asReturn();
  }

  @call({})
  verify_request({ id }: { id: number }): NearPromise {
    const run: ChatRun = {
      messages: [],
      messagesCount: 0,
      address: this.chatRuns.get(id.toString()).address,
    };
    const message =
      "Previously we have predicted" +
      this.requestResults.get(id.toString()) +
      "for the given request" +
      this.requests.get(id.toString()) +
      "Please verify the correctness of the prediction by checking the current weather condition";
    const newMessage = this.createTextMessage("user", message);
    run.messages.push(newMessage);
    run.messagesCount = 1;
    const currentId = this.chatRunsCount;
    this.chatRuns.set(currentId.toString(), run);
    this.requests.set(currentId.toString(), message);
    this.chatRunsCount += 1;
    const promise = NearPromise.new(this.oracleAddress)
      .functionCall(
        "createOpenAiLlmCall",
        JSON.stringify({
          promptCallbackID: currentId,
          config: this.config,
        }),
        BigInt(0),
        THIRTY_TGAS
      )
      .then(
        NearPromise.new(near.currentAccountId()).functionCall(
          "startChat_callback",
          JSON.stringify({ runId: currentId }),
          BigInt(0),
          THIRTY_TGAS
        )
      );
    return promise.asReturn();
  }

  // @notice Handles the response from the oracle for an OpenAI LLM call
  // @param runId The ID of the chat run
  // @param response The response from the oracle
  // @param errorMessage Any error message
  @call({})
  onOracleOpenAiLlmResponse({
    runId,
    response,
    errorMessage,
  }: {
    runId: number;
    response: openAIResponse;
    errorMessage: string;
  }): any {
    this.onlyOracle();
    const run = this.chatRuns.get(runId.toString());
    assert(run, "Chat run not found");

    if (run.messages[run.messagesCount - 1].role !== "user") {
      near.log("No user message to respond to");
    }

    if (errorMessage !== "") {
      const newMessage = this.createTextMessage("assistant", errorMessage);
      run.messages.push(newMessage);
      run.messagesCount++;
      this.chatRuns.set(runId.toString(), run);
    } else {
      if (response.functionName !== "") {
        const promise = NearPromise.new(this.oracleAddress)
          .functionCall(
            "createFunctionCall",
            JSON.stringify({
              functionCallbackId: runId,
              functionType: response.functionName,
              functionInput: response.functionArguments,
            }),
            BigInt(0),
            THIRTY_TGAS
          )
          .then(
            NearPromise.new(near.currentAccountId()).functionCall(
              "startChat_callback",
              JSON.stringify({ runId: runId }),
              BigInt(0),
              THIRTY_TGAS
            )
          );
        near.log("Function call created" + response.functionName);
        return promise.asReturn();
      } else {
        const newMessage = this.createTextMessage(
          "assistant",
          response.content
        );
        run.messages.push(newMessage);
        run.messagesCount++;
        this.chatRuns.set(runId.toString(), run);
        this.requestResults.set(runId.toString(), response.content);
        if (response.content == "True") {
          this.chatRuns.get(runId.toString()).address;
          NearPromise.new(this.chatRuns.get(runId.toString()).address).transfer(
            this.amount / BigInt(2)
          );
        }
      }
    }
  }

  @call({})
  onOracleFunctionResponse({
    runId,
    response,
    errorMessage,
  }: {
    runId: number;
    response: string;
    errorMessage: string;
  }): NearPromise {
    this.onlyOracle();
    const run = this.chatRuns.get(runId.toString());
    assert(run, "Chat run not found");
    if (response.length > 0) {
      const newMessage = this.createTextMessage("user", response);
      run.messages.push(newMessage);
      run.messagesCount++;
      this.chatRuns.set(runId.toString(), run);
      const promise = NearPromise.new(this.oracleAddress)
        .functionCall(
          "createOpenAiLlmCall",
          JSON.stringify({
            promptCallbackID: runId,
            config: this.config,
          }),
          BigInt(0),
          THIRTY_TGAS
        )
        .then(
          NearPromise.new(near.currentAccountId()).functionCall(
            "startChat_callback",
            JSON.stringify({ runId: runId }),
            BigInt(0),
            THIRTY_TGAS
          )
        );

      return promise.asReturn();
    }
  }

  @view({})
  getMessageHistory({ chatId }: { chatId: number }): any {
    const run = this.chatRuns.get(chatId.toString());
    near.log(JSON.stringify(run));
    assert(run, "Chat run not found");
    return run.messages;
  }

  @call({ privateFunction: true })
  startChat_callback({ runId }: { runId: number }): any {
    let { result, success } = promiseResult();

    if (success) {
      return runId;
    } else {
      near.log("Promise failed...");
      return "";
    }
  }

  private createTextMessage(role: string, content: string): Message {
    return {
      role: role,
      content: [{ contentType: "text", value: content }],
    };
  }

  @view({})
  public getChatRuns({ chatId }: { chatId: number }): any {
    return this.chatRuns.get(chatId.toString());
  }

  @view({})
  public getRequests({ requestId }: { requestId: number }): any {
    return this.requests.get(requestId.toString());
  }

  @view({})
  public getRequestResults({ requestId }: { requestId: number }): any {
    return this.requestResults.get(requestId.toString());
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
