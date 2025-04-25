import React from "react";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { fetchWikiSummary } from "../api/wiki";

interface WikiData {
  title: string;
  description: string;
  thumbnail?: string;
  longitude: number;
  latitude: number;
}

interface MapProps {
  selectedPlace: WikiData | null;
}

const Map: React.FC<MapProps> = ({ selectedPlace }) => {
  const mapCenter: [number, number] = selectedPlace
    ? [selectedPlace.longitude, selectedPlace.latitude]
    : [37.7749, -122.4194]; // Default coordinates

  const [wikiData, setWikiData] = useState<{ summary: string; url: string; image: string | null } | null>(null);

  useEffect(() => {
    if (selectedPlace) {
      console.log("Selected place details:", selectedPlace); // Debug log to inspect selectedPlace
      console.log("Longitude:", selectedPlace.longitude, "Latitude:", selectedPlace.latitude); // Log coordinates
      fetchWikiSummary(selectedPlace.title)
        .then((data) => {
          console.log("Fetched Wikipedia data:", data); // Debug log
          const image = data.thumbnail ? data.thumbnail : ''; // Safely access thumbnail
          setWikiData({ summary: data.summary, url: data.url, image });
        })
        .catch((error) => {
          console.error("Error fetching Wikipedia data:", error); // Improved error logging
        });
    } else {
      setWikiData(null);    }
  }, [selectedPlace]); 
  const MapUpdater = () => {
    const map = useMap(); 
    useEffect(() => {
      if (selectedPlace) {
        console.log("Updating map view to:", selectedPlace.latitude, selectedPlace.longitude); // Debug log for map update
        map.setView([selectedPlace.latitude, selectedPlace.longitude], 10); // Update map view
      }
    }, [map]); // Added selectedPlace to dependency array
    return null;
  };

  if (!selectedPlace) {
    return <div className="mt-6 text-center">Select a place to view on the map.</div>;
  }

  return (
    <div className="mt-6 h-screen w-screen overflow-hidden">

      {/* <h2 className="text-lg font-bold">Map View</h2> */}
      {/* <div className="mt-4">
        <p>
          <strong>Title:</strong> {selectedPlace.title}
        </p>
        <p>
          <strong>Description:</strong> {selectedPlace.description}
        </p>
        <p>
          <strong>Coordinates:</strong> {selectedPlace.latitude}, {selectedPlace.longitude}
        </p>
      </div> */}
      <MapContainer
        center={mapCenter}
        zoom={8}
        style={{ height: "100%", width: "100%" }}
      >
        <MapUpdater /> {/* Component to handle map updates */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {selectedPlace && (
          <Marker position={[selectedPlace.latitude, selectedPlace.longitude]}>
            <Popup>
              <strong>{selectedPlace.title}</strong>
              {wikiData ? (
                <>
                  {wikiData.image && <img src={wikiData.image} alt={selectedPlace.title} style={{ width: "120px", height: "auto", marginBottom: "10px" }} />}
                  <p>{wikiData.summary}</p>
                  <a href={wikiData.url} target="_blank" rel="noopener noreferrer">
                    Read more on Wikipedia
                  </a>
                </>
              ) : (
                <p>{selectedPlace ? "Loading Wikipedia data..." : "No place selected"}</p> // Improved message
              )}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default Map;
