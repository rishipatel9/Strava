"use client";

import { useLoadScript, GoogleMap, HeatmapLayer } from "@react-google-maps/api";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Shield } from "lucide-react";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const BASEURL = process.env.NEXT_PUBLIC_API_URL || "";

const libraries: ("visualization")[] = ["visualization"];

const Heatmap = () => {
    const { data: session } = useSession();
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: API_KEY,
        libraries: libraries,
    });

    const center = useMemo(() => ({ lat: 19.2326276, lng: 72.8574442 }), []);

    // Fetch Incidents using React Query
    const { data: incidentsData, isLoading, error } = useQuery({
        queryKey: ["incidents"],
        queryFn: async () => {
            const response = await axios.get(`${BASEURL}/incident/getAll`, {
                headers: {
                    Authorization: `Bearer ${session?.user.id}`,
                },
            });
            return response.data;
        },
        enabled: !!session?.user?.id, // Only fetch if session exists
    });

    const [heatmapData, setHeatmapData] = useState<any[]>([]);

    useEffect(() => {
        if (isLoaded && incidentsData && typeof window !== "undefined" && window.google) {
            const incidentLocations = incidentsData?.incidents?.map((incident: any) =>
                new window.google.maps.LatLng(incident.latitude, incident.longitude)
            );

            setHeatmapData(incidentLocations || []);
        }
    }, [isLoaded, incidentsData]);

    if (!isLoaded || isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading incidents.</div>;

    return (
        <Card className="h-screen w-full rounded-xl">
            <CardHeader className="bg-gray-200 rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Incident Heat Map
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[500px] p-0"> 
                <GoogleMap 
                    zoom={13} 
                    center={center} 
                    mapContainerStyle={{ width: "100%", height: "100%" }} 
                >
                    {heatmapData.length > 0 && <HeatmapLayer data={heatmapData} />}
                </GoogleMap>
            </CardContent>
        </Card>
    );
};

export default Heatmap;
