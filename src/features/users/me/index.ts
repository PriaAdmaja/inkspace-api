import { Context } from "hono";
import { ContextWithPrisma } from "../../../types/app.js";
import { HttpError } from "../../../lib/http-error.js";
import { fail, ok } from "../../../lib/response.js";

export const getMe = async (c: Context<ContextWithPrisma>) => {
  const prisma = c.get("prisma");
  const authUser = c.get("authUser");

  if (!authUser) {
    throw new HttpError(401, "Unauthorized");
  }

  const loggedEmail = authUser?.session.user?.email || "";

  const user = await prisma.user.findUnique({
    where: {
      email: loggedEmail,
    },
  });
  
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

  if (!authUser) {
    throw new HttpError(401, "Unauthorized");
  }

  const body = await c.req.json();
  const prisma = c.get("prisma");
  const email = authUser.session.user?.email || "";

  const updateMe = await prisma.user.update({
    where: {
      email,
    },
    data: body,
  });

  return ok({ c, data: updateMe });
};
