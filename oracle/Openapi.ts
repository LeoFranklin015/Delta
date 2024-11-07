import axios from "axios";
import { websearch } from "./websearch";
import dotenv from "dotenv";
import {
  getCurrentForecast,
  getWeatherForecast,
  predictWeather,
} from "./utils/weatherData";

dotenv.config();

export async function getOpenAIResponse(prompt: string): Promise<any> {
  try {
    console.log("Input prompt:", prompt);

    // Initial call to OpenAI using Axios
    const initialResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",

      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a weather agent , who will analyse the weather data and provide the information , in general , you will be given a reason why they need fund for and their lat and lang , you will use the predictWeather tool and analyze the weather data and the final answer you provide must be either true or false, nothing else . IF true the reason he stated is valid , if not provide false ",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 150,
        tools: [
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
                    description:
                      "The location to search for the weather details",
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
              description:
                "to verify the correctness of the weather data , call the currweather function",
              parameters: {
                type: "object",
                properties: {
                  location: {
                    type: "string",
                    description:
                      "The location to search for the weather details",
                  },
                },
                required: ["location"],
              },
            },
          },
        ],
        tool_choice: "auto",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const initialMessage = initialResponse.data.choices[0].message;
    console.log(initialMessage);

    if (initialMessage.tool_calls) {
      const toolCall = initialMessage.tool_calls[0];
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      if (functionName === "currentWeather") {
        console.log("createWeather function called");
        const searchResult = await getCurrentForecast(functionArgs.location);

        console.log(searchResult);
        // Call OpenAI again with the search results using Axios

        const finalResponse = await axios.post(
          "https://api.openai.com/v1/chat/completions",

          {
            model: "gpt-3.5-turbo",

            messages: [
              {
                role: "system",
                content:
                  "You are a weather agent , who will analyse the weather data and provide the information , in general , you will be given a reason why they need fund for and their lat and lang , you will use the predictWeather tool and analyze the weather data and the final answer you provide must be either true or false, nothing else . IF true the reason he stated is valid , if not provide false ",
              },
              { role: "user", content: prompt },
              initialMessage,
              {
                role: "tool",
                content: JSON.stringify(searchResult),
                tool_call_id: toolCall.id,
              },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log(finalResponse.data.choices[0].message.content);
        const finalContent =
          finalResponse.data.choices[0].message.content ||
          "No response generated.";

        const response = {
          id: finalResponse.data.id,
          content: finalResponse.data.choices[0].message.content,
          functionName:
            (finalResponse.data.choices[0].message.tool_calls &&
              finalResponse.data.choices[0].message.tool_calls[0].function
                .name) ||
            "",
          functionArguments:
            (finalResponse.data.choices[0].message.tool_calls &&
              finalResponse.data.choices[0].message.tool_calls[0].function
                .arguments) ||
            "",
          created: finalResponse.data.created,
          model: finalResponse.data.model,
          systemFingerprint: finalResponse.data.systemFingerprint,
          object: finalResponse.data.object,
          completionTokens: finalResponse.data.usage.completionTokens,
          promptTokens: finalResponse.data.usage.promptTokens,
          totalTokens: finalResponse.data.usage.totalTokens,
        };
        const error = "";
        return {
          response,
          error,
        };
      } else if (functionName === "predictWeather") {
        console.log("createWeather function called");
        const searchResult = await getCurrentForecast(functionArgs.location);

        console.log(searchResult);
        // Call OpenAI again with the search results using Axios

        const finalResponse = await axios.post(
          "https://api.openai.com/v1/chat/completions",

          {
            model: "gpt-3.5-turbo",

            messages: [
              {
                role: "system",
                content:
                  "You are a weather agent , who will analyse the weather data and provide the information , in general , you will be given a reason why they need fund for and their lat and lang , you will use the predictWeather tool and analyze the weather data and the final answer you provide must be either true or false, nothing else . IF true the reason he stated is valid , if not provide false ",
              },
              { role: "user", content: prompt },
              initialMessage,
              {
                role: "tool",
                content: JSON.stringify(searchResult),
                tool_call_id: toolCall.id,
              },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log(finalResponse.data.choices[0].message.content);
        const finalContent =
          finalResponse.data.choices[0].message.content ||
          "No response generated.";

        const response = {
          id: finalResponse.data.id,
          content: finalResponse.data.choices[0].message.content,
          functionName:
            (finalResponse.data.choices[0].message.tool_calls &&
              finalResponse.data.choices[0].message.tool_calls[0].function
                .name) ||
            "",
          functionArguments:
            (finalResponse.data.choices[0].message.tool_calls &&
              finalResponse.data.choices[0].message.tool_calls[0].function
                .arguments) ||
            "",
          created: finalResponse.data.created,
          model: finalResponse.data.model,
          systemFingerprint: finalResponse.data.systemFingerprint,
          object: finalResponse.data.object,
          completionTokens: finalResponse.data.usage.completionTokens,
          promptTokens: finalResponse.data.usage.promptTokens,
          totalTokens: finalResponse.data.usage.totalTokens,
        };
        const error = "";
        return {
          response,
          error,
        };
      }
    }
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return {
      response: "",
      error,
    };
  }
}

// getOpenAIResponse(
//   "It was stated true for whether it would rain today. Check with the current weather data to cross verify whether it has really rainned or not"
// );
