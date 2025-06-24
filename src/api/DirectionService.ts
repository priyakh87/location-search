// DirectionService.ts
// This service fetches directions from the OpenRouteService API.
// It handles errors gracefully and returns structured route data.
const ORS_KEY = import.meta.env.VITE_ORS_API_KEY;
const ORS_URL = import.meta.env.VITE_ORS_API_URL;
export async function fetchDirections(
  from: [number, number],
  to: [number, number]
) {
  const url = ORS_URL;
  const apiKey = ORS_KEY;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: [from, to],
      }),
    });

    // Handle HTTP errors
    if (!response.ok) {
      let errorMsg = "Unable to fetch directions. Please try again.";
      try {
        const errorData = await response.json();
        if (
          errorData.error &&
          errorData.error.message &&
          errorData.error.message.includes("exceed the server configuration limits")
        ) {
          errorMsg =
            "The route distance is too long. Please choose locations closer together.";
        } else if (errorData.error && errorData.error.message) {
          errorMsg = errorData.error.message;
        }
      } catch {
        // ignore JSON parse errors
      }
      throw new Error(errorMsg);
    }

    // Parse and return route data
    const data = await response.json();
    console.log("Route data:", data);
    
    // You may need to adapt this to your API's response structure
    return {
      coordinates: data.routes[0].geometry.coordinates,
      steps: data.routes[0].segments[0].steps,
      summary: data.routes[0].summary[0],
    };
  } catch (err: any) {
    // Rethrow with a user-friendly message
    throw new Error(err.message || "Unable to fetch directions. Please try again.");
  }
}
