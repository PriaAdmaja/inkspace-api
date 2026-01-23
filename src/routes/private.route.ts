import { Hono } from "hono";
import { ContextWithPrisma } from "../types/app.js";
import { verifyAuth } from "@hono/auth-js";
import { authChecker } from "../middleware/authChecker.js";
import meRoutes from "../features/users/me/me.routes.js";

const privateRoutes = new Hono<ContextWithPrisma>();

privateRoutes.use("*", verifyAuth(), authChecker);

privateRoutes.route("/me", meRoutes);

export default privateRoutes;
