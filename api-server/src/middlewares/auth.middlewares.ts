import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";



/**
 * Middleware to verify JWT access token
 * Attaches the user to the request object if token is valid
 */
export const verifyJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Try to get token from Authorization header first, then from cookies
    let accessToken = req.headers.authorization?.replace("Bearer ", "");

    // If not in header, try cookies
    if (!accessToken) {
      accessToken = req.cookies?.accessToken;
    }

    

    if (!accessToken) {
      res.status(401).json({ error: "Unauthorized - No token provided" });
      return;
    }

    // Verify the token
    const decoded = jwt.verify(accessToken, process.env.NEXT_AUTH_JWT_SECRET as string) as {
      id: string;
    };
    
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized", detail: error });
  }
};

