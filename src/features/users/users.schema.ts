import z from "zod";

export const checkingUsernameSchema = z.object({
  username: z.string().min(5, 'Username must have 5 characters.'),
});