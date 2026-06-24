import { Context } from "hono";
import { ContextWithPrisma } from "../../types/app.js";
import { fail, ok } from "../../libs/response.js";
import { compareHash, hash } from "../../libs/hash.js";
import * as meRepository from "./me.repository.js";
import z from "zod";
import * as meSchema from "./me.schema.js";

export const getMe = async (c: Context<ContextWithPrisma>) => {
  const prisma = c.get("prisma");
  const userData = c.get("userData");

  const userId = userData?.id || "";

  const user = await meRepository.getMe(prisma, userId);

  if (!user) {
    return fail({
      c,
      message: "Failed to retrieve user data",
      status: 404,
    });
  }

  return ok({
    c,
    data: { user },
  });
};

export const updateMe = async (c: Context<ContextWithPrisma>) => {
  const userData = c.get("userData");

  if (!userData) {
    return fail({
      c,
      message: "Invalid or missing access token",
      status: 401,
    });
  }

  const body = await c.req.json<z.infer<typeof meSchema.updateMeSchema>>();
  const prisma = c.get("prisma");
  const email = userData.email;

  const updateMe = await meRepository.updateMe(prisma, email, body);

  return ok({ c, data: updateMe });
};

export const updatePassword = async (c: Context<ContextWithPrisma>) => {
  const { email } = c.get("userData") || { email: "" };

  const body =
    await c.req.json<z.infer<typeof meSchema.updatePasswordSchema>>();
  const prisma = c.get("prisma");

  const user = await meRepository.getMePassword(prisma, email);

  if (!user?.password) {
    return fail({
      c,
      message: "Password login not available for this account",
      status: 400,
    });
  }

  if (!compareHash(body.currentPassword, user.password)) {
    return fail({
      c,
      message: "Current password is incorrect",
      status: 401,
    });
  }

  const updatePassword = await meRepository.updatePassword(
    prisma,
    email,
    hash(body.newPassword),
  );

  return ok({ c, data: updatePassword });
};

export const getMePosts = async (c: Context<ContextWithPrisma>) => {
  const prisma = c.get("prisma");

  const { page = 1, limit = 10, isPublished } = c.req.query();
  const { username } = c.get("userData") || { id: undefined };

  if (!username) {
    return fail({
      c,
      message: "You are unauthorized",
      status: 401,
    });
  }

  const pageInt = isNaN(Number(page)) ? 1 : Number(page);
  const limitInt = isNaN(Number(limit)) ? 10 : Number(limit);
  const take = limitInt;
  const skip = (pageInt - 1) * take;

  const isPublishedValue = isPublished ? isPublished === "true" : undefined;
  const { posts, total } = await meRepository.getAllPosts(prisma, {
    isPublished: isPublishedValue,
    take,
    skip,
    username,
  });

  const adjustedPostData = posts.map((post) => {
    return {
      ...post,
      tags: post.tags.map((tag) => tag.tag),
    };
  });

  const lastPage = Math.ceil(total / limitInt) || pageInt;

  return ok({
    c,
    data: adjustedPostData,
    meta: {
      current_page: pageInt,
      last_page: lastPage,
      limit: limitInt,
      total,
    },
  });
};
