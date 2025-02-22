import { Router } from "express";
import { prisma } from "../utils/prisma";
import authenticateUser from "../middleware/auth.middleware";
import { fetchNearbyPlaces } from "../utils/placesNearby";
import { Prisma } from "@prisma/client";
import { client } from "../main";

export const incidentRouter = Router();

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

incidentRouter.post("/create", authenticateUser, async (req: any, res: any) => {
    try {
      const { title, description, imageUrl, latitude, longitude } = req.body;
  
      if (!title || !description) {
        return res.status(400).json({
          statusCode: 400,
          message: "Bad Request: Title and Description are required",
        });
      }
  
      const userId = req.user.id;
      console.log("User ID", userId);
  
      // Create Incident
      const incident = await prisma.incidents.create({
        data: {
          title,
          description,
          userId,
          imageUrl,
          latitude,
          longitude,
        },
      });
  
      console.log("Incident created successfully");
  
      // Fetch all users with location data
      const users = await prisma.user.findMany({
        where: {
          userLocation: {
            not: Prisma.JsonNullValueFilter.JsonNull, // Ensure location exists
          },
        },
        select: {
          id: true,
          phoneNumber: true,
          userLocation: true,
        },
      });
  
      // Filter users within 10 km radius
      const nearbyUsers = users.filter((user) => {
        const userLocation = user.userLocation as { latitude: string; longitude: string };
        const userLat = parseFloat(userLocation.latitude);
        const userLon = parseFloat(userLocation.longitude);
        const distance = getDistance(userLat, userLon, latitude, longitude);
        return distance <= 10; 
      });
  
      console.log(`Users within 10km: ${nearbyUsers.length}`);
  
      const emergencyMessage =
        `⚠️ EMERGENCY ALERT ⚠️\n\n` +
        `A ${title} has been reported at ${description}.\n` +
        `Please stay away from the affected area and stay safe.\n\n` +
        `This is an automated emergency alert.`;
  
    
      await client.initialize();
  
      // Send message to users within range
      const sendPromises = nearbyUsers.map(async (user) => {
        try {
          if (!user.phoneNumber) {
            throw new Error(`Phone number is missing for user ${user.id}`);
          }
          const formattedNumber = user.phoneNumber.replace(/[^0-9]/g, "") + "@c.us";
          await client.sendMessage(formattedNumber, emergencyMessage);
          console.log(`Sent to ${user.phoneNumber}`);
          return { number: user.phoneNumber, status: "success" };
        } catch (error: any) {
          console.error(`Failed to send to ${user.phoneNumber}:`, error);
          return { number: user.phoneNumber, status: "failed", error: error.message };
        }
      });
  
      const results = await Promise.all(sendPromises);
  
      return res.status(201).json({
        statusCode: 201,
        message: "Incident Created Successfully",
        incident,
        notifications: results,
      });
    } catch (error: any) {
      console.error("Error creating incident:", error);
      return res.status(500).json({
        statusCode: 500,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  });
  

incidentRouter.get("/getAll", authenticateUser, async (req: any, res: any) => {
  try {
    // const userId = req.user?.id;
    // if (!userId) {
    //     return res.status(401).json({ message: "Unauthorized: No user ID" });
    // }
    const incidents = await prisma.incidents.findMany({});

    return res.status(200).json({
      statusCode: 200,
      message: "Incidents Fetched Successfully",
      incidents,
    });
  } catch (error: any) {
    console.error("Error fetching incidents:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

incidentRouter.post(
  "/nearby_places",
  authenticateUser,
  async (req: any, res: any) => {
    try {
      const { location, purpose } = req.body;
      let data: any[] | undefined;
      console.log("Location:", location);
      console.log("Purpose:", purpose);

      if (!purpose) {
        const randomPurposes = ["hotel", "beach", "market", "park"];
        data = [];
        for (let i = 0; i < 4; i++) {
          const randomPurpose =
            randomPurposes[Math.floor(Math.random() * randomPurposes.length)];
          const places = await fetchNearbyPlaces(location, randomPurpose);
          data = data.concat(places);
        }
      } else {
        const response = await fetchNearbyPlaces(location, purpose);
        data = response.places;
      }

      return res.status(200).json({
        statusCode: 200,
        message: "Places Fetched Successfully",
        data,
      });
    } catch (error: any) {
      console.error("Error fetching places:", error);
      return res.status(500).json({
        statusCode: 500,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }
);

// incidentRouter.get("/getNumbers",authenticateUser, async (req: any, res: any) => {
//     try {
//         const userId = req.user?.id;
//         if (!userId) {
//             return res.status(401).json({ message: "Unauthorized: No user ID" });
//         }

//         // return res.status(200).json({
//         //     statusCode: 200,
//         //     message: "Incidents Fetched Successfully",
//         //     incidents,
//         // });
//     } catch (error: any) {
//         console.error("Error fetching incidents:", error);
//         return res.status(500).json({
//             statusCode: 500,
//             message: "Internal Server Error",
//             error: error.message,
//         });
//     }
// }
