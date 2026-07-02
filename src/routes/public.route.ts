import { Hono } from "hono";
import { ContextWithPrisma } from "../types/app.js";
import postsRoutes from "../modules/posts/posts.routes.js";
import usersRoute from "../modules/users/users.routes.js";

const publicRoutes = new Hono<ContextWithPrisma>();

publicRoutes.route("/posts", postsRoutes.postsPublicRoutes);
publicRoutes.route("/users", usersRoute.usersPublicRoutes);

export default publicRoutes;
