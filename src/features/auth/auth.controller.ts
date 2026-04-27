import { Context } from "hono";
import { ContextWithPrisma } from "../../types/app.js";
import * as authSchema from "./auth.schema.js";
import * as authRepository from "./auth.repository.js";
import z from "zod";
import { fail, ok } from "../../libs/response.js";
import { passwordStrength } from "../../libs/password-strength-checker.js";
import { compareHash, hash } from "../../libs/hash.js";
import { generateAccessToken, generateRefreshToken } from "../../libs/token.js";
import { getCookie, setCookie } from "hono/cookie";

/** REGISTER */
export const register = async (c: Context<ContextWithPrisma>) => {
  const body = await c.req.json<z.infer<typeof authSchema.registerSchema>>();
  const prisma = c.get("prisma");

  // Check password strength
  const passwordStrengthResult = passwordStrength(body.password);
  if (passwordStrengthResult.score < 5) {
    return fail({
      c,
      message:
        "Password is not strong enough, it should be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and symbols.",
      status: 400,
    });
  }

  // Check if user already exists
  const isUserExists = await authRepository.findEmail(prisma, body.email);
  if (isUserExists !== null) {
    return fail({
      c,
      message: "User already exists",
      status: 409,
    });
  }

  // Hash the password before saving the user
  const data = { ...body, password: await hash(body.password) };
  const newUser = await authRepository.register(prisma, data);

  return ok({ c, data: newUser });
};

/** LOGIN */
const REFRESH_TOKEN_EXPIRATION_DAYS = 7;
export const login = async (c: Context<ContextWithPrisma>) => {
  const body = await c.req.json<z.infer<typeof authSchema.loginSchema>>();
  const prisma = c.get("prisma");

  // Check if user exists
  const userData = await authRepository.findEmail(prisma, body.email);
  if (userData === null) {
    return fail({
      c,
      message: "Email or password is incorrect",
      status: 404,
    });
  }

  // Check password is correct or not
  const isPasswordValid = userData.password
    ? compareHash(body.password, userData.password)
    : true; // If password is null, it means the user logged in with OAuth, so we can skip password check
  if (!isPasswordValid) {
    return fail({
      c,
      message: "Email or password is incorrect",
      status: 404,
    });
  }

  const refreshToken = generateRefreshToken();
  const expired = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRATION_DAYS * 24 * 60 * 60 * 1000,
  );

  const authData = {
    userId: userData.id,
    refreshToken,
    expired,
  };

  await authRepository.saveRefreshToken(prisma, authData);

  const accessToken = await generateAccessToken(userData.id, userData.email);

  setCookie(c, "refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: REFRESH_TOKEN_EXPIRATION_DAYS * 24 * 60 * 60, // in seconds
    path: "/auth/refresh", // Only send the cookie to the refresh endpoint
  });

  return ok({
    c,
    data: {
      accessToken,
    },
  });
};

/** REGENERATE ACCESS TOKEN */
export const getAccessToken = async (c: Context<ContextWithPrisma>) => {
  const prisma = c.get("prisma");

  const refreshToken = getCookie(c, "refreshToken");

  if (!refreshToken) {
    return fail({
      c,
      message: "Unauthorized",
      status: 401,
    });
  }

  const storedTokenData = await authRepository.getRefreshToken(
    prisma,
    refreshToken,
  );

  if (!storedTokenData) {
    return fail({
      c,
      message: "Invalid refresh token",
      status: 401,
    });
  }

  const isRefreshTokenExpired = storedTokenData?.expiresAt
    ? storedTokenData.expiresAt.getTime() < Date.now()
    : true;

  if (isRefreshTokenExpired) {
    return fail({
      c,
      message: "Invalid refresh token",
      status: 401,
    });
  }

  const isRefreshTokenValid = await compareHash(
    refreshToken,
    storedTokenData.token,
  );

  if (!isRefreshTokenValid || storedTokenData.revoked) {
    return fail({
      c,
      message: "Invalid refresh token",
      status: 401,
    });
  }

  const accessToken = await generateAccessToken(
    storedTokenData.userId,
    storedTokenData.user.email,
  );

  return ok({
    c,
    data: {
      accessToken,
    },
  });
};

/** LOGOUT */
export const logout = async (c: Context<ContextWithPrisma>) => {
  const prisma = c.get("prisma");

  const refreshToken = getCookie(c, "refreshToken");
  let storedTokenData = null;
  if (refreshToken) {
    storedTokenData = await authRepository.getRefreshToken(
      prisma,
      refreshToken,
    );

    // Clear the refresh token cookie
    setCookie(c, "refreshToken", "", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 0, // Expire the cookie immediately
    });
  }

  if (!storedTokenData) {
    return ok({ c, data: null });
  }

  await authRepository.revokeRefreshToken(prisma, storedTokenData.id);

  return ok({ c, data: null });
};
