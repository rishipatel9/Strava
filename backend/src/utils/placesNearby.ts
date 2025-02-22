const axios = require("axios");

const apiKey =process.env.GOOGLE_MAPS_API_KEY ; // Google API Key

export async function fetchNearbyPlaces(location:any, purpose:any) {
  try {
    // 🗺️ Step 1: Get Lat/Lng from Geocoding API
    const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`;
    const geoResponse = await axios.get(geoUrl);

    if (!geoResponse.data.results.length) throw new Error("Location not found");

    const { lat, lng } = geoResponse.data.results[0].geometry.location;
    console.log(`Coordinates: ${lat}, ${lng}`);

    // 📌 Step 2: Get Nearby Places from Google Places API
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=${purpose}&key=${apiKey}`;
    const placesResponse = await axios.get(placesUrl);

    if (!placesResponse.data.results.length) return { success: false, message: "No places found" };

    // 🎯 Step 3: Sort Places by Rating (Descending Order)
    let sortedPlaces = placesResponse.data.results
      .filter((place:any) => place.rating) // Remove places without a rating
      .sort((a:any, b:any) => b.rating - a.rating) // Sort by rating (high to low)
      .slice(0, 5); // Get top 5 places

    // 📝 Step 4: Fetch Reviews for Top Places
    const placesWithReviews = await Promise.all(
      sortedPlaces.map(async (place:any) => {
        const reviews = await fetchPlaceReviews(place.place_id);
        return {
          name: place.name,
          address: place.vicinity,
          rating: place.rating || "No rating",
          total_ratings: place.user_ratings_total || 0,
          place_id: place.place_id,
          reviews: reviews.slice(0, 3) // Get top 3 reviews
        };
      })
    );

    return { success: true, places: placesWithReviews };

  } catch (error:any) {
    console.error("Error:", error.message);
    return { success: false, message: error.message };
    
  }
}

// 📝 Function to Fetch Reviews from Google Place Details API
async function fetchPlaceReviews(placeId:any) {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews&key=${apiKey}`;
    const response = await axios.get(url);

    if (!response.data.result.reviews) return [];

    return response.data.result.reviews.map((review:any) => ({
      author: review.author_name,
      rating: review.rating,
      text: review.text,
      intent: "places_nearby",
      time: new Date(review.time * 1000).toLocaleString() // Convert UNIX time to readable format
    }));
  } catch (error:any) {
    console.error("Error fetching reviews:", error.message);
    return [];
  }
}

// ✅ Example Usage
fetchNearbyPlaces("mumbai","").then(console.log);
// export const placesNearby = fetchNearbyPlaces;