import { useState, useEffect, useMemo } from "react";
import Map from "./Map";
import WikiData from "../types/WikiData";
import WikiPage from "../types/WikiPage";
import WeatherCard from "./WeatherCard";



function LocationSearch() {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<WikiData[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<WikiData | null>(null);
  const apiKey = import.meta.env.VITE_OPENCAGE_API_KEY;

  // Default location (UAE)
  const defaultLocation = useMemo(
    () => ({
      title: "United Arab Emirates",
      description: "Default location: UAE",
      longitude: 54.366669,
      latitude: 24.466667,
    }),
    [],
  );

  useEffect(() => {
    const getLocation = () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          try {
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKey}`,
            );
            const data = await response.json();

            const components = data.results?.[0]?.components || {};
            const locationName =
              components.city ||
              components.town ||
              components.village ||
              components.country;

            if (locationName) {
              const userLocation: WikiData = {
                title: locationName,
                description: "This is your current location.",
                longitude: lon,
                latitude: lat,
              };
              setSelectedPlace(userLocation);
            } else {
              setSelectedPlace(defaultLocation);
              console.log("Fallback: No location name. Default set to UAE.");
            }
          } catch (err) {
            console.error("Error during reverse geocoding:", err);
            setSelectedPlace(defaultLocation);
          }
        },
        (error) => {
          console.warn(
            "Geolocation permission denied or failed:",
            error.message,
          );
          setSelectedPlace(defaultLocation);
        },
        { timeout: 7000 }, // optional
      );
    };

    getLocation();
  }, [apiKey, defaultLocation]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=coordinates|pageimages|description&generator=search&gsrsearch=${term}&gsrlimit=5&piprop=thumbnail&pithumbsize=100`,
      );
      const data = await response.json();

      const pages: Record<string, WikiPage> = data.query?.pages || {};
      const formattedResults = Object.values(pages).map((page) => ({
        page: page,
        title: page.title,
        description: page.description || "No description available",
        thumbnail: page.thumbnail?.source || "", // Ensure thumbnail is optional
        latitude: page.coordinates?.[0]?.lat || 0,
        longitude: page.coordinates?.[0]?.lon || 0, // Fix: Use the first element of the array
      }));
      console.log("Formatted results:", formattedResults); // Debug log
      const res = formattedResults.filter(
        (place) => place.latitude !== 0 && place.longitude !== 0,
      );
      setResults(res);
      console.log(res);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("An error occurred while searching. Please try again.");
    }
  };

  const handlePlaceClick = (place: WikiData) => {
    console.log("Place clicked:", place); // Debug log

    if (!place.title) {
      alert("Cannot fetch details for the user's current location.");
      return;
    }
    setSelectedPlace(place);
    setResults([]); // Clear results after selection
    console.log("Selected place:", place); // Debug log
  };

  return (
    <div className='grid grid-cols-12'>
      <div className='col-span-12 md:col-span-3 bg-gray-200 '>
        <div className='p-4 bg-gray-100 '>
          <form
            className='max-w-md mx-auto bg-white shadow-md rounded-lg p-4'
            onSubmit={handleSubmit}>
            <label
              htmlFor='term'
              className='mb-2 text-sm font-medium text-gray-900 sr-only'>
              Search
            </label>
            <div className='relative'>
              <input
                id='term'
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className='block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50'
                placeholder='Search...'
                required
              />
            </div>
          </form>

          {results.length > 0 && (
            <>
              <h1 className='font-bold mt-6 text-lg'>Search Results</h1>
              <div className='grid gap-4 mt-4'>
                {results.map((place, index) => (
                  <div
                    key={index}
                    className='bg-white shadow-md rounded-lg p-4 flex items-center'>
                    {place.thumbnail && (
                      <img
                        src={place.thumbnail}
                        alt={place.title}
                        className='w-16 h-16 rounded mr-4'
                      />
                    )}
                    <div className='flex-1'>
                      <h2 className='text-sm font-bold'>{place.title}</h2>
                      <p className='text-xs text-gray-600'>
                        {place.description}
                      </p>
                    </div>
                    <button
                      className='bg-blue-500 text-sm text-white font-bold py-1 px-2 rounded'
                      onClick={() => handlePlaceClick(place)}>
                      Go
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        {selectedPlace && <WeatherCard place={selectedPlace} />}

      </div>
      <div className='col-span-12 md:col-span-9'>
        {selectedPlace && (
          <Map
            selectedPlace={selectedPlace}
            setSelectedPlace={setSelectedPlace}
          />
        )}
      </div>
    </div>
  );
}

export default LocationSearch;
