import { Prisma } from "../../generated/prisma/client.js";
import { postAuthorSelect } from "./users.select.js";

export const postSelect = {
  id: true,
  title: true,
  content: true,
  excerpt: true,
  createdAt: true,
  isPublished: true,
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
