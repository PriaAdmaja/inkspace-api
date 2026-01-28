import { Hono } from "hono";
import * as meController from "./me.controller.js";
import * as meSchema from "./me.schema.js";
import { withPrisma } from "../../../middlewares/prisma.js";
import { zValidator } from "../../../libs/validator.js";

const meRoutes = new Hono();

meRoutes.get("/", withPrisma, meController.getMe);
meRoutes.patch(
  "/",
  withPrisma,
  zValidator(meSchema.updateMeSchema),
  meController.updateMe,
);
meRoutes.post(
  "/register",
  withPrisma,
  zValidator(meSchema.registerSchema),
  meController.register,
);
meRoutes.patch(
  "/password",
  withPrisma,
  zValidator(meSchema.updatePasswordSchema),
  meController.updatePassword,
);

export default meRoutes;
