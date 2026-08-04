import z from "zod";
import { usernameSchema } from "../../shared/schemas/users.schema.js";

export const registerSchema = z.object({
  email: z.email(),
  username: usernameSchema,
  name: z.string(),
  password: z.string(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export const refreshTokenSchema = z.object({
  userId: z.string(),
  refreshToken: z.string(),
  expired: z.date(),
});

export const regenerateAccessTokenSchema = z.object({
  refreshToken: z.string(),
});

export const logoutSchema = z.object({
  refreshToken: z.string(),
});

export const verifyEmailSchema = z.object({
  token: z.string(),
});