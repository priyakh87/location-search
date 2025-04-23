import { useState, useEffect } from "react";
import type { Place } from "./api/Place";
import LocationSearch from "./components/LocationSearch";
import Map from "./components/Map";

function App() {
  const [place, setPlace] = useState<Place | null>(null);

  useEffect(() => {
    // Trigger any side effects or updates when place changes
    console.log("Place updated:", place);
  }, [place]);

  const handlePlaceClick = (p: Place | null) => {
    if (p) {
      setPlace(p);
    } else {
      console.warn("Received null or invalid place");
    }
  };

  return <div className="h-screen w-screen grid grid-cols-12 p-1">
    <div className="col-span-3 p-2 ">
      <LocationSearch onPlaceClick={handlePlaceClick} />
    </div>
    <div className="col-span-9 p-2 ">
      <Map selectedPlace={place} key={place?.id || "default"} />
    </div>
  </div>
}

export default App;