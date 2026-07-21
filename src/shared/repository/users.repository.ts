import { PrismaClient } from "../../generated/prisma/client.js";
import { postSelect } from "../select/posts.select.js";
import { PostReturned } from "../types/posts.type.js";

export const findUsername = async (prisma: PrismaClient, username: string) => {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });
  return user;
};

export const findEmail = async (prisma: PrismaClient, email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  return user;
};

export const getUserPosts = async (
  prisma: PrismaClient,
  {
    take = 10,
    skip = 0,
    username,
    isPublished,
  }: { take?: number; skip?: number; username?: string; isPublished?: boolean },
): Promise<{ posts: PostReturned[]; total: number }> => {
  const where = {
    ...(username ? { author: { username } } : {}),
    ...(typeof isPublished !== "undefined" ? { isPublished } : {}),
  };

  const orderBy: Record<string, string> = {};

  switch (isPublished) {
    case true:
      orderBy.publishedAt = "desc";
      break;
    case false:
      orderBy.createdAt = "desc";

      break;
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      select: postSelect,
      orderBy,
      take,
      skip,
    }),

    prisma.post.count({
      where,
    }),
  ]);

  return { posts, total };
};
