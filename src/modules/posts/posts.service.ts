import { PrismaClient } from "../../generated/prisma/client.js";
import { smallAvatar } from "../../libs/avatar.js";
import * as postsRepository from "./posts.repository.js";

export const getPostsList = async ({
  prisma,
  limit,
  page,
  username,
  search,
}: {
  prisma: PrismaClient;
  page: number | string;
  limit: number | string;
  username?: string;
  search?: string;
}) => {
  const pageInt = isNaN(Number(page)) || Number(page) === 0 ? 1 : Number(page);
  const limitInt =
    isNaN(Number(limit)) || Number(limit) === 0 ? 10 : Number(limit);
  const take = limitInt;
  const skip = (pageInt - 1) * take;

  const { posts, total } = await postsRepository.getAllPosts(prisma, {
    take,
    skip,
    username,
    isPublished: true,
    search,
  });

  const adjustedPostData = posts.map((post) => {
    return {
      ...post,
      tags: post.tags.map((tag) => tag.tag),
      author: {
        ...post.author,
        avatar: post.author.avatar ? smallAvatar(post.author.avatar) : null,
      },
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
