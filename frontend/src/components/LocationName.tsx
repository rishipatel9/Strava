import React, { useState, useEffect } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { MapPin, LoaderCircle, AlertTriangle } from "lucide-react";
import useStore from "@/store/store";

const LocationName = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [placeName, setPlaceName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { setUserLocation, userExactLocatiom, setLocationDetails} = useStore((state) => state);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  // Get live location updates
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setError(null); 
          setLocationDetails({
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString()
          })
        },
        (err) => {
          console.error("Error getting location: ", err);
          setError("Location access denied. Please enable GPS.");
        },
        { enableHighAccuracy: true }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, []);

  // Get place name when location updates
  useEffect(() => {
    if (location && isLoaded) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          const mainLocation = results[0].address_components.find((component) =>
            component.types.includes("locality") ||
            component.types.includes("administrative_area_level_1") ||
            component.types.includes("country")
          )?.long_name;

          setPlaceName(mainLocation || "Unknown Location");
          setUserLocation(mainLocation || "Unknown Location");
        } else {
          console.error("Geocoder failed:", status);
          setPlaceName("Unknown Location");
        }
      });
    }
  }, [location, isLoaded]);

  return (
    <div>
      {error ? (
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <p className="text-sm">{error}</p>
        </div>
      ) : placeName ? (
        <div className="relative group flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-500" />
          <p className="text-sm text-gray-800 dark:text-gray-200 cursor-pointer">
            {placeName}
          </p>

          {/* Hover Card */}
          <div className="absolute top-8 right-10 bg-white dark:bg-gray-800 shadow-lg p-4 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-64">
            <p className="text-sm font-semibold">Exact Location:</p>
            <p className="text-xs text-gray-600 dark:text-gray-300">{userExactLocatiom || "Not Available"}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-gray-500">
          <LoaderCircle className="w-5 h-5 animate-spin" />
          <p className="text-sm">Fetching location...</p>
        </div>
      )}
    </div>
  );
};
export default LocationName