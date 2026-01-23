import { Hono } from "hono";
import { ContextWithPrisma } from "../types/app.js";
import postsRoutes from "../features/posts/posts.route.js";

const publicRoutes = new Hono<ContextWithPrisma>();

publicRoutes.route("/posts", postsRoutes);

export default publicRoutes;
