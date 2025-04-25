import axios from "axios";

export async function fetchWikiSummary(placeName: string): Promise<{ summary: string; url: string; thumbnail: string | null }> {
  console.log(placeName,"nanananwifi");
  
  const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(placeName)}`;
    try {
      console.log(apiUrl,"nananawifi");
      
    const response = await axios.get(apiUrl);
    const { extract, content_urls, thumbnail } = response.data;
    return {
      summary: extract,
      url: content_urls.desktop.page,
      thumbnail: thumbnail || null, // Ensure thumbnail is included
    };
  } catch (error) {
    console.error("Error fetching Wikipedia data:", error);
    throw new Error("Failed to fetch Wikipedia data");
  }
}
