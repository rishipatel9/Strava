import { Request, Response, NextFunction } from "express";

// Define a custom interface for Request with user property
interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

const authenticateUser = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Unauthorized: No Bearer token" });
      return; // Ensure function exits
    }

    // Extract user ID from Bearer token
    const userId = authHeader.split(" ")[1];

    if (!userId) {
      res.status(401).json({ message: "Unauthorized: Invalid token" });
      return; // Ensure function exits
    }

    // Attach user ID to req.user
    req.user = { id: userId };

    next(); // Call next middleware
  } catch (error) {
    console.error("Error in authentication middleware:", error);
    res.status(401).json({ message: "Unauthorized: Invalid session" });
    return; // Ensure function exits
  }
};

export default authenticateUser;
