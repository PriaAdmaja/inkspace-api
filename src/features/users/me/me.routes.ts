import { Hono } from "hono";
import { getMe, updateMe, updatePassword } from "./me.controller.js";
import { zValidator } from "@hono/zod-validator";
import { updateMeSchema, updatePasswordSchema } from "./me.schema.js";
import { withPrisma } from "../../../middleware/prisma.js";

const meRoutes = new Hono();

meRoutes.get("/", withPrisma, getMe);
meRoutes.patch("/", withPrisma, zValidator("json", updateMeSchema), updateMe);
meRoutes.patch(
  "/password",
  withPrisma,
  zValidator("json", updatePasswordSchema),
  updatePassword,
);

export default meRoutes;
