import * as postsRepository from "./posts.repository.js";
import * as meRepository from "../../features/users/me/me.repository.js";
import { ContextWithPrisma } from "../../types/app.js";
import { fail, ok } from "../../libs/response.js";
import z from "zod";
import { postSchema } from "./posts.schema.js";
import { Context } from "hono";
import { PrismaClient } from "../../generated/prisma/client.js";

/**==== Post List ====*/
export const getPostsList = async ({
  prisma,
  limit,
  page,
  authorId,
  isPublished,
}: {
  prisma: PrismaClient;
  page: number | string;
  limit: number | string;
  isPublished?: boolean;
  authorId?: string;
}) => {
  const pageInt = isNaN(Number(page)) ? 1 : Number(page);
  const limitInt = isNaN(Number(limit)) ? 10 : Number(limit);
  const take = limitInt;
  const skip = (pageInt - 1) * take;

  const { posts, total } = await postsRepository.getAllPosts(prisma, {
    take,
    skip,
    authorId,
    isPublished,
  });

  const adjustedPostData = posts.map((post) => {
    return {
      ...post,
      tags: post.tags.map((tag) => tag.tag),
    };
  });

  const lastPage = Math.ceil(total / limitInt) || pageInt;

  return {
    data: adjustedPostData,
    meta: {
      current_page: pageInt,
      last_page: lastPage,
      limit: limitInt,
      total,
    },
  };
};

export const getAllPosts = async (c: Context<ContextWithPrisma>) => {
  const prisma = c.get("prisma");

  const { page = 1, limit = 10 } = c.req.query();

  const posts = await getPostsList({
    limit,
    page,
    prisma,
    isPublished: true,
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
  const { id: authorId } = c.req.param();

  const posts = await getPostsList({
    limit,
    authorId,
    page,
    prisma,
    isPublished: true, 
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

  const adjustedPostData = {
    ...post,
    tags: post.tags.map((tag) => tag.tag),
  };

  return ok({ c, data: adjustedPostData });
};

/** Create Post */

export const createPost = async (c: Context<ContextWithPrisma>) => {
  const prisma = c.get("prisma");
  const { id } = c.get("userData") || { id: undefined };

  if (!id) {
    return fail({
      c,
      message: "User not found",
      status: 401,
    });
  }

  const userData = await meRepository.getMe(prisma, id);

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
    excerp: body.excerp,
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
    excerp: body.excerp,
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
