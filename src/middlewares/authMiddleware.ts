import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

// Define the JWT Payload type
export interface JwtPayload {
  id: string;
  userId?: string;
  role: string;
}

// Middleware to verify if the user is authenticated
export const authenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies.accessToken; // Ensure cookie-parser middleware is used
  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (decoded.id) {
      req.user = { id: decoded.id, role: decoded.role };
    } else if (decoded.userId) {
      req.user = { id: decoded.userId, role: decoded.role };
    }
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(403).json({ error: "Invalid or expired token" });
  }
};
