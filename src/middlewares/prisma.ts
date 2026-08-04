import type { Context, Next } from "hono";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { withAccelerate } from "@prisma/extension-accelerate";
import { env } from "../configs/env.js";

const databaseUrl = env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter }).$extends(withAccelerate());

export function withPrisma(c: Context, next: Next) {
  if (!c.get("prisma")) {
    c.set("prisma", prisma);
  }
  return next();
}
