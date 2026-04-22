import z from "zod";

export const registerSchema = z.object({
  email: z.email(),
  username: z.string(),
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
