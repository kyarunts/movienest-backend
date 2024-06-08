import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { JWT_SECRET_KEY } from "../routes/auth/auth.utils";
import constructError from "../utils/constructError";

export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next(
      constructError({ message: "Token must be provided", code: 401 })
    );
  }

  jwt.verify(token, JWT_SECRET_KEY, (err: any, payload: any) => {
    if (err) {
      return next(constructError({ message: err.message, code: 401 })); // Forbidden if token is invalid
    }

    req.userId = payload.userId;
    next();
  });
};
