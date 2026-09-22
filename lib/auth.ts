import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Resend } from "resend";

import prisma from "@/lib/prisma";
import ForgotPasswordEmail from "@/components/ui/emails/forgot-password-email";

const resend = new Resend(process.env.RESEND_API_KEY);
export default resend;

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  trustedOrigins: ["http://localhost:3000", process.env.BETTER_AUTH_URL!],

  emailAndPassword: {
    enabled: true,

    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: "DevBoard <noreply@students.codes>",
        to: user.email,
        subject: "Reset your DevBoard password",
        react: ForgotPasswordEmail({
          userEmail: user.email,
          resetUrl: url,
        }),
      });
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
});
