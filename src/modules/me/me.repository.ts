import z from "zod";
import { PrismaClient } from "../../generated/prisma/client.js";
import { registerSchema, UpdateMeData } from "./me.schema.js";

export const register = async (prisma: PrismaClient, data: z.infer<typeof registerSchema>) => {
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

export const getMe = async (prisma: PrismaClient, id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
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
  data: UpdateMeData,
) => {
  const user = await prisma.user.update({
    where: {
      email,
    },
    data: {
      avatar: data.avatar,
      about: data.about,
      name: data.name
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