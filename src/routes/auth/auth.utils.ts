import jwt from "jsonwebtoken";

export const JWT_SECRET_KEY: string = process.env.JWT_SECRET_KEY!;

interface JWTPayload {
  userId: number;
}

const signJWT = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: "10h" });
};

export default { signJWT };
