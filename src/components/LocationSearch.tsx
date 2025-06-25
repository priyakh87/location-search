import { useState, useEffect, useMemo } from "react";
import Map from "./Map";
import WikiData from "../types/WikiData";
import WikiPage from "../types/WikiPage";
import WeatherCard from "./WeatherCard";
import LocationOverview from "./LocationOverview";
import { fetchDirections } from "../api/DirectionService";
import DirectionsPanel from "./DirectionsPanel";

function LocationSearch() {
  const [routeCoords, setRouteCoords] = useState<number[][]>([]);
  const [routeSteps, setRouteSteps] = useState<any[]>([]);
  const [routeSummary, setRouteSummary] = useState<{
    duration: number;
    distance: number;
  } | null>(null);

  const [term, setTerm] = useState("");
  const [results, setResults] = useState<WikiData[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<WikiData | null>(null);
  const apiKey = import.meta.env.VITE_OPENCAGE_API_KEY;
  const [searchResults, setSearchResults] = useState<boolean>(true); // Fix destructuring
  const [directionsMode, setDirectionsMode] = useState(false);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [originCoords, setOriginCoords] = useState<[number, number] | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);
  const [directionsError, setDirectionsError] = useState<string | null>(null);
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
      console.log("Formatted results:", formattedResults[0]); // Debug log
      const res = formattedResults.filter(
        (place) => place.latitude !== 0 && place.longitude !== 0
      );
      console.log("Filtered results:", res[0]); // Debug log

      setSelectedPlace(null); // Clear selected place on new search
      setResults(res.length > 0 ? [res[0]] : [defaultLocation]);
      setTerm("");
      setSearchResults(true); // Show results after a new search
      console.log(res);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("An error occurred while searching. Please try again.");
    }
  };


  const handlePlaceClick = async (place: WikiData) => {
    if (!place.title) {
      alert("Cannot fetch details for the user's current location.");
      return;
    }

    setSelectedPlace(place);
    setResults([place]);
    setSearchResults(false);

    if (
      selectedPlace &&
      selectedPlace.longitude !== place.longitude &&
      selectedPlace.latitude !== place.latitude
    ) {
      try {
        const route = await fetchDirections(
          [selectedPlace.longitude, selectedPlace.latitude],
          [place.longitude, place.latitude],
        );
        setRouteCoords(route.coordinates);
        console.log("Route coordinates:", route.coordinates, routeCoords); // Debug log
        
        setRouteSteps(route.steps);
        setRouteSummary(route.summary);
      } catch (err) {
        console.error("Error fetching directions", err);
        setRouteCoords([]);
        setRouteSteps([]);
        setRouteSummary(null);
      }
    }
  };

  // Helper to geocode a place name to coordinates
  const geocodePlace = async (place: string): Promise<[number, number] | null> => {
    try {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(place)}&key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      const result = data.results?.[0];
      if (result) {
        return [result.geometry.lng, result.geometry.lat];
      }
    } catch (e) {
      console.log("Error geocoding place:", e);
      
    }
    return null;
  };

  // Handle directions form submit
  const handleDirectionsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRouteCoords([]);
    setRouteSteps([]);
    setRouteSummary(null);
    setDirectionsError("");
    const [from, to] = await Promise.all([geocodePlace(origin), geocodePlace(destination)]);
    setOriginCoords(from);
    setDestinationCoords(to);

    if (from && to) {
      try {
        const route = await fetchDirections(from, to);
        setRouteCoords(route.coordinates);
        setRouteSteps(route.steps);
        setRouteSummary(route.summary);
        setDirectionsError("");
      } catch (err: any) {
        setDirectionsError(err.message);
        setRouteCoords([]);
        setRouteSteps([]);
        setRouteSummary(null);
        // alert(`Error fetching directions: ${err.message}`);
      }
    } else {
      setDirectionsError("Could not find one or both locations. Please check your input.");
    }
  };

  // Add a useEffect to monitor changes in `results`
  useEffect(() => {
    console.log("Results updated:", results.length, results); // Debug log
  }, [results]);

  return (
    <div className='grid grid-cols-12'>
      <div className='col-span-12 md:col-span-3 bg-gray-200 '>
        <div className='p-4 bg-gray-100 '>
          {!directionsMode && (
            <>
              <form
                className='max-w-md  bg-white shadow-md rounded-lg p-4'
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
              <div className='dir-btn-section mt-4'>
                <button
                  className='bg-blue-500 text-white font-bold py-2 px-4 rounded'
                  onClick={() => setDirectionsMode(true)}
                  type='button'>
                  Directions
                </button>
              </div>
            </>
          )}
          {directionsMode && (
            <form
              className='max-w-md mx-auto bg-white shadow-md rounded-lg p-4'
              onSubmit={handleDirectionsSubmit}>
              <label className='block mb-2 text-sm font-medium text-gray-900'>
                Origin
              </label>
              <input
                className='block w-full mb-4 p-2 border border-gray-300 rounded'
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder='Enter origin'
                required
              />
              <label className='block mb-2 text-sm font-medium text-gray-900'>
                Destination
              </label>
              <input
                className='block w-full mb-4 p-2 border border-gray-300 rounded'
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder='Enter destination'
                required
              />
              <button
                className='bg-blue-500 text-white font-bold py-2 px-4 rounded'
                type='submit'>
                Get Directions
              </button>
              <button
                className='ml-2 bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded'
                type='button'
                onClick={() => {
                  setDirectionsMode(false);
                  setRouteCoords([]);
                  setRouteSteps([]);
                  setRouteSummary(null);
                  setOrigin("");
                  setDestination("");
                }}>
                Cancel
              </button>
            </form>
          )}

          {!directionsMode && searchResults && results.length > 0 && (
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
        {!directionsMode && selectedPlace && (
          <>
            <WeatherCard place={selectedPlace} />
            <LocationOverview place={selectedPlace} />
          </>
        )}

        {directionsError && (
          <div
            className='flex items-center bg-red-100 border border-red-400 text-red-700 px-4 py-4 rounded relative m-4'
            role='alert'>
            <svg
              className='fill-current w-5 h-5 mr-2 text-red-500'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'>
              <title>Error</title>
              <path d='M18.364 17.364A9 9 0 1 1 2.636 2.636a9 9 0 0 1 15.728 14.728zM10 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z' />
            </svg>
            <span className='block'>{directionsError}</span>
            <button
              type='button'
              className='absolute top-0 bottom-0 right-0 px-4 py-3'
              onClick={() => setDirectionsError("")}>
              <span className='text-2xl text-red-700'>&times;</span>
            </button>
          </div>
        )}
        <div>
          
          {directionsMode && routeSteps.length > 0 && routeSummary && (
            <DirectionsPanel
              steps={routeSteps}
              summary={routeSummary}
              originName={origin}
              destinationName={destination}
            />
          )}
        </div>
      </div>
      <div className='col-span-12 md:col-span-9'>
        {!directionsMode && selectedPlace && !searchResults && (
          <Map
            selectedPlace={selectedPlace}
            setSelectedPlace={setSelectedPlace}
          />
        )}
        {!directionsMode && searchResults && results.length > 0 && (
          <Map
            selectedPlace={results[0]}
            setSelectedPlace={setSelectedPlace}
            places={results}
          />
        )}
        {directionsMode && originCoords && destinationCoords && (
          <Map
            selectedPlace={{
              title: destination,
              description: "Destination",
              longitude: destinationCoords[0],
              latitude: destinationCoords[1],
            }}
            setSelectedPlace={() => {}}
            places={[]}
            routeLine={routeCoords}
          />
        )}
      </div>

      {/* {!directionsMode && routeSteps.length > 0 && routeSummary && (
        <DirectionsPanel
          steps={routeSteps}
          summary={routeSummary}
        />
      )} */}
    </div>
  );
}

export default LocationSearch;
