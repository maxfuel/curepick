import { z } from "zod";

export const reviewSchema = z.object({
  hospitalId: z.string().min(1, "Hospital is required"),
  procedureId: z.string().optional(),
  rating: z.number().min(1, "Rating is required").max(5),
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

export const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
});

export type CommentInput = z.infer<typeof commentSchema>;
