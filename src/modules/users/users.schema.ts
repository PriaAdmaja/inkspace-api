import z from "zod";
import { usernameSchema } from "../../shared/schemas/users.schema.js";

export const checkingUsernameSchema = z.object({
  username: usernameSchema,
});