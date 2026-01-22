import { PrismaClient } from "../generated/prisma/client.js";

export type ContextWithPrisma = {
  Variables: {
    prisma: PrismaClient;
  };
  Bindings: {
    AUTH_SECRET: string;
    GITHUB_ID: string;
    GITHUB_SECRET: string;
  };
};