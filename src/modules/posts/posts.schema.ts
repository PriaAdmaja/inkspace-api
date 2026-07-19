import z from "zod";

export const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.record(z.string(), z.any()),
  excerpt: z.string(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional()
});
