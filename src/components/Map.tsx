import React from "react";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { fetchNominatimData } from "../utils/nominatim";
import MarkerClusterGroup from "react-leaflet-cluster";

interface MapProps {
  selectedPlace: WikiData | null;
  setSelectedPlace: (place: WikiData) => void;
  places?: WikiData[];
  routeLine?: number[][];
  directionsMode?: boolean; // <-- Add this prop
  originName?: string; // <-- Add originName prop
  destinationName?: string; // <-- Add destinationName prop
  originCoords?: [number, number]; // <-- Add originCoords prop
  destinationCoords?: [number, number]; // <-- Add destinationCoords prop
}

interface WikiData {
  title: string;
  description: string;
  thumbnail?: string;
  longitude: number;
  latitude: number;
  zoomLevel?: number;
}

const customIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const Map: React.FC<MapProps> = ({
  selectedPlace,
  setSelectedPlace,
  places = [],
  routeLine,
  directionsMode = false, // <-- default to false
  originName,
  destinationName,
  originCoords,
  destinationCoords,
}) => {
  const defaultCityZoom = 10; // Default zoom for cities
  const defaultPlaceZoom = 12; // Default zoom for specific places

  const mapCenter: [number, number] = selectedPlace
    ? [selectedPlace.latitude, selectedPlace.longitude] // Corrected order
    : [37.7749, -122.4194]; // Default coordinates

  const [boundaryGeoJson, setBoundaryGeoJson] = useState<GeoJSON.Feature | null>(null);
  const [isLoading, setIsLoading] = useState(false); // State to track loading status
  const [nearbyHospitals, setNearbyHospitals] = useState<WikiData[]>([]);
  const [famousLocations, setFamousLocations] = useState<WikiData[]>([]);

  const keyWordList = ['city','capital','town','small town','big town','village','region','province','state','district','municipality','borough','county','emirate','country','territory','island'];
  const isSearchedLocation= keyWordList.some((place)=>selectedPlace?.description.toLowerCase().includes(place));

  useEffect(() => {
    if (!selectedPlace) {
      setBoundaryGeoJson(null);
      setIsLoading(false); // Stop loading if no place is selected
      return;
    }

    setIsLoading(true); // Start loading when fetching data

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

  // Fetch nearby hospitals using Nominatim
  useEffect(() => {
    if (!selectedPlace) {
      setNearbyHospitals([]);
      return;
    }
    const fetchHospitals = async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=hospital&limit=10&bounded=1&viewbox=${selectedPlace.longitude-0.1},${selectedPlace.latitude+0.1},${selectedPlace.longitude+0.1},${selectedPlace.latitude-0.1}`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
        const data = await res.json();
        setNearbyHospitals(
          data.map((item: {
            display_name: string;
            lon: string;
            lat: string;
          }) => ({
            title: item.display_name?.split(",")[0] || "Hospital",
            description: "Hospital",
            longitude: parseFloat(item.lon),
            latitude: parseFloat(item.lat),
          }))
        );
      } catch {
        setNearbyHospitals([]);
      }
    };
    fetchHospitals();
  }, [selectedPlace]);

  // Fetch famous locations using Wikipedia GeoSearch
  useEffect(() => {
    if (!selectedPlace) {
      setFamousLocations([]);
      return;
    }
    const fetchFamous = async () => {
      try {
        const url = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${selectedPlace.latitude}|${selectedPlace.longitude}&gsradius=2000&gslimit=10&format=json&origin=*`;
        const res = await fetch(url);
        const data = await res.json();
        setFamousLocations(
          (data.query?.geosearch || []).map((item: {
            title: string;
            lon: number;
            lat: number;
          }) => ({
            title: item.title,
            description: "Famous Location",
            longitude: item.lon,
            latitude: item.lat,
          }))
        );
      } catch {
        setFamousLocations([]);
      }
    };
    fetchFamous();
  }, [selectedPlace]);

  // Add a state to control MapUpdater execution
  const [shouldUpdateMap, setShouldUpdateMap] = useState(false);

  // Listen for routeLine changes to trigger MapUpdater only in directions mode
  useEffect(() => {
    if (routeLine && routeLine.length > 1) {
      setShouldUpdateMap(true);
    } else {
      setShouldUpdateMap(false);
    }
  }, [routeLine]);

  const MapUpdater = () => {
    const map = useMap();
    useEffect(() => {
      // Only run when shouldUpdateMap is true (i.e., directions mode)
      if (!shouldUpdateMap) return;
      if (!selectedPlace) return;

      if (boundaryGeoJson) {
        const layer = L.geoJSON(boundaryGeoJson);
        map.fitBounds(layer.getBounds());
      } else if (routeLine && routeLine.length > 1) {
        // Fit map to route polyline bounds
        const latlngs = routeLine.map(([lng, lat]) => [lat, lng]);
        const bounds = L.latLngBounds(latlngs);
        map.fitBounds(bounds, { padding: [50, 50] });
      } else {
        const zoom = selectedPlace.zoomLevel || (selectedPlace.description.includes("city") ? defaultCityZoom : defaultPlaceZoom);
        map.setView([selectedPlace.latitude, selectedPlace.longitude], zoom);
      }
      // Only log when updating due to directions
      if (shouldUpdateMap) {
        console.log("Map updated for directions/route.");
      }
    }, [map, boundaryGeoJson, routeLine, shouldUpdateMap]);

    return null;
  };

  // Use all places if provided, otherwise just the selectedPlace
  const markers = places.length > 0 ? places : selectedPlace ? [selectedPlace] : [];

  // Only render map if:
  // - directionsMode is true and routeLine is present (directions mode)
  // - OR directionsMode is false and selectedPlace is present (normal mode)
  if (
    (directionsMode && !(routeLine && routeLine.length > 1)) ||
    (!directionsMode && !selectedPlace)
  ) {
    return <div className="mt-6 text-center">Select a place to view on the map.</div>;
  }

  // If directions mode, set mapCenter to the center of the routeLine
  let mapCenterToUse: [number, number];
  if (directionsMode && routeLine && routeLine.length > 1) {
    const lats = routeLine.map(([lng, lat]) => lat);
    const lngs = routeLine.map(([lng, lat]) => lng);
    const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
    mapCenterToUse = [avgLat, avgLng];
  } else {
    mapCenterToUse = selectedPlace
      ? [selectedPlace.latitude, selectedPlace.longitude]
      : [37.7749, -122.4194];
  }

  return (
    <div className="mt-6 h-screen w-screen overflow-hidden">
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-white bg-opacity-75 z-50">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <MapContainer
        center={mapCenterToUse}
        zoom={selectedPlace?.zoomLevel || 10}
        style={{ height: "100%", width: "100%" }}
      >
        {/* Only render MapUpdater if shouldUpdateMap is true */}
        {shouldUpdateMap && <MapUpdater />}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MarkerClusterGroup>
          {/* Main/places markers */}
          {markers.map((place, idx) => (
            <Marker
              key={`main-${idx}`}
              position={[place.latitude, place.longitude]}
              icon={customIcon}
              eventHandlers={{
                click: () => setSelectedPlace(place),
              }}
            >
              <Popup>
                <strong>{place.title}</strong>
                <p>{place.description}</p>
              </Popup>
            </Marker>
          ))}
          {/* Hospital markers */}
          {nearbyHospitals.map((place, idx) => (
            <Marker
              key={`hospital-${idx}`}
              position={[place.latitude, place.longitude]}
              icon={L.icon({
                iconUrl: "https://cdn-icons-png.flaticon.com/512/2965/2965567.png",
                iconSize: [25, 25],
                iconAnchor: [12, 24],
                popupAnchor: [1, -24],
              })}
            >
              <Popup>
                <strong>{place.title}</strong>
                <p>Hospital</p>
              </Popup>
            </Marker>
          ))}
          {/* Famous location markers */}
          {famousLocations.map((place, idx) => (
            <Marker
              key={`famous-${idx}`}
              position={[place.latitude, place.longitude]}
              icon={L.icon({
                iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
                iconSize: [25, 25],
                iconAnchor: [12, 24],
                popupAnchor: [1, -24],
              })}
            >
              <Popup>
                <strong>{place.title}</strong>
                <p>Famous Location</p>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
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
        {/* Show route polyline if directionsMode is on and routeLine exists */}
        {directionsMode && routeLine && routeLine.length > 1 && (
          <>
            <Polyline
              positions={routeLine.map(([lng, lat]) => [lat, lng])}
              pathOptions={{ color: "red", weight: 5 }}
            />
            {/* Origin Marker */}
            {originCoords && (
              <Marker position={[originCoords[1], originCoords[0]]}>
                <Popup>
                  <b>Start:</b> {originName}
                </Popup>
              </Marker>
            )}
            {/* Destination Marker */}
            {destinationCoords && (
              <Marker position={[destinationCoords[1], destinationCoords[0]]}>
                <Popup>
                  <b>End:</b> {destinationName}
                </Popup>
              </Marker>
            )}
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default Map;
