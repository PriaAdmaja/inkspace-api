import { Hono } from "hono";
import * as meController from "./me.controller.js";
import { zValidator } from "@hono/zod-validator";
import * as meSchema from "./me.schema.js";
import { withPrisma } from "../../../middlewares/prisma.js";

const meRoutes = new Hono();

meRoutes.get("/", withPrisma, meController.getMe);
meRoutes.patch(
  "/",
  withPrisma,
  zValidator("json", meSchema.updateMeSchema),
  meController.updateMe,
);
meRoutes.post(
  "/register",
  withPrisma,
  zValidator("json", meSchema.registerSchema),
  meController.register,
);
meRoutes.patch(
  "/password",
  withPrisma,
  zValidator("json", meSchema.updatePasswordSchema),
  meController.updatePassword,
);

export default meRoutes;
