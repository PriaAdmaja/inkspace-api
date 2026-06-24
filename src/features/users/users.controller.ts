import { Context } from "hono";
import * as usersRepository from "./users.repository.js";
import * as usersSchema from "./users.schema.js";
import { ContextWithPrisma } from "../../types/app.js";
import { fail, ok } from "../../libs/response.js";
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

export const getUserData = async (c: Context<ContextWithPrisma>) => {
  const prisma = c.get("prisma");
  const { username } = c.req.param();

  if (!username) {
    return fail({ c, message: "Invalid username" });
  }

  const userData = await usersRepository.findUsername(prisma, username);

  if (!userData) {
    return fail({
      c,
      message: "User not found",
    });
  }

  return ok({
    c,
    data: {
      id: userData.id,
      name: userData.name,
      username: userData.username,
      about: userData.about,
      avatar: userData.avatar,
    },
  });
};
