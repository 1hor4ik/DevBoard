import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Project name must be at least 2 characters")
    .max(60, "Project name must be less than 60 characters")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9 _-]*$/,
      "Project name must start with an English letter or number",
    )
    .refine(
      (value) => /[a-zA-Z0-9]/.test(value),
      "Project name must contain at least one English letter or number",
    ),

  description: z
    .string()
    .max(300, "Description must be less than 300 characters")
    .optional(),

  dueDate: z.string().optional(),
});

export type CreateProjectSchema = z.infer<typeof createProjectSchema>;
