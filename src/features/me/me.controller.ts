import { Context } from "hono";
import { ContextWithPrisma } from "../../types/app.js";
import { fail, ok } from "../../libs/response.js";
import { compareHash, hash } from "../../libs/hash.js";
import * as meRepository from "./me.repository.js";
import * as sharedPostsRepository from "./../../shared/services/posts.services.js";
import z from "zod";
import * as meSchema from "./me.schema.js";
import { imageUploader } from "../../utils/uploader.js";

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

  const prisma = c.get("prisma");
  const parseBody = await c.req.parseBody();

  const avatarFile = parseBody.avatar as File | undefined;
  const uploadedAvatar = avatarFile ? await imageUploader(avatarFile, `avatar_${userData.username}`) : undefined;

  const data: meSchema.UpdateMeData = {
    name: parseBody.name as string,
    about: parseBody.about as string | null,
    avatar: uploadedAvatar?.secure_url || null,
  };

  const email = userData.email;
  const updateMe = await meRepository.updateMe(prisma, email, data);

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

  const isPublishedValue = isPublished ? isPublished === "true" : undefined;
  const { data, meta } = await sharedPostsRepository.getUserPosts({
    prisma,
    limit,
    page,
    username,
    isPublished: isPublishedValue,
  });

  return ok({
    c,
    data,
    meta,
  });
};
