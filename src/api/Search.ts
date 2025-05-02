import type { Place } from "./Place";

interface SearchResponse{
    features: {
        geometry: {
            coordinates: number[];
        }
        properties: {
            place_id: number;
            display_name:string
        }
    }
}


export const Search = async (term: string) => {
    const res=await fetch(`https://nominatim.openstreetmap.org/search?q=${term}&format=geojson&addressdetails=1&layer=address&limit=5`)
    const data:SearchResponse = await res.json(); 
    console.log(data, "data search");
    if(data.features instanceof Array){
        const places: Place[] = data.features.map((feature) => {
       
            return {
                id: feature.properties.place_id,
                title: feature.properties.display_name,
                longitude:feature.geometry.coordinates[0],
                latitude: feature.geometry.coordinates[1],
                description: feature.properties.display_name,
                zoomLevel: 12,
                thumbnail: "",
                wikiUrl: "",
                summary: "",
                wikiImage: "",

            }
        })
    
        return places;
    }


}