import { Context } from "hono";
import * as usersRepository from "./users.repository.js";
import * as usersSchema from "./users.schema.js";
import { ContextWithPrisma } from "../../types/app.js";
import { ok } from "../../libs/response.js";
import z from "zod";

export const checkingUsername = async (c: Context<ContextWithPrisma>) => {
  const prisma = c.get("prisma");
  const { username } =
    await c.req.json<z.infer<typeof usersSchema.checkingUsernameSchema>>();

  const userData = await usersRepository.findUsername(prisma, username);

  return ok({
    c,
    data: {
      isAvailable: userData === null,
    },
  });
};
