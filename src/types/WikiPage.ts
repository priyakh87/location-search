
interface WikiPage {
    title: string;
    description?: string;
    thumbnail?: { source: string };
    coordinates?: { lon: number; lat: number }[];
}
  
export default WikiPage;