import { Request, Response, Router } from "express";
import authenticateUser from "../middleware/auth.middleware";
import { prisma } from "../utils/prisma";

export const userRouter = Router();

userRouter.get("/", (req: Request, res: Response) => {
  res.json({
    statusCode: 200,
    message: "User Created Successfully",
  });
});

userRouter.delete("/:id", (req: Request, res: Response) => {
  res.json({
    statusCode: 200,
    message: `User with id deleted successfully`,
  });
});
declare module "express" {
  export interface Request {
    user?: {
      id: string;
    };
  }
}
userRouter.post(
  "/update/phoneNumber",
  authenticateUser,
  async (req: any, res: any) => {
    try {
      const { phoneNumber } = req.body;
      const userId = req.user.id;

      if (!userId) {
        return res.status(401).json({
          statusCode: 401,
          message: "Unauthorized: User not found",
        });
      }

      // Update user phone number in Prisma
      const user = await prisma.user.update({
        where: { id: userId },
        data: { phoneNumber },
      });

      return res.status(200).json({
        statusCode: 200,
        message: "User phone number updated successfully",
        user,
      });
    } catch (error: any) {
      console.error("Error updating user phone number:", error);

      if (error.code === "P2025") {
        return res.status(404).json({
          statusCode: 404,
          message: "User not found",
        });
      }

      return res.status(500).json({
        statusCode: 500,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }
);

userRouter.post(
  "/update/location",
  authenticateUser,
  async (req: any, res: any) => {
    try {
      const { latitude, longitude } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          statusCode: 401,
          message: "Unauthorized: User not found",
        });
      }

      if (!latitude || !longitude) {
        return res.status(400).json({
          statusCode: 400,
          message: "Bad Request: Latitude and Longitude are required",
        });
      }

      // Check if user exists before updating
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        return res.status(404).json({
          statusCode: 404,
          message: "User not found",
        });
      }

      // Update user location
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          userLocation: {
            set: { latitude, longitude }, // Use `set` for JSON fields
          },
        },
      });

      return res.status(200).json({
        statusCode: 200,
        message: "User location updated successfully",
        user: updatedUser,
      });
    } catch (error: any) {
      console.error("Error updating user location:", error);

      if (error.code === "P2025") {
        return res.status(404).json({
          statusCode: 404,
          message: "User not found",
        });
      }

      return res.status(500).json({
        statusCode: 500,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }
);
