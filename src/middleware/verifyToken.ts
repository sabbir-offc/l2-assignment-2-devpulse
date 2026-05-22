import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    name: string;
    role: string;
  };
}

const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"];

  if (!token) {
    res.status(401).json({
      success: false,
      message: "No token provided",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt_secret as string) as {
      id: number;
      name: string;
      role: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default verifyToken;
