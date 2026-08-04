import { env } from "../configs/env.js";

const feAllowedOrigin = env.FE_ALLOWED_URL;
export const allowedOrigin = feAllowedOrigin
  ? feAllowedOrigin.includes(",")
    ? feAllowedOrigin.split(",")
    : feAllowedOrigin
  : undefined;
