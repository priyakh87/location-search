import axios from 'axios';

const API_URL = 'http://localhost:5000/api/places';

export const getPlaces = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching places:', error);
    throw error;
  }
};

export const getPlaceById = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching place with ID ${id}:`, error);
    throw error;
  }
};

export const addLocationHistory = async (id: string, history: { longitude: number; latitude: number; timestamp: string }) => {
  try {
    const response = await axios.post(`${API_URL}/${id}/locationHistory`, history);
    return response.data;
  } catch (error) {
    console.error(`Error adding location history for ID ${id}:`, error);
    throw error;
  }
};

export const addFavoriteLocation = async (id: string, favorite: { longitude: number; latitude: number; name: string }) => {
  try {
    const response = await axios.post(`${API_URL}/${id}/favoriteLocations`, favorite);
    return response.data;
  } catch (error) {
    console.error(`Error adding favorite location for ID ${id}:`, error);
    throw error;
  }
};
