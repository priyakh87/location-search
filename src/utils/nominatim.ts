export const fetchNominatimData = async (placeName: string) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&polygon_geojson=1&q=${encodeURIComponent(placeName)}`;
    try {
        const fetchResponse = await fetch(url, {
            headers: {
                "User-Agent": "locationSearch/1.0 (priyakh87@gmail.com)", // Required by Nominatim TOS
              },
        });
        const data = await fetchResponse.json();
        if (data.length > 0 && data[0].geojson && typeof data[0].geojson === 'object') {
            return {
              type: "Feature",
              geometry: data[0].geojson,
              properties: { name: data[0].display_name },
            };
          }
        return null;
    } catch (error) {
        console.error("Error fetching Nominatim data:", error);
        return null;
    }
    }
