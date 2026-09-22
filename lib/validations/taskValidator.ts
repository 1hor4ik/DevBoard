import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Task title must be at least 2 characters")
    .max(80, "Task title must be less than 80 characters"),

  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),

  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]),

  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),

  assigneeId: z.string().optional(),

  dueDate: z.string().optional(),
});

export type CreateTaskSchema = z.infer<typeof createTaskSchema>;
