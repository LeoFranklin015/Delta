import { websearch } from "../websearch";

export const tools = async (functionName: string, functionArgs: any) => {
  switch (functionName) {
    case "websearch": {
      const web_response = await websearch(JSON.parse(functionArgs).query);
      console.log(web_response);
      if (web_response) {
        return {
          response: web_response.result,
          error: "",
        };
      } else {
        return {
          response: "",
          error: "Error in websearch",
        };
      }
      break;
    }
    default: {
      return {
        response: "",
        error: "Function not found",
      };
    }
  }
};
