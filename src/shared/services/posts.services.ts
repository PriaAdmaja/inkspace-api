import { PrismaClient } from "../../generated/prisma/client.js";
import * as usersRepository from "../../features/users/users.repository.js";

export const getUserPosts = async ({
  prisma,
  limit,
  page,
  username,
}: {
  prisma: PrismaClient;
  page: number | string;
  limit: number | string;
  username?: string;
}) => {
  const pageInt = isNaN(Number(page)) ? 1 : Number(page);
  const limitInt = isNaN(Number(limit)) ? 10 : Number(limit);
  const take = limitInt;
  const skip = (pageInt - 1) * take;

  const { posts, total } = await usersRepository.getUserPosts(prisma, {
    take,
    skip,
    username,
    isPublished: true,
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
