"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, AlertTriangle, Shield, Navigation, Sun, ThermometerSun } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import LiveLocationMap from '@/components/Location';

const Dashboard = () => {
  const [locationAccess, setLocationAccess] = useState(false);

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(() => {
        setLocationAccess(true);
      });
    }
  };

  if (!locationAccess) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Enable Location Access</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <p className="mb-4">To provide you with accurate safety information, we need access to your location.</p>
            <Button onClick={requestLocation} className='bg-neutral-200'>
              Share Location
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Travel Safety Dashboard</h1>
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          
          
          {/* Weather Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThermometerSun className="w-5 h-5" />
                Weather Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Crime Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                Recommended Routes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Alert className="bg-green-50">
                  <AlertTitle>Primary Route</AlertTitle>
                  <AlertDescription>
                    Via Main Street - Safest option
                  </AlertDescription>
                </Alert>
                <Alert className="bg-yellow-50">
                  <AlertTitle>Alternative Route</AlertTitle>
                  <AlertDescription>
                    Via Cedar Road - Moderate safety
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Map Card */}
          <Card >
            <CardHeader>
              <CardTitle>Safety Map</CardTitle>
            </CardHeader>
            <CardContent className=" bg-gray-100  ">
             <LiveLocationMap/>
            </CardContent>
          </Card>


          {/* Recent Incidents */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Recent Incidents
              </CardTitle>
            </CardHeader>
            <CardContent>
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