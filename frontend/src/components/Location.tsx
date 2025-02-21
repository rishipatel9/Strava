import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  DirectionsRenderer,
} from "@react-google-maps/api";
import ActionSearchBar from "./SearchBar";

const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "10px",
};

const LiveLocationMap = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [destination, setDestination] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [routes, setRoutes] = useState<google.maps.DirectionsResult | null>(
    null
  );
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [placeName, setPlaceName] = useState<string>("Fetching location...");

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  // Get live location updates
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
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }, []);

  // Get place name whenever location or script load status changes
  useEffect(() => {
    if (location && isLoaded) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          setPlaceName(results[0].formatted_address);
        } else {
          console.error("Geocoder failed:", status);
          setPlaceName("Location not found");
        }
      });
    }
  }, [location, isLoaded]);
  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location) {
      const selectedLocation = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
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
        } else {
          console.error("Error fetching directions:", status);
        }
      }
    );
  };

  return isLoaded && location ? (
    <div className="flex flex-col gap-4">
      {/* Display Current Place Name */}
      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
        <h3 className="text-sm font-semibold">Your Location:</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">{placeName}</p>
      </div>

      {/* Search Bar */}
      <ActionSearchBar
        onSelectPlace={handlePlaceSelect}
        setDestination={setDestination}
      />

      {/* Google Map */}
      <GoogleMap mapContainerStyle={containerStyle} center={location} zoom={13}>
        <Marker position={location} />
        {destination && <Marker position={destination} />}
        {routes && (
          <DirectionsRenderer
            directions={routes}
            routeIndex={selectedRouteIndex}
          />
        )}
      </GoogleMap>

      {/* Display Routes */}
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
