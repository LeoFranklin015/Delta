import { openAIResponse } from "./IOracle";

export interface ISimpleGpt {
  onOracleOpenAiLlmResponse({
    runId,
    response,
    errorMessage,
  }: {
    runId: number;
    response: openAIResponse;
    errorMessage: string;
  }): void;

  getMessageHistory({ chatId }: { chatId: number }): any;
}
