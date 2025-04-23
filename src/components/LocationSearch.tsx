import { Fragment, useState } from "react";
import type { Place } from "../api/Place";
import { Search } from "../api/Search";
import Map from "./Map";

interface LocationSearchProps {
  onPlaceClick: (place: Place) => void;
}

function LocationSearch({ onPlaceClick }: LocationSearchProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [term, setTerm] = useState("");
  const [history, setHistory] = useState<Place[]>([]);
  const [favorites, setFavorites] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [placeDetails, setPlaceDetails] = useState<{
    overview: string;
    reviews: string[];
    about: string;
  } | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const results = await Search(term);
      if (results) {
        setPlaces(results);
      }
    } catch (error) {
      console.error("Error during search:", error);
      alert("An error occurred while searching. Please try again.");
    }
  };

  const addToHistory = (place: Place) => {
    setHistory((prev) => [place, ...prev.filter((p) => p.id !== place.id)]);
  };

  const addToFavorites = (place: Place) => {
    setFavorites((prev) => [...prev, place]);
  };

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);
    setPlaceDetails({
      overview: "This is a sample overview of the place.",
      reviews: ["Great place!", "Loved it!", "Would visit again."],
      about: "This place is known for its scenic beauty and vibrant culture.",
    });
    onPlaceClick(place);
    addToHistory(place);
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <form className="max-w-md mx-auto bg-white shadow-md rounded-lg p-4" onSubmit={handleSubmit}>
        <label htmlFor="term" className="mb-2 text-sm font-medium text-gray-900 sr-only">Search</label>
        <div className="relative">
          <input
            id="term"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50"
            placeholder="Search..."
            required
          />
        </div>
      </form>

      {places.length > 0 && (
        <>
          <h1 className="font-bold mt-6 text-lg">Found Locations</h1>
          <div className="grid grid-cols-[1fr,40px,40px] gap-2 mt-2 items-center bg-white shadow-md rounded-lg p-4">
            {places.map((place) => (
              <Fragment key={place.id}>
                <p className="text-sm">{place.name}</p>
                <button
                  className="bg-blue-500 text-sm text-white font-bold py-1 px-1 rounded"
                  onClick={() => handlePlaceClick(place)}
                >
                  Go
                </button>
                <button
                  className="bg-green-500 text-sm text-white font-bold py-1 px-1 rounded"
                  onClick={() => addToFavorites(place)}
                >
                  Fav
                </button>
                <div className="border-b w-full col-span-3" />
              </Fragment>
            ))}
          </div>
        </>
      )}

      <Map selectedPlace={selectedPlace} />

      {selectedPlace && placeDetails && (
        <>
          <h1 className="font-bold mt-6 text-lg">Place Details</h1>
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-lg font-bold">{selectedPlace.name}</h2>
            <p className="text-sm mt-2"><strong>Overview:</strong> {placeDetails.overview}</p>
            <p className="text-sm mt-2"><strong>About:</strong> {placeDetails.about}</p>
            <h3 className="text-sm font-bold mt-4">Reviews:</h3>
            <ul className="list-disc list-inside">
              {placeDetails.reviews.map((review, index) => (
                <li key={index} className="text-sm">{review}</li>
              ))}
            </ul>
          </div>
        </>
      )}

      {history.length > 0 && (
        <>
          <h1 className="font-bold mt-6 text-lg">Recents</h1>
          <ul className="bg-white shadow-md rounded-lg p-4">
            {history.map((place, index) => (
              <li key={index} className="text-sm border-b py-1">
                {place.name}
              </li>
            ))}
          </ul>
        </>
      )}

      {favorites.length > 0 && (
        <>
          <h1 className="font-bold mt-6 text-lg">Favorites</h1>
          <ul className="bg-white shadow-md rounded-lg p-4">
            {favorites.map((place, index) => (
              <li key={index} className="text-sm border-b py-1">
                {place.name}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default LocationSearch;
