import { Hono } from "hono";
import { ContextWithPrisma } from "../types/app.js";
import { verifyAuth } from "@hono/auth-js";
import { authChecker } from "../middlewares/authChecker.js";
import meRoutes from "../features/users/me/me.route.js";
import postsRoutes from "../features/posts/posts.route.js";

const privateRoutes = new Hono<ContextWithPrisma>();

privateRoutes.use("*", verifyAuth(), authChecker);

privateRoutes.route("/me", meRoutes);
privateRoutes.route("/posts", postsRoutes.postsPrivateRoutes);

export default privateRoutes;
