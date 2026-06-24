import { PrismaClient, Prisma } from "../../generated/prisma/client.js";

type UserPostWithTags = Prisma.PostGetPayload<{
  select: {
    id: true;
    title: true;
    content: true;
    excerp: true;
    createdAt: true;
    updatedAt: true;
    author: {
      select: {
        id: true;
        username: true;
        avatar: true;
      };
    };
    tags: {
      select: {
        tag: {
          select: {
            name: true;
            slug: true;
          };
        };
      };
    };
  };
}>;

export const getUserPosts = async (
  prisma: PrismaClient,
  {
    take = 10,
    skip = 0,
    username,
    isPublished,
  }: { take?: number; skip?: number; username?: string; isPublished?: boolean },
): Promise<{ posts: UserPostWithTags[]; total: number }> => {
  const where = {
    ...(username ? { author: { username } } : {}),
    ...(typeof isPublished !== "undefined" ? { isPublished } : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
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
      where,
    }),
  ]);

  return { posts, total };
};