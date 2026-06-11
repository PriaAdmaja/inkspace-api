import { Hono } from "hono";
import { ContextWithPrisma } from "../types/app.js";
import postsRoutes from "../features/posts/posts.route.js";
import usersRoute from "../features/users/users.route.js";

const publicRoutes = new Hono<ContextWithPrisma>();

publicRoutes.route("/posts", postsRoutes.postsPublicRoutes);
publicRoutes.route("/users", usersRoute.usersPublicRoutes);

export default publicRoutes;
