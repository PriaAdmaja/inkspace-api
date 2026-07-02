import { PrismaClient } from "../../generated/prisma/client.js";
import { generatePostResponse } from "../mapper/posts.mapper.js";
import * as usersRepository from "../repository/users.repository.js";

export const getUserPosts = async ({
  prisma,
  limit,
  page,
  username,
  isPublished,
}: {
  prisma: PrismaClient;
  page: number | string;
  limit: number | string;
  username?: string;
  isPublished?: boolean;
}) => {
  const pageInt = isNaN(Number(page)) ? 1 : Number(page);
  const limitInt = isNaN(Number(limit)) ? 10 : Number(limit);
  const take = limitInt;
  const skip = (pageInt - 1) * take;

  const { posts, total } = await usersRepository.getUserPosts(prisma, {
    take,
    skip,
    username,
    isPublished,
  });

  const adjustedPostData = posts.map((post) => {
    return generatePostResponse(post);
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
