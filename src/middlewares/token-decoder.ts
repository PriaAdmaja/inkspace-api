import type { Context, Next } from "hono";
import { HttpError } from "../libs/http-error.js";
import { Jwt } from "hono/utils/jwt";
import { UserData } from "../types/app.js";

export function tokenDecoder(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HttpError(401, "Unauthorized");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new HttpError(401, "Unauthorized");
  }
  const { payload } = Jwt.decode(token);
  const userData: UserData = {
    id: String(payload.sub),
    email: String(payload.email),
  };
  c.set("userData", userData);
  
  return next();
}
