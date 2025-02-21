import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
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

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries: ["places"],
    });

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
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

    const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
        if (place.geometry?.location) {
            setLocation({
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
            });
        }
    };

    return isLoaded && location ? (
        <div className="flex flex-col gap-10">
            <ActionSearchBar onSelectPlace={handlePlaceSelect} />
            <GoogleMap mapContainerStyle={containerStyle} center={location} zoom={15}>
                <Marker position={location} />
            </GoogleMap>
        </div>
    ) : (
        <p>Loading Map...</p>
    );
};

export default LiveLocationMap;
