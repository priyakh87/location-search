import { useEffect, useState } from "react";
import { fetchWikiSummary } from "../api/wiki";
import WikiData from "../types/WikiData";

interface Props {
  place: WikiData;
}

const LocationOverview: React.FC<Props> = ({ place }) => {
  const [summary, setSummary] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    if (!place) return;
    fetchWikiSummary(place.title)
      .then((data) => {
        setSummary(data.summary);
        setImage(data.thumbnail );
        setUrl(data.url);
      })
      .catch(() => {
        setSummary("No overview available.");
        setImage(null);
        setUrl("");
      });
  }, [place]);

  return (
    <div className='bg-white rounded-lg shadow-md p-4 my-4'>
      <h2 className='text-lg font-bold mb-2'>{place.title}</h2>
      <p className='text-sm text-gray-600 mb-2'>{place.description}</p>
      {image && (
        <img src={place.thumbnail} alt={place.title} className='w-32 mb-2' />
      )}
      <p className='text-sm'>{summary}</p>
      {url && (
        <a
          href={url}
          target='_blank'
          rel='noopener noreferrer'
          className='text-blue-500 underline text-xs'>
          Read more on Wikipedia
        </a>
      )}
    </div>
  );
};

export default LocationOverview;
