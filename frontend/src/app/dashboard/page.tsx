"use client"
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, AlertTriangle, Shield, Navigation, Sun, ThermometerSun, Star, Wind } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import LiveLocationMap from '@/components/Location';
import LocationName from '@/components/LocationName';
import axios from 'axios';
import useStore from '@/store/store';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { BASEURL } from '@/utils/constants';
import dynamic from 'next/dynamic';



const Heatmap = dynamic(() => import("../../components/HeatMap"), { ssr: false });

const Dashboard = () => {
  const [locationAccess, setLocationAccess] = useState(false);
  const { location, userExactLocatiom } = useStore((state) => state)
  const { data: session } = useSession()
  console.log("User Exact Location", userExactLocatiom)

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(() => {
        setLocationAccess(true);
      });
    }
  };


  const fetchWeather = async () => {
    try {
      const response = await axios.get(`http://localhost:6000/weather?location=Mumbai`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log("Weather Data:", response.data);
    } catch (err) {
      console.error("Failed to fetch weather:", err);
    }
  };

  useEffect(() => {
    console.log("Location:", location)
    fetchWeather();
  }, [location])

  const { data: incidentsData } = useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const response = await axios.get(`${BASEURL}/incident/getAll`, {
        headers: {
          "Authorization": `Bearer ${session?.user.id}`
        },
      });
      return response.data;
    }
  });

  const { data: nearbyPlacesData } = useQuery({
    queryKey: ['nearbyPlaces', location],
    queryFn: async () => {
      const response = await axios.post(`${BASEURL}/incident/nearby_places`, {
        location: location,
        purpose: "hotels",
      }, {
        headers: {
          "Authorization": `Bearer ${session?.user.id}`
        }
      });
      return response.data;
    }
  });




  // if (!locationAccess) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 p-8">
  //       <Card className="max-w-md mx-auto">
  //         <CardHeader>
  //           <CardTitle className="text-xl font-semibold">Enable Location Access</CardTitle>
  //         </CardHeader>
  //         <CardContent className="text-center">
  //           <MapPin className="w-16 h-16 mx-auto mb-4 text-blue-500" />
  //           <p className="mb-4">To provide you with accurate safety information, we need access to your location.</p>
  //           <Button onClick={requestLocation} className='bg-neutral-200'>
  //             Share Location
  //           </Button>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Travel Safety Dashboard</h1>
          <LocationName />
        </div>

        {/* First Row - 3 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Weather Alerts */}
          <Card className="shadow-md rounded-xl bg-gray-200 overflow-hidden">
            <CardHeader className="rounded-xl">
              <CardTitle className="flex items-center gap-2">
                <ThermometerSun className="w-5 h-5" />
                Weather Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-gray-100 rounded-xl">
              <Alert className="mb-4">
                <Sun className="w-4 h-4" />
                <AlertTitle>High Temperature Warning</AlertTitle>
                <AlertDescription>Expected temperature of 95°F (35°C)</AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Crime Statistics */}
          <Card className="shadow-md bg-gray-200 rounded-xl">
            <CardHeader className="bg-gray-200 rounded-xl">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Crime Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-gray-100">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Safety Score</span>
                  <span className="text-green-600 font-semibold">85/100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Recent Incidents</span>
                  <span>12</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AQI Card */}
          <Card className="shadow-md bg-gray-200 rounded-xl">
            <CardHeader className="rounded-xl">
              <CardTitle className="flex items-center gap-2">
                <Wind className="w-5 h-5" />
                Air Quality Index (AQI)
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-gray-100">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Current AQI</span>
                  <span className="text-red-600 font-semibold">150 - Unhealthy</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>PM2.5 Level</span>
                  <span>75 µg/m³</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row - 2 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Nearby Famous Places */}
          <Card className="shadow-md bg-gray-200 rounded-xl">
            <CardHeader className="rounded-xl">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Nearby Famous Places
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-gray-100 space-y-4 max-h-[500px] overflow-y-auto">
              {nearbyPlacesData?.data ? (
                nearbyPlacesData.data.slice(0, 5).map((place: any, index: any) => (
                  <Card key={place.place_id || index} className="bg-white p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{place.name}</h3>
                        <p className="text-sm text-gray-600">{place.address}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{place.rating}</span>
                        <span className="text-sm text-gray-500">({place.total_ratings})</span>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-gray-500 text-center">Loading nearby places...</p>
              )}
            </CardContent>
          </Card>

          {/* Safety Map & Recommended Routes */}
          <Card className="shadow-md bg-gray-200 rounded-xl overflow-hidden">
            <CardHeader className="rounded-xl">
              <CardTitle>Safety Map & Recommended Routes</CardTitle>
            </CardHeader>
            <CardContent className="bg-gray-100">
              <LiveLocationMap />
            </CardContent>
          </Card>
        </div>

        {/* Third Row - Recent Incidents (Full Width) */}
        <div className="mt-6">
          <Card className="shadow-md bg-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Recent Incidents
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-gray-100">
              <div className="space-y-4 py-2">
                {incidentsData?.incidents?.map((incident: any) => (
                  <Alert key={incident.id} className="bg-gray-50 p-4 flex gap-4">
                    {incident.imageUrl && (
                      <img
                        src={incident.imageUrl}
                        alt={incident.title}
                        className="w-20 h-20 rounded-md object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <AlertTitle>{incident.title}</AlertTitle>
                      <AlertDescription className="flex justify-between">
                        <span>{incident.description}</span>
                        <span className="text-gray-500">{new Date().toLocaleTimeString()}</span>
                      </AlertDescription>
                    </div>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fourth Row - Heatmap (Full Width) */}
        <div className="mt-6">
          <Heatmap />
        </div>
      </div>
    </div>
  );

};

export default Dashboard;