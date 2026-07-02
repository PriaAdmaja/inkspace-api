import { Prisma } from "../../generated/prisma/client.js";

export const postAuthorSelect = {
  name: true,
  username: true,
  avatar: true,
} satisfies Prisma.UserSelect;
