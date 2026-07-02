import { Hono } from "hono";
import { ContextWithPrisma } from "../types/app.js";
import meRoutes from "../modules/me/me.routes.js";
import postsRoutes from "../modules/posts/posts.routes.js";
import { jwt } from "hono/jwt";
import { JWT_ALGORITHM } from "../libs/token.js";
import { tokenDecoder } from "../middlewares/token-decoder.js";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret"

const privateRoutes = new Hono<ContextWithPrisma>();

privateRoutes.use(
  "*",
  jwt({
    secret: JWT_SECRET,
    alg: JWT_ALGORITHM,
  }),
  tokenDecoder
);

privateRoutes.route("/me", meRoutes);
privateRoutes.route("/posts", postsRoutes.postsPrivateRoutes);

export default privateRoutes;
