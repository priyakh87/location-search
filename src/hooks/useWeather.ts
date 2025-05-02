import { useEffect, useState } from "react";

export interface WeatherData {
    temperature: number;
    description: string;
    icon: string;
    time: string;
    city?: string;
}

export function useWeather(lat: number, lon: number) {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const weatherApiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

                if (!weatherApiKey) {
                    console.error("API Key is missing. Please check your environment variables.");
                    throw new Error("Missing OpenWeather API key. Please check your environment variables.");
                }
                if (!lat || !lon) {
                    console.error("Latitude and longitude are required.");
                    throw new Error("Latitude and longitude are required.");
                }

                const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric`;
                console.log("Fetching weather data from:", weatherApiUrl);

                const weatherRes = await fetch(weatherApiUrl);

                if (!weatherRes.ok) {
                    if (weatherRes.status === 401) {
                        console.error("Unauthorized: Invalid API key.");
                        throw new Error("Unauthorized: Invalid OpenWeather API key.");
                    }
                    throw new Error(`Weather API error: ${weatherRes.statusText}`);
                }

                const weatherData = await weatherRes.json();
                console.log("Weather data:", weatherData);

                const localTime = new Intl.DateTimeFormat("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                }).format(new Date());

                const descriptionMap: Record<string, string> = {
                    Clear: "Sunny",
                    Clouds: "Cloudy",
                    Rain: "Rainy",
                    Drizzle: "Drizzle",
                    Thunderstorm: "Stormy",
                    Snow: "Snowy",
                    Mist: "Misty",
                    Smoke: "Smoky",
                    Haze: "Hazy",
                    Dust: "Dusty",
                    Fog: "Foggy",
                    Sand: "Sandy",
                    Ash: "Ashy",
                    Squall: "Windy",
                    Tornado: "Tornado",
                };
                // Map the raw description to a more human-readable format
                const rawDesc = weatherData.weather[0].main;
        const humanDesc = descriptionMap[rawDesc] || rawDesc;

                setWeather({
                    temperature: Math.round(weatherData.main.temp),
                    description: humanDesc,
                    icon: weatherData.weather[0].icon,
                    time: localTime,
                    city: weatherData.name,
                });
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error("Error fetching data:", error.message);

                    if (error.message.includes("Failed to fetch")) {
                        setError("Network error: Unable to connect to the server. Please try again later.");
                    } else {
                        setError(error.message);
                    }
                } else {
                    console.error("Unknown error:", error);
                    setError("An unknown error occurred while fetching weather data.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, [lat, lon]);

    return { weather, error, loading };
}