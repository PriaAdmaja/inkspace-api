import { Jwt } from "hono/utils/jwt";
import { SignatureAlgorithm } from "hono/utils/jwt/jwa";

export const JWT_ALGORITHM: SignatureAlgorithm = "HS256";

export const generateRefreshToken = () => {
  const bytes = new Uint8Array(64); // 64 bytes
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const generateAccessToken = async (userId: string, email: string) => {
  const expiresIn = 15 * 60; // 15 minutes
  const payload = {
    sub: userId,
    email,
    exp: Math.floor(Date.now() / 1000) + expiresIn,
  };
  const token = await Jwt.sign(
    payload,
    process.env.JWT_SECRET!,
    JWT_ALGORITHM,
  );
  return token;
};

export const accessTokenDecoder = (bearerToken?: string) => {
  if (!bearerToken) return null;

  const token = bearerToken.replace("Bearer ", "");
  const payload = Jwt.decode(token);
  return payload;
};
