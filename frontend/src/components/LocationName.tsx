import React, { useState, useEffect } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

const LocationName = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
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
          // Extract the main location component (e.g., city or locality)
          const mainLocation = results[0].address_components.find((component) =>
            component.types.includes("locality") || component.types.includes("administrative_area_level_1") || component.types.includes("country")
          )?.long_name;

          setPlaceName(mainLocation || "Location not found");
        } else {
          console.error("Geocoder failed:", status);
          setPlaceName("Location not found");
        }
      });
    }
  }, [location, isLoaded]);

  return (
    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-sm font-semibold"></h3>
      <p className="text-sm text-gray-700 dark:text-gray-300">{placeName}</p>
    </div>
  );
};

export default LocationName;
