export interface Place {
  id: string; // Ensure the id property is defined
  name: string;
  longitude: number;
  latitude: number;
  locationHistory: { longitude: number; latitude: number; timestamp: string }[]; // Array of historical locations
  favoriteLocations: { longitude: number; latitude: number; name: string }[]; // Array of favorite locations
}
