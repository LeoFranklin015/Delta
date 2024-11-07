import axios from "axios";

import dotenv from "dotenv";
import { tools } from "./tools";

dotenv.config();

export async function callOpenAI(message: any[], config: any): Promise<any> {
  try {
    // Initial call to OpenAI using Axios
    const requestBody: any = {
      model: "gpt-3.5-turbo",
      messages: message,
      max_tokens: 150,
    };

    if (config.tools && config.tools.length > 0) {
      // requestBody.tools = JSON.parse(config.tools);
      requestBody.tools = [
        {
          type: "function",
          function: {
            name: "predictWeather",
            description: "Search the web for weather forecast",
            parameters: {
              type: "object",
              properties: {
                location: {
                  type: "string",
                  description: "The location to search for the weather details",
                },
                day: {
                  type: "number",
                  description: "the number of days ahead to search",
                },
              },
              required: ["location", "day"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "currentWeather",
            description: "Search for the current weather data",
            parameters: {
              type: "object",
              properties: {
                location: {
                  type: "string",
                  description: "The location to search for the weather details",
                },
              },
              required: ["location"],
            },
          },
        },
      ];
      requestBody.tool_choice = "auto";
    }

    const initialResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(JSON.stringify(initialResponse.data));

    const response = {
      id: initialResponse.data.id,
      content: initialResponse.data.choices[0].message.content,
      functionName:
        (initialResponse.data.choices[0].message.tool_calls &&
          initialResponse.data.choices[0].message.tool_calls[0].function
            .name) ||
        "",
      functionArguments:
        (initialResponse.data.choices[0].message.tool_calls &&
          initialResponse.data.choices[0].message.tool_calls[0].function
            .arguments) ||
        "",
      created: initialResponse.data.created,
      model: initialResponse.data.model,
      systemFingerprint: initialResponse.data.systemFingerprint,
      object: initialResponse.data.object,
      completionTokens: initialResponse.data.usage.completionTokens,
      promptTokens: initialResponse.data.usage.promptTokens,
      totalTokens: initialResponse.data.usage.totalTokens,
    };
    const error = "";
    return {
      response,
      error,
    };
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return {
      response: "",
      error,
    };
  }
}
