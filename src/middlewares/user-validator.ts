import type { Context, Next } from "hono";
import { UserData } from "../types/app.js";
import * as sharedUserRepository from "../shared/repository/users.repository.js";
import { fail } from "../libs/response.js";

export async function userValidator(c: Context, next: Next) {
  const prisma = c.get("prisma");
  const userData = c.get("userData") as UserData;

  if (!prisma || !userData) {
    throw new Error(
      "Can't find prisma or userData in userValidator middleware",
    );
  }

  const user = await sharedUserRepository.findUsername(
    prisma,
    userData.username,
  );

  if (!user) {
    return fail({
      c,
      message: "User not found",
      status: 404,
    });
  }

  if (!user.emailVerified) {
    return fail({
      c,
      message: "User email is not verified",
      status: 403,
    });
  }

  c.set("userDB", user);

  return next();
}
