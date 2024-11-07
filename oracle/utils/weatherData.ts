import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();
const settings = {
  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY,
  WEATHER_API_KEY: process.env.WEATHER_API_KEY,
};

// Define the WeatherResult type
interface WeatherResult {
  weatherData: any;
  error: string;
}

// Async function to fetch weather data
export async function getWeatherData(
  lat: number,
  lon: number
): Promise<WeatherResult> {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/3.0/onecall`,
      {
        params: {
          lat: lat,
          lon: lon,
          appid: settings.OPENWEATHER_API_KEY,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Convert the response data to a string
    const weatherData = JSON.stringify(response.data);

    // Return the weather data
    return {
      weatherData: weatherData,
      error: "",
    };
  } catch (error: any) {
    // Handle errors and return an error object
    return {
      weatherData: "",
      error: error.message,
    };
  }
}

export async function predictWeather(
  lat: number,
  lon: number,
  cnt: number
): Promise<WeatherResult> {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast/daily`,
      {
        params: {
          lat: lat,
          lon: lon,
          cnt: cnt,
          appid: settings.OPENWEATHER_API_KEY,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Convert the response data to a string
    const forecastData = JSON.stringify(response.data);
    console.log(forecastData);
    // Return the forecast data
    return {
      weatherData: forecastData,
      error: "",
    };
  } catch (error: any) {
    // Handle errors and return an error object
    return {
      weatherData: "",
      error: error.message,
    };
  }
}

// Define the ForecastResult type
interface ForecastResult {
  forecastData: any;
  error: string;
}

// Async function to fetch the weather forecast
export async function getWeatherForecast(
  location: string,
  days: number
): Promise<ForecastResult> {
  try {
    const response = await axios.get(
      `http://api.weatherapi.com/v1/forecast.json`,
      {
        params: {
          key: settings.WEATHER_API_KEY,
          q: location,
          days: days,
          aqi: "no",
          alerts: "yes",
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Convert the response data to a string
    const forecastData = JSON.stringify(
      response.data.forecast.forecastday[days - 1].day
    );

    // Return the forecast data
    return {
      forecastData: forecastData,
      error: "",
    };
  } catch (error: any) {
    // Handle errors and return an error object
    return {
      forecastData: "",
      error: error.message,
    };
  }
}

export async function getCurrentForecast(
  location: string
): Promise<ForecastResult> {
  try {
    const response = await axios.get(
      `http://api.weatherapi.com/v1/current.json`,
      {
        params: {
          key: settings.WEATHER_API_KEY,
          q: location,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Convert the response data to a string
    const forecastData = JSON.stringify(response.data.current);

    // Return the forecast data
    return {
      forecastData: forecastData,
      error: "",
    };
  } catch (error: any) {
    // Handle errors and return an error object
    return {
      forecastData: "",
      error: error.message,
    };
  }
}
