import { Prisma } from "../../generated/prisma/client.js";
import { avatarResponse } from "../../libs/avatar.js";

export const generateUserResponse = (user: Prisma.UserGetPayload<true>) => {
  const { id, name, username, about, avatar } = user;
  return {
    id,
    name,
    username,
    about,
    avatar: avatar ? avatarResponse(avatar) : null,
  };
};
