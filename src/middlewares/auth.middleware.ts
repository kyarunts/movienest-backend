import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { JWT_SECRET_KEY } from "../routes/auth/auth.utils";
import constructError from "../utils/constructError";
import { UNAUTHORIZED_ERROR_CODE } from "../utils/constants";

export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next(
      constructError({
        message: "Access token must be provided",
        code: UNAUTHORIZED_ERROR_CODE,
      })
    );
  }

  jwt.verify(token, JWT_SECRET_KEY, (err: any, payload: any) => {
    if (err) {
      return next(
        constructError({ message: err.message, code: UNAUTHORIZED_ERROR_CODE })
      ); // Forbidden if token is invalid
    }

    req.userId = payload.userId;
    next();
  });
};
