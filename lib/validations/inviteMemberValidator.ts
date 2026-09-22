import z from "zod";

export const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "MEMBER"], {
    message: "Role must be either ADMIN or MEMBER",
  }),
});

export type InviteMemberSchema = z.infer<typeof inviteMemberSchema>;
