import z from "zod";
import { PrismaClient } from "../../generated/prisma/client.js";
import * as authSchema from "./auth.schema.js";
import { hash } from "../../libs/hash.js";
import { sha256 } from "../../libs/crypto.js";
import { generateEmailVerificationToken } from "../../libs/token.js";

const verificationTokenResendTime = 5 * 60 * 1000; // 5 minutes

export const register = async (
  prisma: PrismaClient,
  data: z.infer<typeof authSchema.registerSchema>,
) => {
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: data.password,
        name: data.name,
      },
    });

    const verificationToken = await generateEmailVerificationToken(
      user.id,
      user.email,
      user.username,
    );

    const resendTime = Date.now() + verificationTokenResendTime;
    await tx.verificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        allowToResend: new Date(resendTime),
      },
    });

    return { user, verificationToken };
  });
  return result;
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
          username: true,
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

export const getUserVerificationToken = async (
  prisma: PrismaClient,
  userId: string,
) => {
  const tokenData = await prisma.verificationToken.findFirst({
    where: {
      userId,
    },
  });
  return tokenData;
};

export const updateUserVerificationToken = async (
  prisma: PrismaClient,
  userId: string,
  newToken: string,
) => {
  const resendTime = Date.now() + verificationTokenResendTime;
  await prisma.verificationToken.update({
    where: {
      userId,
    },
    data: {
      token: newToken,
      allowToResend: new Date(resendTime),
    },
  });
};

export const deleteUserVerificationToken = async (
  prisma: PrismaClient,
  tokenId: string,
) => {
  const updatedUserData = await prisma.$transaction(async (tx) => {
    const token = await tx.verificationToken.delete({
      where: {
        id: tokenId,
      },
    });

    const user = await tx.user.update({
      where: {
        id: token.userId,
      },
      data: {
        emailVerified: new Date(),
      },
    });

    return user;
  });

  return updatedUserData;
};
