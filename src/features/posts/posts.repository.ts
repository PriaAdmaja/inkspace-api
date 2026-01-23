import { PrismaClient } from "../../generated/prisma/client.js";

export const getAllPosts = async (
  prisma: PrismaClient,
  { take = 10, skip = 0 }: { take?: number; skip?: number },
) => {
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take,
      skip,
    }),
    prisma.post.count(),
  ]);

  return { posts, total };
};
