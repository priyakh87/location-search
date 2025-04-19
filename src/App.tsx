
import { useState } from "react";
import type { Place } from "./api/Place";
import LocationSearch from "./components/LocationSearch";
import Map from "./components/Map";

function App() {

  const [place, setPlace] = useState<Place | null>(null);

  return <div className="h-screen w-screen grid grid-cols-12 p-1">
    <div className="col-span-3 p-2 ">
      <LocationSearch onPlaceClick={(p)=>setPlace(p)} />
      
    </div>
    <div className="col-span-9 p-2 ">
    <Map place={place}/>
    </div>

  </div>
}

export default App