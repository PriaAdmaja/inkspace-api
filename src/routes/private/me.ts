import { Hono } from "hono";
import { ContextWithPrisma } from "../../types/app.js";
import { withPrisma } from "../../lib/prisma.js";
import { getMe, updateMe } from "../../features/users/me/index.js";
import { zValidator } from "@hono/zod-validator";
import { updateMeSchema } from "../../features/users/me/schema.js";

const meRoutes = new Hono<ContextWithPrisma>();

meRoutes.get("/", withPrisma, getMe);
meRoutes.patch("/", withPrisma, zValidator("json", updateMeSchema), updateMe);

export default meRoutes;
