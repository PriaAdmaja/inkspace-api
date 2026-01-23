import type { Context, Next } from "hono";
import { HttpError } from "../lib/http-error.js";

export function authChecker(c: Context, next: Next) {
  const authUser = c.get("authUser");

  if (!authUser) {
    throw new HttpError(401, "Unauthorized");
  }

  return next();
}