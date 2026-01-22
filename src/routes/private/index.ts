import { Hono } from "hono";
import { verifyAuth } from "@hono/auth-js";
import { ContextWithPrisma } from "../../types/app.js";
import meRoutes from "./me.js";

const privateRoutes = new Hono<ContextWithPrisma>();

privateRoutes.use("*", verifyAuth());

privateRoutes.route('/me', meRoutes)

export default privateRoutes;
