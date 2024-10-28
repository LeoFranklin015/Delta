import {
  NearBindgen,
  near,
  call,
  view,
  LookupMap,
  assert,
  NearPromise,
  PromiseIndex,
} from "near-sdk-js";
import { AccountId } from "near-sdk-js";
import {
  openAIRequest,
  openAIResponse,
  Message,
  Content,
} from "./interfaces/IOracle";

const THIRTY_TGAS = BigInt("30000000000000");

interface AgentRun {
  owner: AccountId;
  messages: Message[];
  responseCount: number;
  maxIterations: number;
  isFinished: boolean;
}

@NearBindgen({})

// @title Agent
// @notice This contract interacts with teeML oracle to run agents that perform multiple iterations of querying and respond
class Agent {
  public prompt: string;

  // @notice Mapping from run ID to AgentRun
  public agentRuns: LookupMap<AgentRun> = new LookupMap<AgentRun>("agentRuns");
  public agentRunsCount: number = 0;

  // @notice Address of the contract owner
  private owner: AccountId;

  // @notice Address of the oracle contract
  public oracleAddress: AccountId;

  // @notice Configuration for the OpenAI request
  private config: openAIRequest;

  constructor(initialOracleAddress: AccountId, initialPrompt: string) {
    this.owner = near.predecessorAccountId();
    this.oracleAddress = initialOracleAddress;
    this.prompt = initialPrompt;

    this.config = {
      model: "gpt-4-turbo-preview",
      frequencyPenalty: 21, // > 20 for null
      logitBias: "", // empty str for null
      maxTokens: 1000, // 0 for null
      presencePenalty: 21, // > 20 for null
      responseFormat: '{"type":"text"}',
      seed: 0, // null
      stop: "", // null
      temperature: 10, // Example temperature (scaled up, 10 means 1.0), > 20 means null
      topP: 101, // Percentage 0-100, > 100 means null
      tools:
        '[{"type":"function","function":{"name":"web_search","description":"Search the internet","parameters":{"type":"object","properties":{"query":{"type":"string","description":"Search query"}},"required":["query"]}}},{"type":"function","function":{"name":"image_generation","description":"Generates an image using Dalle-2","parameters":{"type":"object","properties":{"prompt":{"type":"string","description":"Dalle-2 prompt to generate an image"}},"required":["prompt"]}}}]',
      toolChoice: "auto", // "none" or "auto"
      user: "", // null
    };
  }

  // @notice Ensures the caller is the contract owner
  private onlyOwner(): void {
    assert(near.predecessorAccountId() == this.owner, "Caller is not owner");
  }

  // @notice Ensures the caller is the oracle contract
  private onlyOracle(): void {
    assert(
      near.predecessorAccountId() == this.oracleAddress,
      "Caller is not oracle"
    );
  }

  @call({})
  setOracleAddress(newOracleAddress: AccountId): void {
    this.onlyOwner();
    this.oracleAddress = newOracleAddress;
    near.log("Oracle address set to: " + newOracleAddress);
  }

  @call({})
  runAgent(query: string, maxIterations: number): NearPromise {
    const run: AgentRun = {
      owner: near.predecessorAccountId(),
      messages: [],
      responseCount: 0,
      maxIterations: maxIterations,
      isFinished: false,
    };

    const systemPrompt = this.createTextMessage("system", this.prompt);
    run.messages.push(systemPrompt);

    const userPrompt = this.createTextMessage("user", query);
    run.messages.push(userPrompt);

    const currentRunId = this.agentRunsCount;
    this.agentRunsCount += 1;

    this.agentRuns.set(currentRunId.toString(), run);

    const promise = NearPromise.new(this.oracleAddress)
      .functionCall(
        "createOpenAiLlmCall",
        JSON.stringify({
          promptId: currentRunId,
          request: this.config,
        }),
        BigInt(0),
        THIRTY_TGAS
      )
      .then(
        NearPromise.new(near.currentAccountId()).functionCall(
          "openAiLlmCallback",
          JSON.stringify({
            runId: currentRunId,
          }),
          BigInt(0),
          THIRTY_TGAS
        )
      );
    return promise.asReturn();
  }

  // openAiLlmCallback
  @call({})
  openAiLlmCallback(runId: number): any {
    let { result, success } = promiseResult();

    if (success) {
      near.log("Promise succeeded for runId: " + runId.toString());
      return result;
    } else {
      near.log("Promise failed...");
      return "";
    }
  }

  // @notice Handles the response from the oracle for an OpenAI LLM call
  // @param runId The ID of the agent run
  // @param response The response from the oracle
  // @param errorMessage Any error message
  // @dev Called by teeML oracle
  @call({})
  onOracleOpenAiLlmResponse(
    runId: number,
    response: openAIResponse,
    errorMessage: string
  ): void {
    this.onlyOracle();
    const run = this.agentRuns.get(runId.toString());

    if (errorMessage != "") {
      const newMessage = this.createTextMessage("assistant", errorMessage);
      run.messages.push(newMessage);
      run.responseCount++;
      run.isFinished = true;
      this.agentRuns.set(runId.toString(), run);
      near.log("Error message: " + errorMessage);
      return;
    }

    if (run.responseCount >= run.maxIterations) {
      run.isFinished = true;
      this.agentRuns.set(runId.toString(), run);
      return;
    }

    if (response.content != "") {
      const newMessage = this.createTextMessage("assistant", response.content);
      run.messages.push(newMessage);
      run.responseCount++;
      this.agentRuns.set(runId.toString(), run);
    }

    if (response.functionName != "") {
      NearPromise.new(this.oracleAddress).functionCall(
        "createFunctionCall",
        JSON.stringify({
          functionCallbackId: runId,
          functionType: response.functionName,
          functionInput: response.functionArguments,
        }),
        BigInt(0),
        THIRTY_TGAS
      );
    }

    run.isFinished = true;
    this.agentRuns.set(runId.toString(), run);
  }

  //FunctionCall Callback
  @call({})
  functionCallCallback(runId: number): any {
    let { result, success } = promiseResult();

    if (success) {
      near.log("Promise succeeded FunctionCall for runId: " + runId.toString());
      return result;
    } else {
      near.log("Promise failed...");
      return "";
    }
  }

  // @notice Handles the response from the oracle for a function call
  // @param runId The ID of the agent run
  // @param response The response from the oracle
  // @param errorMessage Any error message
  // @dev Called by teeML oracle

  @call({})
  onOracleFunctionResponse(
    runId: number,
    response: string,
    errorMessage: string
  ): void {
    this.onlyOracle();
    const run = this.agentRuns.get(runId.toString());

    let result = response;
    if (errorMessage != "") {
      result = errorMessage;
    }

    const newMessage = this.createTextMessage("user", result);
    run.messages.push(newMessage);
    run.responseCount++;
    this.agentRuns.set(runId.toString(), run);
    NearPromise.new(this.oracleAddress)
      .functionCall(
        "createOpenAiLlmCall",
        JSON.stringify({
          promptId: runId,
          request: this.config,
        }),
        BigInt(0),
        THIRTY_TGAS
      )
      .then(
        NearPromise.new(near.currentAccountId()).functionCall(
          "openAiLlmCallback",
          JSON.stringify({
            runId: runId,
          }),
          BigInt(0),
          THIRTY_TGAS
        )
      );
  }

  // @notice Retrieves the message history for a given agent run
  // @param agentId The ID of the agent run
  // @return An array of messages
  // @dev Called by teeML oracle

  public getMessageHistory(agentId: number): Message[] {
    const run = this.agentRuns.get(agentId.toString());
    return run.messages;
  }

  public isRunFinished(agentId: number): boolean {
    const run = this.agentRuns.get(agentId.toString());
    return run.isFinished;
  }

  // @notice Creates a text message with the given role and content
  // @param role The role of the message
  // @param content The content of the message
  // @return The created message
  private createTextMessage(role: string, content: string): Message {
    const newContent: Content = {
      contentType: "text",
      value: content,
    };
    const newMessage = {
      role: role,
      content: [...[newContent]],
    };

    return newMessage;
  }

  //View functions for helping with testing
  @view({})
  public getAgentRun(agentId: number): AgentRun {
    return this.agentRuns.get(agentId.toString());
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
