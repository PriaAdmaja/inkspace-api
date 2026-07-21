import { Prisma } from "../../generated/prisma/client.js";
import { postAuthorSelect } from "./users.select.js";

export const postSelect = {
  id: true,
  title: true,
  content: true,
  excerpt: true,
  isPublished: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: postAuthorSelect,
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
} satisfies Prisma.PostSelect;

export const postSingleSelect = {
  ...postSelect,
  seoTitle: true,
  seoDescription: true,
  publishedAt: true
} satisfies Prisma.PostSelect;
