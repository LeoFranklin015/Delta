import { websearch } from "../websearch";

export const tools = async (functionName: string, functionArgs: any) => {
  switch (functionName) {
    case "webSearch": {
      const web_response = await websearch(functionArgs.query);
      console.log(web_response);
      if (web_response) {
        const response = {
          response: web_response,
          error: "",
        };
        return response;
      } else {
        const response = {
          response: "",
          error: "Error in websearch",
        };
        return response;
      }
    }
  }
};
