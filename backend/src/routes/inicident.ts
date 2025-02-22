import { Router } from "express";
import { prisma } from "../utils/prisma";
import authenticateUser from "../middleware/auth.middleware";

export const incidentRouter = Router();

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

        const incident = await prisma.incidents.create({
            data: {
                title,
                description,
                userId: userId,
                imageUrl,
                latitude,
                longitude,
            },
        });

        return res.status(201).json({
            statusCode: 201,
            message: "Incident Created Successfully",
            incident,
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