import z from "zod";

export const usernameSchema = z
  .string()
  .min(5, "Username must have 5 characters.")
  .max(10, "Username must not exceed 10 characters.")
  .regex(
    /^(?!_)(?!.*__)[a-z0-9_]+(?<!_)$/,
    "Username can only contain lowercase letters, numbers, and underscores. It cannot start or end with an underscore or contain consecutive underscores.",
  );
