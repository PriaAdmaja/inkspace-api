import { Hono } from "hono";
import * as authController from "./auth.controller.js";
import { withPrisma } from "../../middlewares/prisma.js";
import { jwt } from "hono/jwt";
import { JWT_ALGORITHM } from "../../libs/token.js";
import { tokenDecoder } from "../../middlewares/token-decoder.js";

const authRoutes = new Hono();
const publicAuthRoutes = new Hono();
const privateAuthRoutes = new Hono();
privateAuthRoutes.use(
  "*",
  jwt({
    secret: process.env.JWT_SECRET || "default-secret",
    alg: JWT_ALGORITHM,
  }),
  tokenDecoder,
);

publicAuthRoutes.post("/login", withPrisma, authController.login);
publicAuthRoutes.post("/register", withPrisma, authController.register);
publicAuthRoutes.post("/refresh", withPrisma, authController.getAccessToken);

privateAuthRoutes.post("/logout", withPrisma, authController.logout);

authRoutes.route("/", publicAuthRoutes);
authRoutes.route("/", privateAuthRoutes);

export default authRoutes;
