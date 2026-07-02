import { Hono } from "hono";
import { withPrisma } from "../../middlewares/prisma.js";
import { getUserPosts } from "../posts/posts.controller.js";
import * as usersController from "./users.controller.js";
import * as usersSchema from "./users.schema.js";
import { zValidator } from "../../libs/validator.js";

const usersPublicRoutes = new Hono();

usersPublicRoutes.get("/:username/posts", withPrisma, getUserPosts);
usersPublicRoutes.get("/:username", withPrisma, usersController.getUserData);
usersPublicRoutes.post(
  "/username/check",
  withPrisma,
  zValidator(usersSchema.checkingUsernameSchema),
  usersController.checkingUsername,
);

export default { usersPublicRoutes };
