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
    select: {
      id: true,
      email: true,
      username: true,
      avatar: true,
      about: true,
      createdAt: true,
      updatedAt: true,
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