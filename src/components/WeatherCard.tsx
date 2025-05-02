// Removed unused import of React
import { useWeather } from "../hooks/useWeather";
import WikiData from "../types/WikiData";

export default function WeatherCard({ place }: { place: WikiData }) {
  const { weather, error, loading } = useWeather(
    place.latitude,
    place.longitude,
  );
  console.log(place.latitude, "weather");
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    <div>error:{error}</div>;
  }
  if (!weather) {
    return <div>No weather data available</div>;
  }
  // Check if weather data is available
  return (
    <div className='weather-card col-span-12 md:col-span-3 '>
      <div className='p-4'>
        <div className='grid grid-cols-12'>
          <div className='col-span-8'>
            <p className='text-xl font-bold'>{place.title}</p>
            <p className='text-600'>{place.description}</p>
            <p className='text-sm text-500'>{weather.city}</p>
          </div>
          <div className='col-span-4'>
            <div className="text-xl">
            <img
              className='w-12'
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              decoding='async'
              alt='Weather Icon'
            /></div>
            <p>{weather.description}- {weather.temperature}°C</p>
            <p>{weather.time}</p>
            
          </div>
        </div>
      </div>
    </div>
  );
}
