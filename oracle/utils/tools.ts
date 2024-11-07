import { websearch } from "../websearch";
import {
  getCurrentForecast,
  getWeatherForecast,
  predictWeather,
} from "./weatherData";

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
    case "predictWeather": {
      console.log("weather");
      const weather_response = await getWeatherForecast(
        JSON.parse(functionArgs).location,
        JSON.parse(functionArgs).day
      );
      console.log(weather_response);
      if (weather_response.forecastData) {
        return {
          response: weather_response.forecastData,
          error: "",
        };
      } else {
        return {
          response: "",
          error: "Error in predictWeather",
        };
      }
    }
    case "currentWeather": {
      console.log("current weather");
      const current_weather_response = await getCurrentForecast(
        JSON.parse(functionArgs).location
      );
      console.log(current_weather_response);
      if (current_weather_response.forecastData) {
        return {
          response: current_weather_response.forecastData,
          error: "",
        };
      } else {
        return {
          response: "",
          error: "Error in currentWeather",
        };
      }
    }
    default: {
      return {
        response: "",
        error: "Function not found",
      };
    }
  }
};
