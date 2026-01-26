import { Context } from "hono";
import * as postsRepository from "./posts.repository.js";
import { ContextWithPrisma } from "../../types/app.js";
import { ok } from "../../libs/response.js";

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

  const lastPage = Math.ceil(total / limitInt);

  return ok({
    c,
    data: posts,
    meta: {
      current_page: pageInt,
      last_page: lastPage,
      limit: limitInt,
      total,
    },
  });
};
