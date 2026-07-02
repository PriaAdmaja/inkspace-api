import z from "zod";

export const registerSchema = z.object({
  email: z.email(),
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export const updateMeSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" }),
  avatar: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.type.startsWith("image/"),
      "Only images are allowed",
    )
    .refine(
      (file) => !file || file.size <= 5 * 1024 * 1024,
      "Maximum size is 5MB",
    ),
  avatarAction: z.enum(["upload", "remove"]).optional(),
  about: z.string().nullable(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(6, { message: "Current password must be at least 6 characters long" }),
  newPassword: z
    .string()
    .min(6, { message: "New password must be at least 6 characters long" }),
});

export type UpdateMeData = Omit<z.infer<typeof updateMeSchema>, "avatar"> & {
  avatar?: string | null;
};
