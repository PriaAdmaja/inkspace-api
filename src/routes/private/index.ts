import { Hono } from "hono";
import { verifyAuth } from "@hono/auth-js";
import { withPrisma } from "../../lib/prisma.js";
import { ContextWithPrisma } from "../../types/app.js";
import { fail, ok } from "../../lib/response.js";
import { HttpError } from "../../lib/http-error.js";

const privateRoutes = new Hono<ContextWithPrisma>();

privateRoutes.use("*", verifyAuth());

privateRoutes.get("/me", withPrisma, async (c) => {
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
      error: "User not found",
      status: 404,
    });
  }

  return ok({
    c,
    data: { user },
  });
});

export default privateRoutes;
