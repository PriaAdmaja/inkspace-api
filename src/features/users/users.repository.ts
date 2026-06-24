import { PrismaClient } from "../../generated/prisma/client.js";

export const getUserPosts = async (
  prisma: PrismaClient,
  {
    take = 10,
    skip = 0,
    username,
    isPublished,
  }: { take?: number; skip?: number; username?: string; isPublished?: boolean },
) => {
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: {
        username,
        isPublished,
      },
      select: {
        id: true,
        title: true,
        content: true,
        excerp: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take,
      skip,
    }),

    prisma.post.count({
      where: {
        username,
        isPublished,
      },
    }),
  ]);

  return { posts, total };
};