import { z } from "zod";

export const onboardingSchema = z.object({
  workspaceName: z
    .string()
    .trim()
    .min(2, "Workspace name must be at least 2 characters")
    .max(40, "Workspace name must be less than 40 characters")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9 _-]*$/,
      "Workspace name must start with an English letter or number",
    )
    .refine(
      (value) => /[a-zA-Z0-9]/.test(value),
      "Workspace name must contain at least one English letter or number",
    ),
});
export type OnboardingSchema = z.infer<typeof onboardingSchema>;
