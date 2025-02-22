"use client"
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, AlertTriangle, Shield, Navigation, Sun, ThermometerSun } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import LiveLocationMap from '@/components/Location';
import LocationName from '@/components/LocationName';
import axios from 'axios';
import useStore from '@/store/store';


const Dashboard = () => {
  const [locationAccess, setLocationAccess] = useState(false);
  const { location } = useStore((state) => state)

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">

          {/* Weather Alerts */}
          <Card className="shadow-md rounded-xl bg-yellow-200 overflow-hidden">
            <CardHeader className='rounded-xl '>
              <CardTitle className="flex items-center gap-2">
                <ThermometerSun className="w-5 h-5" />
                Weather Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className='bg-yellow-100 ronded-xl'>
              <Alert className="mb-4">
                <Sun className="w-4 h-4" />
                <AlertTitle>High Temperature Warning</AlertTitle>
                <AlertDescription>
                  Expected temperature of 95°F (35°C)
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Crime Statistics */}
          <Card className="shadow-md bg-blue-200   rounded-xl">
            <CardHeader className='bg-blue-200  rounded-xl'>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Crime Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className='bg-blue-100'>
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

          {/* Safe Routes */}
          <Card className="shadow-md bg-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                Recommended Routes
              </CardTitle>
            </CardHeader>
            <CardContent className='bg-green-100'>
              <div className="space-y-2">
                <Alert className="">
                  <AlertTitle>Primary Route</AlertTitle>
                  <AlertDescription>
                    Via Main Street - Safest option
                  </AlertDescription>
                </Alert>
                <Alert className="bg-yellow-200">
                  <AlertTitle>Alternative Route</AlertTitle>
                  <AlertDescription>
                    Via Cedar Road - Moderate safety
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md bg-gray-200">
            <CardHeader>
              <CardTitle>Safety Map & Recommended Routes</CardTitle>
            </CardHeader>
            <CardContent className="bg-gray-100">
              <LiveLocationMap />
            </CardContent>
          </Card>

          {/* Recent Incidents */}
          <Card className="lg:col-span-2 shadow-md bg-pink-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Recent Incidents
              </CardTitle>
            </CardHeader>
            <CardContent className='bg-pink-100'>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Alert key={i} className="bg-gray-50">
                    <AlertTitle>{`Incident #${i}`}</AlertTitle>
                    <AlertDescription className="flex justify-between">
                      <span>Minor incident reported</span>
                      <span className="text-gray-500">2 hours ago</span>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>

  );
};

export default Dashboard;