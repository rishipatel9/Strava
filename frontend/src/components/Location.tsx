import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  DirectionsRenderer,
} from "@react-google-maps/api";
import ActionSearchBar from "./SearchBar";
import useStore from "@/store/store";

const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "10px",
};

interface PlaceDetails {
  name?: string;
  rating?: number;
  userRatingsTotal?: number;
  reviews?: google.maps.places.PlaceReview[];
  photos: Array<{ url: string; attribution: string }>;
  address?: string;
  htmlAttributions: string[];
}

const LiveLocationMap = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [destination, setDestination] = useState<{
    lat: number;
    lng: number;
    placeId?: string;
  } | null>(null);
  const [routes, setRoutes] = useState<google.maps.DirectionsResult | null>(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [placeName, setPlaceName] = useState<string>("Fetching location...");
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [selectedPlaceDetails, setSelectedPlaceDetails] = useState<PlaceDetails | null>(null);
  const { setUserExactLocation } = useStore((state) => state);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(newLocation);
        },
        (error) => {
          console.error("Error getting location: ", error);
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  useEffect(() => {
    if (location && isLoaded) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          setPlaceName(results[0].formatted_address);
          setUserExactLocation(results[0].formatted_address);
        }
      });
    }
  }, [location, isLoaded]);

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location) {
      const selectedLocation = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        placeId: place.place_id,
      };
      setDestination(selectedLocation);
      fetchRoutes(selectedLocation);
    }
  };

  const fetchRoutes = (destination: { lat: number; lng: number }) => {
    if (!location) return;
    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: location,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setRoutes(result);
          setSelectedRouteIndex(0);
        }
      }
    );
  };

  const handleMarkerClick = (placeId: string) => {
    if (mapInstance && placeId) {
      const service = new google.maps.places.PlacesService(mapInstance);
      service.getDetails({ placeId }, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const details: PlaceDetails = {
            name: place.name,
            rating: place.rating,
            userRatingsTotal: place.user_ratings_total,
            reviews: place.reviews,
            photos: place.photos?.map((photo) => ({
              url: photo.getUrl({ maxWidth: 400 }),
              attribution: photo.html_attributions?.[0] || '',
            })) || [],
            address: place.formatted_address,
            htmlAttributions: place.html_attributions || [],
          };
          setSelectedPlaceDetails(details);
        }
      });
    }
  };

  return isLoaded && location ? (
    <div className="flex flex-col gap-4 border-none">
      <ActionSearchBar
        onSelectPlace={handlePlaceSelect}
        setDestination={setDestination}
      />

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={location}
        zoom={13}
        onLoad={(map) => setMapInstance(map)}
      >
        <Marker position={location} />
        {destination && (
          <Marker
            position={destination}
            onClick={() => destination.placeId && handleMarkerClick(destination.placeId)}
          />
        )}
        {routes && (
          <DirectionsRenderer
            directions={routes}
            routeIndex={selectedRouteIndex}
          />
        )}
      </GoogleMap>

      {selectedPlaceDetails && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">{selectedPlaceDetails.name}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {selectedPlaceDetails.address}
          </p>
          
          {selectedPlaceDetails.rating && (
            <div className="flex items-center mb-2">
              <span className="text-yellow-500">⭐</span>
              <span className="ml-1">
                {selectedPlaceDetails.rating} ({selectedPlaceDetails.userRatingsTotal} reviews)
              </span>
            </div>
          )}

          {selectedPlaceDetails.photos.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Photos</h3>
              <div className="flex gap-2 overflow-x-auto">
                {selectedPlaceDetails.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo.url}
                    alt={`Photo ${index + 1} of ${selectedPlaceDetails.name}`}
                    className="w-32 h-32 object-cover rounded"
                  />
                ))}
              </div>
              {selectedPlaceDetails.htmlAttributions.map((attribution, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-500 dark:text-gray-400 mt-1"
                  dangerouslySetInnerHTML={{ __html: attribution }}
                />
              ))}
            </div>
          )}

          {selectedPlaceDetails.reviews && selectedPlaceDetails.reviews.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Recent Reviews</h3>
              <div className="space-y-3">
                {selectedPlaceDetails.reviews.map((review, index) => (
                  <div key={index} className="border-t pt-2">
                    <div className="flex items-center mb-1">
                      <img
                        src={review.profile_photo_url || '/default-avatar.png'}
                        alt={review.author_name}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <span className="font-medium">{review.author_name}</span>
                    </div>
                    <p className="text-sm">{review.text}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-500">⭐ {review.rating}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(review.time * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {routes && (
        <div className="border rounded-lg shadow-md p-3 bg-white dark:bg-gray-900">
          <h3 className="text-sm font-medium mb-2">Possible Routes:</h3>
          <ul className="space-y-2">
            {routes.routes.map((route: google.maps.DirectionsRoute, index: number) => (
              <li
                key={index}
                className={`p-2 cursor-pointer rounded-md ${
                  selectedRouteIndex === index
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
                onClick={() => setSelectedRouteIndex(index)}
              >
                <p className="text-xs">
                  {route.legs?.[0]?.duration?.text} ({route.legs?.[0]?.distance?.text})
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  ) : (
    <p>Loading Map...</p>
  );
};

export default LiveLocationMap;