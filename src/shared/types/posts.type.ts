import { Prisma } from "../../generated/prisma/client.js";
import { postSelect } from "../select/posts.select.js";

export type PostReturned = Prisma.PostGetPayload<{
  select: typeof postSelect
}>;