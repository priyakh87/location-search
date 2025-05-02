import React from "react";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { fetchWikiSummary } from "../api/wiki";

interface WikiData {
  title: string;
  description: string;
  thumbnail?: string;
  longitude: number;
  latitude: number;
  zoomLevel?: number; // Add zoomLevel property
}

interface MapProps {
  selectedPlace: WikiData | null;
  setSelectedPlace: (place: WikiData) => void;
}

const customIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const Map: React.FC<MapProps> = ({ selectedPlace }) => {
  const defaultCityZoom = 6; // Default zoom for cities
  const defaultPlaceZoom = 12; // Default zoom for specific places

  const mapCenter: [number, number] = selectedPlace
    ? [selectedPlace.longitude, selectedPlace.latitude]
    : [37.7749, -122.4194]; // Default coordinates

  const [wikiData, setWikiData] = useState<{ summary: string; url: string; image: string | null } | null>(null);

  useEffect(() => {
    if (selectedPlace) {
      fetchWikiSummary(selectedPlace.title)
        .then((data) => {
          const image = data.thumbnail ? data.thumbnail : ''; // Safely access thumbnail
          setWikiData({ summary: data.summary, url: data.url, image });
        })
        .catch((error) => {
          console.error("Error fetching Wikipedia data:", error); // Improved error logging
        });
    } else {
      setWikiData(null);
    }
  }, [selectedPlace]);

  const MapUpdater = () => {
    const map = useMap();
    useEffect(() => {
      if (selectedPlace) {
        const zoom = selectedPlace.zoomLevel || (selectedPlace.description.includes("city") ? defaultCityZoom : defaultPlaceZoom);
        map.setView([selectedPlace.latitude, selectedPlace.longitude], zoom); // Dynamically set zoom level
      }
    }, [map, selectedPlace]);
    return null;
  };

  if (!selectedPlace) {
    return <div className="mt-6 text-center">Select a place to view on the map.</div>;
  }

  return (
    <div className="mt-6 h-screen w-screen overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={selectedPlace?.zoomLevel || defaultCityZoom} // Initial zoom level
        style={{ height: "100%", width: "100%" }}
      >
        <MapUpdater />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {selectedPlace && (
          <Marker position={[selectedPlace.latitude, selectedPlace.longitude]} icon={customIcon}>
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
                <p>{selectedPlace ? "Loading Wikipedia data..." : "No place selected"}</p>
              )}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default Map;
