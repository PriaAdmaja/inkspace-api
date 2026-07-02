import { Prisma } from "../../generated/prisma/client.js";
import { avatarResponse } from "../../libs/avatar.js";

export const generateUserResponse = (user: Prisma.UserGetPayload<true>) => {
  const { name, username, about, avatar } = user;
  return {
    name,
    username,
    about,
    avatar: avatar ? avatarResponse(avatar) : null,
  };
};
