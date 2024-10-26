export class openAIRequest {
  // "gpt-4-turbo", "gpt-4-turbo-preview" or "gpt-3.5-turbo-1106"
  model: string;
  // int -20 - 20, Mapped to float -2.0 - 2.0. If bigger than 20 then null
  frequencyPenalty: number;
  // JSON string or empty string
  logitBias: string;
  // 0 for null
  maxTokens: number;
  // int -20 - 20, Mapped to float -2.0 - 2.0. If bigger than 20 then null
  presencePenalty: number;
  // JSON string or empty string
  responseFormat: string;
  // 0 for null
  seed: number;
  // empty str for null
  stop: string;
  // 0-20, > 20 for null
  temperature: number;
  // 0-100  percentage, > 100 for null
  topP: number;
  // JSON list for tools in OpenAI format, empty for null, names have to match the supported tools
  tools: string;
  // "none", "auto" or empty str which defaults to auto on OpenAI side
  toolChoice: string;

  user: string;
}

export class openAIResponse {
  id: string;

  // either content is an empty str or functionName and functionArguments
  content: string;
  functionName: string;
  functionArguments: string;

  created: number;
  model: string;
  systemFingerprint: string;
  // kind of pointless since its always "chat.completion"?
  object: string;

  completionTokens: number;
  promptTokens: number;
  totalTokens: number;
}

export interface IOracle {
  createOpenAiLlmCall(promptId: number, request: openAIRequest): number;
  createFunctionCall(
    functionCallbackId: number,
    functionType: string,
    functionInput: string
  ): number;
}

export interface Content {
  contentType: string;
  value: string;
}

export interface Message {
  role: string;
  content: Content[];
}
