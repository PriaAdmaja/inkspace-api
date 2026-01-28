import { zValidator as zv } from "@hono/zod-validator";
import { z } from "zod";
import { fail } from "./response.js";

export const zValidator = <T extends z.ZodTypeAny>(schema: T) => {
  return zv("json", schema, (result, c) => {
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return fail({
        c,
        message: "Validation error",
        error: errors,
        status: 400,
      });
    }
  });
};
