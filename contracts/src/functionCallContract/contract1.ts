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

const THIRTY_TGAS = BigInt("30000000000000");

interface ChatRun {
  owner: AccountId;
  messages: Message[];
  messagesCount: number;
}
@NearBindgen({})
class ChatGPTFunctionCall {
  public owner: AccountId;
  public chatRuns: LookupMap<ChatRun> = new LookupMap<ChatRun>("chatRuns");
  public chatRunsCount: number = 0;
  public oracleAddress: AccountId;
  public config: openAIRequest;

  constructor() {
    this.owner = near.predecessorAccountId();
    this.oracleAddress = "oracletest2.testnet";

    this.config = {
      model: "gpt-4-turbo-preview",
      frequencyPenalty: 0.0,
      logitBias: "",
      maxTokens: 1000,
      presencePenalty: 0.0,
      responseFormat: '{"type":"text"}',
      seed: 0,
      stop: "",
      temperature: 0.7,
      topP: 1,
      tools: "",
      toolChoice: "none",
      user: "",
    };
  }

  @initialize({})
  init(): void {
    this.owner = near.predecessorAccountId();
    this.oracleAddress = "oracletest2.testnet";

    this.config = {
      model: "gpt-4-turbo-preview",
      frequencyPenalty: 0.0,
      logitBias: "",
      maxTokens: 1000,
      presencePenalty: 0.0,
      responseFormat: '{"type":"text"}',
      seed: 0,
      stop: "",
      temperature: 0.7,
      topP: 1,
      tools: "",
      toolChoice: "none",
      user: "",
    };
  }

  // @notice Ensures the caller is the contract owner
  private onlyOwner(): void {
    assert(near.predecessorAccountId() === this.owner, "Caller is not owner");
  }

  // @notice Ensures the caller is the oracle contract
  private onlyOracle(): void {
    assert(
      near.predecessorAccountId() === this.oracleAddress,
      "Caller is not oracle"
    );
  }

  @call({})
  setOracleAddress(newOracleAddress: AccountId): void {
    this.onlyOwner();
    this.oracleAddress = newOracleAddress;
  }

  // @notice Starts a new chat
  // @param message The initial message to start the chat with
  // @return The ID of the newly created chat
  @call({})
  startChat(message: string): NearPromise {
    const run: ChatRun = {
      owner: near.predecessorAccountId(),
      messages: [],
      messagesCount: 0,
    };

    const newMessage = this.createTextMessage("user", message);
    run.messages.push(newMessage);
    run.messagesCount = 1;

    const currentId = this.chatRunsCount;
    this.chatRuns.set(currentId.toString(), run);
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
          JSON.stringify({}),
          BigInt(0),
          THIRTY_TGAS
        )
      );
    return promise.asReturn();
  }

  // Test
  @call({ privateFunction: true })
  startChat_callback(): any {
    let { result, success } = promiseResult();

    if (success) {
      return result;
    } else {
      near.log("Promise failed...");
      return "";
    }
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
  }): void {
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
      const newMessage = this.createTextMessage("assistant", response.content);
      run.messages.push(newMessage);
      run.messagesCount++;
      this.chatRuns.set(runId.toString(), run);
    }
  }

  // @notice Adds a new message to an existing chat run
  // @param message The new message to add
  // @param runId The ID of the chat run
  @call({})
  addMessage(message: string, runId: number): void {
    const run = this.chatRuns.get(runId.toString());
    assert(run, "Chat run not found");
    assert(
      run.messages[run.messagesCount - 1].role === "assistant",
      "No response to previous message"
    );
    assert(
      run.owner === near.predecessorAccountId(),
      "Only chat owner can add messages"
    );

    const newMessage = this.createTextMessage("user", message);
    run.messages.push(newMessage);
    run.messagesCount++;

    NearPromise.new(this.oracleAddress).functionCall(
      "createOpenAiLlmCall",
      JSON.stringify({
        promptCallbackID: runId,
        request: this.config,
      }),
      BigInt(0),
      THIRTY_TGAS
    );
  }

  // @notice Retrieves the message history of a chat run
  // @param chatId The ID of the chat run
  // @return An array of messages
  @view({})
  getMessageHistory({ chatId }: { chatId: number }): any {
    const run = this.chatRuns.get(chatId.toString());
    near.log(JSON.stringify(run));
    assert(run, "Chat run not found");
    return run.messages;
  }

  // @notice Creates a text message with the given role and content
  // @param role The role of the message
  // @param content The content of the message
  // @return The created message
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
