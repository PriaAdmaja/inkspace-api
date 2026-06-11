import { Hono } from "hono";
import { withPrisma } from "../../middlewares/prisma.js";
import { getUserPosts } from "../posts/posts.controller.js";

const usersPublicRoutes = new Hono();

usersPublicRoutes.get("/:id/posts", withPrisma, getUserPosts);

export default { usersPublicRoutes };
