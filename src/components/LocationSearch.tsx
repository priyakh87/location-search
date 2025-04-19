import { Fragment, useState } from "react";
import type { Place } from "../api/Place";
import { Search } from "../api/Search";

interface LocationSearchProps {
  onPlaceClick: (place: Place) => void;
}

function LocationSearch({ onPlaceClick }: LocationSearchProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [term, setTerm] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const results = await Search(term);
    console.log(results, "location search");
    if (results) {
      setPlaces(results);
    }
  };
  return (
    <div>
      {/* <form onSubmit={handleSubmit}>
        <label className='font-bold' htmlFor='term'>
         {" "}
        </label>
        <input
          className='border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 px-4 py-2 w-full'
          id='term'
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
          </form> */}
          
<form className="max-w-md mx-auto" onSubmit={handleSubmit}>   
    <label htmlFor="term" className="mb-2 text-sm font-medium text-gray-900 sr-only light:text-white">Search</label>
    <div className="relative">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500 light:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
        </div>
        <input id='term'
          value={term}
          onChange={(e) => setTerm(e.target.value)} className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 light:bg-gray-700 light:border-gray-600 light:placeholder-gray-400 light:text-white light:focus:ring-blue-500 light:focus:border-blue-500" placeholder="Search..." required />
        {/* <button type="submit" className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 light:bg-blue-600 light:hover:bg-blue-700 light:focus:ring-blue-800">Search</button> */}
    </div>
</form>

      <h1 className='font-bold mt-6'>Found Locations</h1>
      <div className='grid grid-cols-[1fr,40px] gap-2 mt-2 items-center'>
        {places.map((place) => {
          return (
            <Fragment key={place.id}>
              <p className='text-sm'>{place.name}</p>
              <button
                className='bg-blue-500 text-sm text-whilte font-bold py-1 px-1 rounded'
                onClick={() => onPlaceClick(place)}>
                Go
                  </button>
                  <div className="border-b w-full col-span-2" />
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default LocationSearch;
