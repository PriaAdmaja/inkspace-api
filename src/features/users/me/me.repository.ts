import z from "zod";
import { PrismaClient } from "../../../generated/prisma/client.js";
import { updateMeSchema } from "./me.schema.js";

export const getMe = async (prisma: PrismaClient, email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
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

export const updateMe = async (
  prisma: PrismaClient,
  email: string,
  data: z.infer<typeof updateMeSchema>,
) => {
  const user = await prisma.user.update({
    where: {
      email,
    },
    data: {
      username: data.username,
      avatar: data.avatar,
      about: data.about,
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

export const getMePassword = async (prisma: PrismaClient, email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      password: true,
    },
  });

  return user;
};

export const updatePassword = async (
  prisma: PrismaClient,
  email: string,
  password: string,
) => {
  const user = await prisma.user.update({
    where: {
      email,
    },
    data: {
      password,
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
