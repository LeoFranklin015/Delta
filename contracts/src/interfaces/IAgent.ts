import { openAIResponse } from "./IOracle";
import { NearPromise } from "near-sdk-js";
export interface IAgent {
  onOracleOpenAiLlmResponse({
    runId,
    response,
    errorMessage,
  }: {
    runId: number;
    response: openAIResponse;
    errorMessage: string;
  }): void;

  onOracleFunctionResponse({
    runId,
    response,
    errorMessage,
  }: {
    runId: number;
    response: string;
    errorMessage: string;
  }): NearPromise;

  getMessageHistory({ chatId }: { chatId: number }): any;
}
