import { Hono } from "hono";
import { ContextWithPrisma } from "../types/app.js";
import meRoutes from "../features/users/me/me.route.js";
import postsRoutes from "../features/posts/posts.route.js";
import { jwt } from "hono/jwt";
import { JWT_ALGORITHM } from "../libs/token.js";
import { tokenDecoder } from "../middlewares/token-decoder.js";

const privateRoutes = new Hono<ContextWithPrisma>();

privateRoutes.use(
  "*",
  jwt({
    secret: process.env.JWT_SECRET || "default-secret",
    alg: JWT_ALGORITHM,
  }),
  tokenDecoder
);

privateRoutes.route("/me", meRoutes);
privateRoutes.route("/posts", postsRoutes.postsPrivateRoutes);

export default privateRoutes;
