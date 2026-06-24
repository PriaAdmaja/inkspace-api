import z from "zod";
import { PrismaClient } from "../../generated/prisma/client.js";
import { postSchema } from "./posts.schema.js";
import { generateTagSlug, generateTitleCase } from "../../libs/tags.js";

export const getAllPosts = async (
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

type PostSchema = z.infer<typeof postSchema>;
export const createPost = async (
  prisma: PrismaClient,
  {
    title,
    content,
    authorId,
    excerp,
    tags,
    isPublished
  }: {
    title: PostSchema["title"];
    content: PostSchema["content"];
    authorId: string;
    excerp: string;
    tags: PostSchema["tags"];
    isPublished: PostSchema['isPublished']
  },
) => {
  const tagsData = tags
    ? tags.map((tag) => {
        return {
          name: generateTitleCase(tag),
          slug: generateTagSlug(tag),
        };
      })
    : [];

  const post = await prisma.$transaction(async (tx) => {
    const existingTags = await tx.tag.findMany({
      where: {
        slug: {
          in: tagsData.map((tag) => tag.slug),
        },
      },
    });

    const existingTagsSlugs = existingTags.map((tag) => tag.slug);

    const tagsToCreate = tagsData.filter(
      (tag) => !existingTagsSlugs.includes(tag.slug),
    );

    if (tagsToCreate.length > 0) {
      await tx.tag.createMany({
        data: tagsToCreate.map((tag) => ({
          name: tag.name,
          slug: tag.slug,
        })),
        skipDuplicates: true,
      });
    }

    const allTags = await tx.tag.findMany({
      where: {
        slug: {
          in: tagsData.map((tag) => tag.slug),
        },
      },
    });

    const post = await tx.post.create({
      data: {
        title,
        content,
        excerp,
        isPublished,
        author: {
          connect: {
            id: authorId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    await tx.postTag.createMany({
      data: allTags.map((tag) => ({
        postId: post.id,
        tagId: tag.id,
      })),
    });

    const updatedPost = await tx.post.findUnique({
      where: {
        id: post.id,
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
    });

    return updatedPost;
  });

  return post;
};

export const getPostById = async (prisma: PrismaClient, id: string) => {
  const post = await prisma.post.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      title: true,
      content: true,
      excerp: true,
      createdAt: true,
      isPublished: true,
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
  });

  return post;
};

export const updatePost = async (
  prisma: PrismaClient,
  id: string,
  data: z.infer<typeof postSchema>,
) => {
  const tagsData = data.tags
    ? data.tags.map((tag) => {
        return {
          name: generateTitleCase(tag),
          slug: generateTagSlug(tag),
        };
      })
    : [];

  const post = await prisma.$transaction(async (tx) => {
    // Check if post exists before attempting update
    const postExists = await tx.post.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!postExists) {
      return null;
    }

    const existingTags = await tx.tag.findMany({
      where: {
        slug: {
          in: tagsData.map((tag) => tag.slug),
        },
      },
    });

    const existingTagsSlugs = existingTags.map((tag) => tag.slug);

    const tagsToCreate = tagsData.filter(
      (tag) => !existingTagsSlugs.includes(tag.slug),
    );

    if (tagsToCreate.length > 0) {
      await tx.tag.createMany({
        data: tagsToCreate.map((tag) => ({
          name: tag.name,
          slug: tag.slug,
        })),
        skipDuplicates: true,
      });
    }

    const allTags = await tx.tag.findMany({
      where: {
        slug: {
          in: tagsData.map((tag) => tag.slug),
        },
      },
    });

    await tx.post.update({
      where: {
        id,
      },
      data: {
        title: data.title,
        content: data.content,
        excerp: data.excerp,
        isPublished: data.isPublished,
      },
      select: {
        id: true,
      },
    });

    await tx.postTag.deleteMany({
      where: {
        postId: id,
      },
    });

    await tx.postTag.createMany({
      data: allTags.map((tag) => ({
        postId: id,
        tagId: tag.id,
      })),
    });

    const updatedPost = await tx.post.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        title: true,
        content: true,
        excerp: true,
        isPublished: true,
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
    });

    return updatedPost;
  });

  return post;
};

export const publishPost = async (prisma: PrismaClient, id: string) => {
  await prisma.post.update({
    where: {
      id,
    },
    data: {
      isPublished: true,
    },
  });
};
