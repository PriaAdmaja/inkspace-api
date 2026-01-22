import z from "zod";

export const updateMeSchema = z.object({
    username: z.string(),
    avatar: z.string().nullable(),
    about: z.string().nullable()
})