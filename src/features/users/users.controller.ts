import { Context } from "hono";
import * as sharedUsersRepository from "../../shared/repository/users.repository.js";
import * as sharedPostServices from "../../shared/services/posts.services.js";
import * as usersSchema from "./users.schema.js";
import { ContextWithPrisma } from "../../types/app.js";
import { fail, ok } from "../../libs/response.js";
import z from "zod";

export const checkingUsername = async (c: Context<ContextWithPrisma>) => {
  const prisma = c.get("prisma");
  const { username } =
    await c.req.json<z.infer<typeof usersSchema.checkingUsernameSchema>>();

  const userData = await sharedUsersRepository.findUsername(prisma, username);

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

  const userData = await sharedUsersRepository.findUsername(prisma, username);

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

export const getUserPosts = async (c: Context<ContextWithPrisma>) => {
  const prisma = c.get("prisma");

  const { page = 1, limit = 10 } = c.req.query();
  const { username } = c.get("userData") || { id: undefined };

  if (!username) {
    return fail({
      c,
      message: "You are unauthorized",
      status: 401,
    });
  }

  const { data, meta } = await sharedPostServices.getUserPosts({
    prisma,
    limit,
    page,
    username,
    isPublished: false
  });

  return ok({
    c,
    data,
    meta,
  });
};
