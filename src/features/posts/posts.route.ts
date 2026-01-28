import { withPrisma } from "../../middlewares/prisma.js";
import * as postsController from "./posts.controller.js";
import { Hono } from "hono";
import { postSchema } from "./posts.schema.js";
import { zValidator } from "../../libs/validator.js";

const postsPublicRoutes = new Hono();
const postsPrivateRoutes = new Hono();

postsPublicRoutes.get("/list", withPrisma, postsController.getAllPosts);
postsPublicRoutes.get("/:id", withPrisma, postsController.getPostById);

postsPrivateRoutes.post(
  "/create",
  withPrisma,
  zValidator(postSchema),
  postsController.createPost,
);

postsPrivateRoutes.patch(
  "/:id",
  withPrisma,
  zValidator(postSchema),
  postsController.updatePost,
);

export default { postsPublicRoutes, postsPrivateRoutes };
