import { withPrisma } from "../../middlewares/prisma.js";
import * as postsController from "./posts.controller.js";
import { Hono } from "hono";

const postsRoutes = new Hono();

postsRoutes.get("/", withPrisma, postsController.getAllPosts);

export default postsRoutes;
