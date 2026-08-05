import { rateLimiter } from "hono-rate-limiter";

export const globalRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  limit: 100, // limit each IP to 100 requests per windowMs
  keyGenerator: (c) => c.req.header("x-forwarded-for") ?? "",
});

export const authRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  limit: 5, // limit each IP to 5 requests per windowMs
  keyGenerator: (c) => c.req.header("x-forwarded-for") ?? "",
});