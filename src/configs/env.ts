import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  DATABASE_URL: z.string(),
  AUTH_SECRET: z.string(),
  PORT: z.coerce.number().default(3001),

  GITHUB_ID: z.string(),
  GITHUB_SECRET: z.string(),

  JWT_SECRET: z.string(),

  FE_ALLOWED_URL: z.string(),
  FRONTEND_URL: z.string(),

  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),

  EMAIL_ADDRESS: z.string(),
  GOOGLE_APP_PASSWORD: z.string(),
});

export const env = envSchema.parse(process.env);
