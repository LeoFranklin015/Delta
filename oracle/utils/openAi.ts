import axios from "axios";

import dotenv from "dotenv";

dotenv.config();

export async function callOpenAI(messgae: any, config: any): Promise<string> {
  const decodedValue = formatDecodedMessages(messgae);
  const messages = formattedMessages(decodedValue);
  console.log(decodedValue);
  console.log(messages);
  try {
    // Initial call to OpenAI using Axios
    const initialResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",

        messages: messages,
        max_tokens: 150,
        tools: [],
        tool_choice: "",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const initialMessage = initialResponse.data.choices[0].message;
    console.log(initialMessage.content);
    return initialMessage.content || "No response generated.";
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return "An error occurred while processing your request.";
  }
}

const formattedMessages = (messages: any) => {
  return messages.map((message: any) => ({
    role: message.role,
    content: message.content.value.message,
  }));
};

function formatDecodedMessages(decodedValue : any) {
  let parsedMessages;

  // Parse the JSON string into an array
  try {
    parsedMessages = JSON.parse(decodedValue);
  } catch (error) {
    console.error("Invalid JSON format:", error);
    return [];
  }
}
