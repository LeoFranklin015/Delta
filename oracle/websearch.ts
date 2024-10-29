import axios from "axios";
import dotenv from "dotenv";

// Define settings and API key

dotenv.config();
const settings = {
  SERPER_API_KEY: process.env.SERPER_API_KEY,
};

// Define the WebSearchResult type
interface WebSearchResult {
  result: string;
  error: string;
}

// Async function to execute the search query
export async function websearch(query: string): Promise<WebSearchResult> {
  try {
    const response = await axios.post(
      "https://google.serper.dev/search",
      { q: query }, // Payload
      {
        headers: {
          "X-API-KEY": settings.SERPER_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    // Check if the response contains the "organic" field
    const data = response.data;
    const result = JSON.stringify(data.organic);

    // Return the result
    return {
      result: result,
      error: "",
    };
  } catch (error: any) {
    // Handle errors and return an error object
    return {
      result: "",
      error: error.message,
    };
  }
}
