import { Hono } from "hono";
import * as authController from "./auth.controller.js";
import { withPrisma } from "../../middlewares/prisma.js";
import { tokenDecoder } from "../../middlewares/token-decoder.js";
import { zValidator } from "../../libs/validator.js";
import * as authSchema from "./auth.schema.js";

const authRoutes = new Hono();
const publicAuthRoutes = new Hono();
const privateAuthRoutes = new Hono();
privateAuthRoutes.use(
  "*",
  tokenDecoder,
);

publicAuthRoutes.post("/login", withPrisma, zValidator(authSchema.loginSchema), authController.login);
publicAuthRoutes.post("/register", withPrisma, zValidator(authSchema.registerSchema), authController.register);
publicAuthRoutes.post("/refresh", withPrisma, authController.getAccessToken);

privateAuthRoutes.post("/logout", withPrisma,  authController.logout);

authRoutes.route("/", publicAuthRoutes);
authRoutes.route("/", privateAuthRoutes);

export default authRoutes;
