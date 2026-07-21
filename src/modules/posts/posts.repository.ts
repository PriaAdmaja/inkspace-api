import z from "zod";
import { PrismaClient, Prisma } from "../../generated/prisma/client.js";
import { postSchema } from "./posts.schema.js";
import { generateTagSlug, generateTitleCase } from "../../libs/tags.js";
import { postSelect } from "../../shared/select/posts.select.js";

export type GetAllPostProps = {
  take?: number;
  skip?: number;
  username?: string;
  isPublished?: boolean;
  search?: string;
  sortBy?: "created" | "updated" | "published";
};

export const getAllPosts = async (
  prisma: PrismaClient,
  {
    take = 10,
    skip = 0,
    username,
    isPublished,
    search,
    sortBy,
  }: GetAllPostProps,
) => {
  const where: Prisma.PostWhereInput = {
    ...(username ? { author: { username } } : {}),
    ...(typeof isPublished !== "undefined" ? { isPublished } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { excerpt: { contains: search, mode: "insensitive" as const } },
            {
              tags: {
                some: {
                  tag: {
                    name: { contains: search, mode: "insensitive" as const },
                  },
                },
              },
            },
          ],
        }
      : {}),
  };

  const orderBy: Record<string, string> = {};
  switch (sortBy) {
    case "created":
      orderBy.createdAt = "desc";
      break;
    case "updated":
      orderBy.updatedAt = "desc";
      break;
    case "published":
      orderBy.publishedAt = "desc";
      break;

    default:
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

type PostSchema = z.infer<typeof postSchema>;
export const createPost = async (
  prisma: PrismaClient,
  {
    title,
    content,
    authorId,
    excerpt,
    tags,
    isPublished,
    seoDescription,
    seoTitle,
  }: {
    title: PostSchema["title"];
    content: PostSchema["content"];
    authorId: string;
    excerpt: string;
    tags: PostSchema["tags"];
    isPublished: PostSchema["isPublished"];
    seoTitle: PostSchema["seoTitle"];
    seoDescription: PostSchema["seoDescription"];
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
        excerpt,
        isPublished,
        seoDescription,
        seoTitle,
        publishedAt: isPublished ? new Date() : undefined,
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
      select: postSelect,
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
    select: postSelect,
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
      select: { id: true, isPublished: true },
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

    const isPublish =
      postExists.isPublished === false && data.isPublished === true;
    await tx.post.update({
      where: {
        id,
      },
      data: {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        isPublished: data.isPublished,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        publishedAt: isPublish ? new Date() : undefined,
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
      select: postSelect,
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
      publishedAt: new Date(),
    },
  });
};

export const deletePost = async (prisma: PrismaClient, id: string) => {
  await prisma.post.delete({
    where: {
      id,
    },
  });
};
