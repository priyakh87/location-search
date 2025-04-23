import React from 'react';

const MapComponent = () => {
  return (
    <div className="relative h-screen w-screen">
      {/* Search Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-3/4 max-w-xl">
        <input
          type="text"
          placeholder="Search for a location"
          className="w-full p-3 rounded-lg shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Map Container */}
      <div className="h-full w-full bg-gray-200">
        {/* Replace this div with your map implementation */}
        <div className="h-full w-full flex items-center justify-center text-gray-500">
          Map goes here
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
