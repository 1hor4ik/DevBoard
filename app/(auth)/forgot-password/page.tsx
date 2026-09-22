"use client";

import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordSchema) {
    try {
      const { error } = await authClient.requestPasswordReset({
        email: values.email,
        redirectTo: `/reset-password`,
      });

      if (error) {
        toast.error(error.message || "Something went wrong");
        return;
      }

      toast.success("Password reset link sent!");
      form.reset();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FAF8F3] px-6 py-10">
      <div className="absolute -left-30 -top-30 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
      <div className="absolute -bottom-35 -right-30 h-80 w-80 rounded-full bg-amber-300/30 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-sm font-bold text-white shadow-sm">
            {"</>"}
          </div>

          <span className="text-xl font-semibold tracking-tight text-slate-950">
            DevBoard
          </span>
        </Link>

        <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-[0_30px_100px_-45px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Mail className="h-6 w-6" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              Forgot your password?
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Enter your email and we&apos;ll send you a password reset link.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="you@example.com"
                        disabled={form.formState.isSubmitting}
                        className="h-11 rounded-xl"
                      />
                    </FormControl>

                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="h-11 w-full cursor-pointer rounded-xl bg-amber-400 font-semibold text-slate-950 shadow-sm transition hover:bg-amber-500 disabled:cursor-not-allowed"
              >
                {form.formState.isSubmitting
                  ? "Sending reset link..."
                  : "Send reset link"}
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>

            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-slate-500">
                Remembered your password?
              </span>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            className="h-11 w-full cursor-pointer rounded-xl"
          >
            <Link
              href="/sign-in"
              className="flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
