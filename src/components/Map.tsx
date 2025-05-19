import React from "react";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap,GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { fetchWikiSummary } from "../api/wiki";
import { fetchNominatimData } from "../utils/nominatim";

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
  const defaultCityZoom = 10; // Default zoom for cities
  const defaultPlaceZoom = 12; // Default zoom for specific places

  const mapCenter: [number, number] = selectedPlace
    ? [selectedPlace.latitude, selectedPlace.longitude] // Corrected order
    : [37.7749, -122.4194]; // Default coordinates

  const [wikiData, setWikiData] = useState<{ summary: string; url: string; image: string | null } | null>(null);
  const [boundaryGeoJson, setBoundaryGeoJson] = useState<GeoJSON.Feature | null>(null);
  const [isLoading, setIsLoading] = useState(false); // State to track loading status

  const keyWordList = ['city','capital','town','small town','big town','village','region','province','state','district','municipality','borough','county','emirate','country','territory','island'];
  const isSearchedLocation= keyWordList.some((place)=>selectedPlace?.description.toLowerCase().includes(place));

  useEffect(() => {
    if (!selectedPlace) {
      setWikiData(null);
      setBoundaryGeoJson(null);
      setIsLoading(false); // Stop loading if no place is selected
      return;
    }

    setIsLoading(true); // Start loading when fetching data

    // Wiki summary fetch
    fetchWikiSummary(selectedPlace.title)
      .then((data) => {
        const image = data.thumbnail ? data.thumbnail : '';
        setWikiData({ summary: data.summary, url: data.url, image });
      })
      .catch((error) => {
        console.error("Error fetching Wikipedia data:", error);
      });

    // City boundary fetch
    if(isSearchedLocation) {
      fetchNominatimData(selectedPlace.title)
        .then((boundary) => {
          if (boundary && boundary.type === "Feature") {
            setBoundaryGeoJson(boundary as GeoJSON.Feature); // Explicitly cast to GeoJSON.Feature
          } else {
            console.error("Invalid boundary data:", boundary);
            setBoundaryGeoJson(null);
          }
        })
        .catch((err) => {
          console.error("Error fetching boundary:", err);
          setBoundaryGeoJson(null);
        })
        .finally(() => setIsLoading(false)); // Stop loading after boundary fetch
    } else {
      setBoundaryGeoJson(null);
      setIsLoading(false); // Stop loading if no boundary data is fetched
    }
  }, [selectedPlace,isSearchedLocation]);

  const MapUpdater = () => {
    const map = useMap();
    useEffect(() => {
      if (!selectedPlace) return;

      if (boundaryGeoJson) {
        const layer = L.geoJSON(boundaryGeoJson);
        map.fitBounds(layer.getBounds());
      } else {
        const zoom = selectedPlace.zoomLevel || (selectedPlace.description.includes("city") ? defaultCityZoom : defaultPlaceZoom);
        map.setView([selectedPlace.latitude, selectedPlace.longitude], zoom);
      }
      console.log("Map updated to fit bounds of selected place:", selectedPlace.description);
    }, [map, selectedPlace, boundaryGeoJson]);

    return null;
  };

  if (!selectedPlace) {
    return <div className="mt-6 text-center">Select a place to view on the map.</div>;
  }

  return (
    <div className="mt-6 h-screen w-screen overflow-hidden">
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-white bg-opacity-75 z-50">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
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
        {boundaryGeoJson?.geometry && (
          <GeoJSON
            data={boundaryGeoJson}
            style={{
              color: "blue",
              weight: 2,
              fillColor: "blue",
              fillOpacity: 0.1,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default Map;
