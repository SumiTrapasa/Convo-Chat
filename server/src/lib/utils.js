import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

export const generateToken = (userId, res) => {
  const { JWT_SECRET } = ENV;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "7d",
  });
  const isDevelopment = ENV.NODE_ENV === "development";
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, // prevent XSS attacks: cross-site scripting
    sameSite: isDevelopment ? "lax" : "none", // "none" is required for Vercel -> Railway
    secure: isDevelopment ? false : true,
  });

  return token;
};
