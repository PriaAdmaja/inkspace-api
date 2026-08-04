import { Jwt } from "hono/utils/jwt";
import { SignatureAlgorithm } from "hono/utils/jwt/jwa";
import { env } from "../configs/env.js";

export const JWT_ALGORITHM: SignatureAlgorithm = "HS256";

export const generateRefreshToken = () => {
  const bytes = new Uint8Array(64); // 64 bytes
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const tokenGenerator = async (
  userId: string,
  email: string,
  username: string,
  expiresIn: number, // in seconds
) => {
  const payload = {
    sub: userId,
    email,
    username,
    exp: Math.floor(Date.now() / 1000) + expiresIn,
  };
  const token = await Jwt.sign(payload, env.JWT_SECRET, JWT_ALGORITHM);
  return token;
};

export const generateAccessToken = async (
  userId: string,
  email: string,
  username: string,
) => {
  const expiresIn = 15 * 60; // 15 minutes
  const token = await tokenGenerator(userId, email, username, expiresIn);
  return token;
};

export const generateEmailVerificationToken = async (
  userId: string,
  email: string,
  username: string,
) => {
  const expiresIn = 24 * 60 * 60; // 24 hours
  const token = await tokenGenerator(userId, email, username, expiresIn);
  return token;
};

export const accessTokenDecoder = (bearerToken?: string) => {
  if (!bearerToken) return null;

  const token = bearerToken.replace("Bearer ", "");
  const payload = Jwt.decode(token);
  return payload;
};
