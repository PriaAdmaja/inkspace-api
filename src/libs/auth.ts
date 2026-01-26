import { PrismaAdapter } from "@auth/prisma-adapter";
import type { AuthConfig } from "@auth/core";
import GitHub from "@auth/core/providers/github";
import Credentials from "@auth/core/providers/credentials";
import { prisma } from "../middlewares/prisma.js";
import { comparePassword } from "./hash.js";

export const authConfig = (): AuthConfig => {
  return {
    adapter: PrismaAdapter(prisma),
    secret: process.env.AUTH_SECRET,
    providers: [
      GitHub({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
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

          const inputtedPassword =
            typeof credentials.password === "string"
              ? credentials.password
              : "";
          const savedPassword =
            typeof user.password === "string" ? user.password : "";
          const isPasswordValid = comparePassword(
            inputtedPassword,
            savedPassword,
          );

          if (!isPasswordValid) {
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
