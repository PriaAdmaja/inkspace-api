import z from "zod";
import { PrismaClient } from "../../generated/prisma/client.js";
import * as authSchema from "./auth.schema.js";
import { hash } from "../../libs/hash.js";
import { sha256 } from "../../libs/crypto.js";

export const register = async (
  prisma: PrismaClient,
  data: z.infer<typeof authSchema.registerSchema>,
) => {
  const user = await prisma.user.create({
    data: {
      email: data.email,
      username: data.username,
      password: data.password,
    },
    select: {
      id: true,
      email: true,
      username: true,
      avatar: true,
      about: true,
      createdAt: true,
      updatedAt: true,
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

export const saveRefreshToken = async (
  prisma: PrismaClient,
  data: z.infer<typeof authSchema.refreshTokenSchema>,
) => {
  const { userId, refreshToken, expired } = data;
  const hashedRefreshToken = hash(refreshToken);
  const lookupId = sha256(refreshToken);

  await prisma.refreshToken.create({
    data: {
      userId,
      token: hashedRefreshToken,
      lookupId,
      expiresAt: expired,
    },
  });
};

export const getRefreshToken = async (prisma: PrismaClient, token: string) => {
  const lookupId = sha256(token);
  const account = await prisma.refreshToken.findFirst({
    where: {
      lookupId,
    },
    select: {
      id: true,
      userId: true,
      lookupId: true,
      token: true,
      user: {
        select: {
          email: true,
        },
      },
      expiresAt: true,
      revoked: true,
    },
  });

  return account;
};

export const revokeRefreshToken = async (
  prisma: PrismaClient,
  tokenId: string,
) => {
  await prisma.refreshToken.update({
    where: {
      id: tokenId,
    },
    data: {
      revoked: true,
    },
  });
};

export const clearUnusedToken = async (prisma: PrismaClient) => {
  await prisma.refreshToken.deleteMany({
    where: {
      OR: [{ revoked: true }, { createdAt: { lt: new Date() } }],
    },
  });
};
