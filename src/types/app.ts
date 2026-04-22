import { PrismaClient } from "../generated/prisma/client.js";

export type UserData = {
  id: string;
  email: string;
};

export type ContextWithPrisma = {
  Variables: {
    prisma: PrismaClient;
    userData?: UserData;
  };
  Bindings: {
    DATABASE_URL: string;
    AUTH_SECRET: string;
    GITHUB_ID: string;
    GITHUB_SECRET: string;
  };
  id: number;
  email: string;
};
