import * as postsRepository from "./posts.repository.js";
import * as meRepository from "../../features/users/me/me.repository.js";
import { ContextWithPrisma } from "../../types/app.js";
import { fail, ok } from "../../libs/response.js";
import z from "zod";
import { postSchema } from "./posts.schema.js";
import { Context } from "hono";

export const getAllPosts = async (c: Context<ContextWithPrisma>) => {
  const prisma = c.get("prisma");

  const { page = 1, limit = 10 } = c.req.query();

  const pageInt = isNaN(Number(page)) ? 1 : Number(page);
  const limitInt = isNaN(Number(limit)) ? 10 : Number(limit);
  const take = limitInt;
  const skip = (pageInt - 1) * take;

  const { posts, total } = await postsRepository.getAllPosts(prisma, {
    take,
    skip,
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

export const getPostById = async (c: Context<ContextWithPrisma>) => {
  const prisma = c.get("prisma");
  const { id } = c.req.param();

  if (!id) {
    return fail({
      c,
      message: "Post ID is required",
      status: 400,
    });
  }

  const post = await postsRepository.getPostById(prisma, id);

  if (!post) {
    return fail({
      c,
      message: "Post not found",
      status: 404,
    });
  }

  const adjustedPostData = {
    ...post,
    tags: post.tags.map((tag) => tag.tag),
  };

  return ok({ c, data: adjustedPostData });
};

export const createPost = async (c: Context<ContextWithPrisma>) => {
  const prisma = c.get("prisma");
  const user = c.get("authUser");
  const email = user.session.user?.email;

  if (!email) {
    return fail({
      c,
      message: "User not found",
      status: 401,
    });
  }

  const userData = await meRepository.getMe(prisma, email);

  if (!userData) {
    return fail({
      c,
      message: "User not found",
      status: 401,
    });
  }

  const body = await c.req.json<z.infer<typeof postSchema>>();

  const post = await postsRepository.createPost(prisma, {
    title: body.title,
    content: body.content,
    authorId: userData.id,
    tags: body.tags,
  });

  if (!post) {
    return fail({
      c,
      message: "Failed to create post",
      status: 500,
    });
  }

  const adjustedPostData = {
    ...post,
    tags: post.tags.map((tag) => tag.tag),
  };

  return ok({ c, data: adjustedPostData });
};

export const updatePost = async (c: Context<ContextWithPrisma>) => {
  const prisma = c.get("prisma");
  const { id } = c.req.param();

  if (!id) {
    return fail({
      c,
      message: "Post ID is required",
      status: 400,
    });
  }

  const body = await c.req.json<z.infer<typeof postSchema>>();

  const post = await postsRepository.updatePost(prisma, id, {
    title: body.title,
    content: body.content,
    tags: body.tags,
  });

  if (!post) {
    return fail({
      c,
      message: "Post not found",
      status: 404,
    });
  }

  const adjustedPostData = {
    ...post,
    tags: post.tags.map((tag) => tag.tag),
  };

  return ok({ c, data: adjustedPostData });
};
