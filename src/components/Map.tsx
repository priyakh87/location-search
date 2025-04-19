import "leaflet/dist/leaflet.css";
import type { Place } from "../api/Place";
import type { Map as LeafletMap } from "leaflet";
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";

interface MapProps {
  place: Place | null;
}

import { useMap } from 'react-leaflet';

function FlyToLocation({ place }: { place: Place }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([place.latitude, place.longitude]);
  }, [place]);

  return null;
}

function Map({ place }: MapProps) {
    const mapRef = useRef<LeafletMap | null>(null);
    
    useEffect(() => {
        if (mapRef.current && place) {
            mapRef.current.flyTo([place.latitude, place.longitude]);
     }   
    },[place])
  return (
    <MapContainer
          ref={mapRef}
          center={[place?.latitude??25.276987,place?.longitude??55.29624]}
      zoom={12}
      scrollWheelZoom
      className='h-full'>
        
      <TileLayer url="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {place && <FlyToLocation place={place} /> && <Marker position={[place?.latitude??25.276987,place?.longitude??55.29624]} />}
      
    </MapContainer>
  );
}

export default Map;
