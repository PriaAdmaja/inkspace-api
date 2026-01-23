import { Context } from "hono";
import { ContextWithPrisma } from "../../../types/app.js";
import { fail, ok } from "../../../lib/response.js";
import { comparePassword, encryptPassword } from "../../../lib/hash.js";
import * as meRepository from "./me.repository.js";

export const register = async (c: Context<ContextWithPrisma>) => {
  const body = await c.req.json();
  const prisma = c.get("prisma");

  const user = await meRepository.getMe(prisma, body.email);

  if (user) {
    return fail({
      c,
      message: "User already exists",
      status: 409,
    });
  }

  const newUser = await meRepository.register(prisma, body);

  return ok({ c, data: newUser });
};

export const getMe = async (c: Context<ContextWithPrisma>) => {
  const prisma = c.get("prisma");
  const authUser = c.get("authUser");

  const loggedEmail = authUser?.session.user?.email || "";

  const user = await meRepository.getMe(prisma, loggedEmail);

  if (!user) {
    return fail({
      c,
      message: "User not found",
      status: 404,
    });
  }

  return ok({
    c,
    data: { user },
  });
};

export const updateMe = async (c: Context<ContextWithPrisma>) => {
  const authUser = c.get("authUser");

  const body = await c.req.json();
  const prisma = c.get("prisma");
  const email = authUser.session.user?.email || "";

  const updateMe = await meRepository.updateMe(prisma, email, body);

  return ok({ c, data: updateMe });
};

export const updatePassword = async (c: Context<ContextWithPrisma>) => {
  const authUser = c.get("authUser");

  const body = await c.req.json();
  const prisma = c.get("prisma");
  const email = authUser.session.user?.email || "";

  const user = await meRepository.getMePassword(prisma, email);

  if (!user?.password) {
    return fail({
      c,
      message: "Password login not available for this account",
      status: 400,
    });
  }

  if (
    !comparePassword(body.currentPassword, user.password)
  ) {
    return fail({
      c,
      message: "Current password is incorrect",
      status: 401,
    });
  }

  const updatePassword = await meRepository.updatePassword(prisma, email, encryptPassword(body.newPassword));

  return ok({ c, data: updatePassword });
};

