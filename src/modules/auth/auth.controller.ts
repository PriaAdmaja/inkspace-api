import { Context } from "hono";
import { ContextWithPrisma } from "../../types/app.js";
import * as authSchema from "./auth.schema.js";
import * as authRepository from "./auth.repository.js";
import * as sharedUsersRepository from "../../shared/repository/users.repository.js";
import * as authService from "./auth.service.js";
import z from "zod";
import { fail, ok } from "../../libs/response.js";
import { passwordStrength } from "../../libs/password-strength-checker.js";
import { compareHash, hash } from "../../libs/hash.js";
import {
  generateAccessToken,
  generateEmailVerificationToken,
  generateRefreshToken,
} from "../../libs/token.js";
import { getCookie, setCookie } from "hono/cookie";
import { generateUserResponse } from "../../shared/mapper/users.mapper.js";
import { Jwt } from "hono/utils/jwt";

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
  const isEmailExists = await sharedUsersRepository.findEmail(
    prisma,
    body.email,
  );
  if (isEmailExists !== null) {
    return fail({
      c,
      message: "User already exists",
      status: 409,
    });
  }

  const isUsernameExists = await sharedUsersRepository.findUsername(
    prisma,
    body.username,
  );
  if (isUsernameExists !== null) {
    return fail({
      c,
      message: "Username already exists",
      status: 409,
    });
  }

  // Hash the password before saving the user
  const data = { ...body, password: hash(body.password) };
  const { user, verificationToken } = await authRepository.register(
    prisma,
    data,
  );

  authService.verificationSender({
    email: user.email,
    token: verificationToken,
    name: user.name,
  });

  return ok({ c, data: generateUserResponse(user, true) });
};

/** LOGIN */
const REFRESH_TOKEN_EXPIRATION_DAYS = 7;
export const login = async (c: Context<ContextWithPrisma>) => {
  const body = await c.req.json<z.infer<typeof authSchema.loginSchema>>();
  const prisma = c.get("prisma");

  // Check if user exists
  const userData = await sharedUsersRepository.findEmail(prisma, body.email);
  if (userData === null) {
    return fail({
      c,
      message: "Email or password is incorrect",
      status: 404,
    });
  }

  // Check password is correct or not
  const isPasswordValid = userData.password
    ? await compareHash(body.password, userData.password)
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

  const accessToken = await generateAccessToken(
    userData.id,
    userData.email,
    userData.username,
  );

  setCookie(c, "refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: REFRESH_TOKEN_EXPIRATION_DAYS * 24 * 60 * 60, // in seconds
  });

  return ok({
    c,
    data: {
      accessToken,
      user: generateUserResponse(userData, true),
    },
  });
};

/** REGENERATE ACCESS TOKEN */
export const getAccessToken = async (c: Context<ContextWithPrisma>) => {
  const prisma = c.get("prisma");

  // clear refresh token
  if (Math.random() < 0.05) {
    await authRepository.clearUnusedToken(prisma);
  }

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
    storedTokenData.user.username,
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

export const verifyEmail = async (c: Context<ContextWithPrisma>) => {
  const prisma = c.get("prisma");
  const { token } =
    await c.req.json<z.infer<typeof authSchema.verifyEmailSchema>>();

  const { payload } = Jwt.decode(token);

  if (!payload || !payload.sub) {
    return fail({
      c,
      message: "Invalid verification token",
      status: 400,
    });
  }

  if (!payload.exp || payload.exp * 1000 < Date.now()) {
    return fail({
      c,
      message: "Verification token has expired",
      status: 400,
    });
  }

  const verificationToken = await authRepository.getUserVerificationToken(
    prisma,
    payload.sub as string,
  );

  const isTokenValid = verificationToken && verificationToken.token === token;

  if (!isTokenValid) {
    return fail({
      c,
      message: "Invalid verification token",
      status: 400,
    });
  }

  const user = await authRepository.deleteUserVerificationToken(
    prisma,
    verificationToken.id,
  );

  return ok({
    c,
    data: generateUserResponse(user, true),
    message: "Email verified successfully",
  });
};

export const resendVerificationEmail = async (
  c: Context<ContextWithPrisma>,
) => {
  const prisma = c.get("prisma");
  const { email } = c.get("userData") || { email: "" };

  const user = await sharedUsersRepository.findEmail(prisma, email);
  if (!user) {
    return fail({
      c,
      message: "User not found",
      status: 404,
    });
  }

  const verificationToken = await authRepository.getUserVerificationToken(
    prisma,
    user.id,
  );

  if (
    verificationToken?.allowToResend &&
    verificationToken.allowToResend.getTime() > Date.now()
  ) {
    return fail({
      c,
      message:
        "You can only resend the verification email once every 5 minutes.",
      status: 429,
    });
  }

  const newToken = await generateEmailVerificationToken(
    user.id,
    user.email,
    user.username,
  );

  await authService.verificationSender({
    email: user.email,
    token: newToken,
    name: user.name,
  });

  const data = await authRepository.updateUserVerificationToken(
    prisma,
    user.id,
    newToken,
  );

  return ok({
    c,
    message: "Verification email resent successfully",
    data,
  });
};

export const getResendAvailability = async (c: Context<ContextWithPrisma>) => {
  const prisma = c.get("prisma");
  const { id } = c.get("userData") || { id: "" };

  const verificationToken = await authRepository.getUserVerificationToken(
    prisma,
    id,
  );

  if (!verificationToken) {
    return fail({
      c,
      message: "No verification token found for the user",
      status: 404,
    });
  }

  return ok({
    c,
    data: {
      availableToResend: new Date(verificationToken.allowToResend).getTime(),
    },
  });
};
