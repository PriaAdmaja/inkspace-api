import { PrismaAdapter } from "@auth/prisma-adapter";
import type { AuthConfig } from "@auth/core";
import GitHub from "@auth/core/providers/github";
import Credentials from "@auth/core/providers/credentials";
import { prisma } from "./prisma.js";
import { ContextWithPrisma } from "../types/app.js";

export const authConfig = (env: ContextWithPrisma["Bindings"]): AuthConfig => {
  return {
    adapter: PrismaAdapter(prisma),
    secret: env?.AUTH_SECRET,
    providers: [
      GitHub({
        clientId: env?.GITHUB_ID,
        clientSecret: env?.GITHUB_SECRET,
      }),
      Credentials({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }
          const user = await prisma.user.findFirst({
            where: {
              email: credentials.email,
            },
          });
          if (!user) {
            return null;
          }
          if (user.password !== credentials.password) {
            return null;
          }
          return user;
        },
      }),
    ],
    session: {
      strategy: "jwt",
    },
    callbacks: {
      async session({ session }) {
        return session;
      },
    },
    trustHost: true,
  };
};
