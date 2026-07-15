import * as postsRepository from "./posts.repository.js";
import * as postsService from "./posts.service.js";
import * as sharedUsersRepository from "../../shared/repository/users.repository.js";
import { ContextWithPrisma } from "../../types/app.js";
import { fail, ok } from "../../libs/response.js";
import z from "zod";
import { postSchema } from "./posts.schema.js";
import { Context } from "hono";
import { generatePostResponse } from "../../shared/mapper/posts.mapper.js";

/**==== Post List ====*/
export const getAllPosts = async (c: Context<ContextWithPrisma>) => {
  const prisma = c.get("prisma");

  const { page = 1, limit = 10, search } = c.req.query();

  const posts = await postsService.getPostsList({
    limit,
    page,
    prisma,
    search
  });

  return ok({
    c,
    data: posts.data,
    meta: posts.meta,
  });
};

export const getUserPosts = async (c: Context<ContextWithPrisma>) => {
  const prisma = c.get("prisma");
  const { page = 1, limit = 10 } = c.req.query();
  const { username } = c.req.param();

  if (!username) {
    return fail({
      c,
      message: "User not found",
      status: 400,
    });
  }

  const posts = await postsService.getPostsList({
    limit,
    username,
    page,
    prisma,
  });

  return ok({
    c,
    data: posts.data,
    meta: posts.meta,
  });
};

/** Post by ID */

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

  return ok({ c, data: generatePostResponse(post) });
};

/** Create Post */

export const createPost = async (c: Context<ContextWithPrisma>) => {
  const prisma = c.get("prisma");
  const { username } = c.get("userData") || { id: undefined };

  if (!username) {
    return fail({
      c,
      message: "User not found",
      status: 401,
    });
  }

  const userData = await sharedUsersRepository.findUsername(prisma, username);

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
    excerpt: body.excerpt,
    tags: body.tags,
    isPublished: body.isPublished,
  });

  if (!post) {
    return fail({
      c,
      message: "Failed to create post",
      status: 500,
    });
  }

  return ok({ c, data: generatePostResponse(post) });
};

/** Update Post */
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
    excerpt: body.excerpt,
    tags: body.tags,
    isPublished: body.isPublished,
  });

  if (!post) {
    return fail({
      c,
      message: "Post not found",
      status: 404,
    });
  }

  return ok({ c, data: generatePostResponse(post) });
};

/** Publish Post */
export const publishPost = async (c: Context<ContextWithPrisma>) => {
  const prisma = c.get("prisma");
  const { id } = c.req.param();

  if (!id) {
    return fail({
      c,
      message: "Post ID is required",
      status: 400,
    });
  }

  await postsRepository.publishPost(prisma, id);

  return ok({ c, message: `Post ${id} is published succesfully`, data: null });
};
