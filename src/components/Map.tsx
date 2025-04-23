import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
// import L from "leaflet";
import type { Place } from "../api/Place";

interface MapProps {
  selectedPlace: Place | null;
}

function Map({ selectedPlace }: MapProps) {
  const mapCenter: [number, number] = selectedPlace
    ? [selectedPlace.latitude, selectedPlace.longitude]
    : [37.7749, -122.4194]; // Default coordinates

  const MapUpdater = () => {
    const map = useMap(); // Access the map instance
    useEffect(() => {
      if (selectedPlace) {
        map.setView([selectedPlace.latitude, selectedPlace.longitude], 10); // Update map view
      }
    }, [selectedPlace, map]); // Re-run when selectedPlace changes
    return null;
  };

  return (
    <>
      <MapContainer
        center={mapCenter}
        zoom={10}
        style={{ height: "400px", width: "100%" }}
      >
        <MapUpdater /> {/* Component to handle map updates */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {selectedPlace && (
          <Marker position={[selectedPlace.latitude, selectedPlace.longitude]}>
            <Popup>{selectedPlace.name}</Popup>
          </Marker>
        )}
      </MapContainer>
    </>
  );
}

export default Map;
