import { Prisma } from "../../generated/prisma/client.js";

export const postAuthorSelect = {
  name: true,
  username: true,
  avatar: true,
} satisfies Prisma.UserSelect;

export const userSelect = {
  id: true,
  name: true,
  username: true,
  email: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
  password: true,
  about: true,
  emailVerified: true,
  verificationToken: {
    select: {
      allowToResend: true,
    },
  },
} satisfies Prisma.UserSelect;
