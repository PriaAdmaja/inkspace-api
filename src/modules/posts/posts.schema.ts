import z from "zod";

export const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.record(z.string(), z.any()),
  excerpt: z.string(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  seoTitle: z.string().min(1, "seoTitle is required"),
  seoDescription: z.string().min(1, "seoDescription is required"),
});
