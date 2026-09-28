"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

import {
  signUpSchema,
  type SignUpSchema,
} from "@/lib/validations/authValidator";

import { authClient } from "@/lib/auth-client";

import { SignUpFrame } from "@/components/auth/sign-up-frame";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/shared/password-input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function SignUpPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: SignUpSchema) => {
    console.log("SIGN UP VALUES:", values);

    try {
      setIsLoading(true);

      const res = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        callbackURL: "/onboarding",
      });

      console.log("SIGN UP RESPONSE:", res);

      if (res.error) {
        toast.error(res.error.message || "Something went wrong");
        return;
      }

      toast.success("Account created successfully!");
      router.push("/onboarding");
    } catch (error) {
      console.error("SIGN UP CATCH ERROR:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignUp = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/onboarding",
    });
  };

  const handleGoogleSignUp = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/onboarding",
    });
  };

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#FAF8F3]">
      <div className="absolute left-[-120px] top-[-120px] h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
      <div className="absolute bottom-[-140px] right-[-120px] h-80 w-80 rounded-full bg-amber-300/30 blur-3xl" />

      <div className="relative z-10 grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
        <section className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-sm font-bold text-white shadow-sm">
                {"</>"}
              </div>

              <span className="text-xl font-semibold tracking-tight text-slate-950">
                DevBoard
              </span>
            </Link>

            <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
              <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                  Create your account
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Start organizing your projects and team tasks in minutes.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-xl cursor-pointer"
                  onClick={handleGoogleSignUp}
                  disabled={isLoading}
                >
                  <FcGoogle className="mr-2 h-5 w-5" />
                  Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-xl cursor-pointer"
                  onClick={handleGithubSignUp}
                  disabled={isLoading}
                >
                  <FaGithub className="mr-2 h-5 w-5" />
                  GitHub
                </Button>
              </div>

              <div className="my-6 flex items-center gap-4">
                <Separator className="flex-1" />
                <span className="text-xs text-slate-400">or continue with</span>
                <Separator className="flex-1" />
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder="Jane Developer"
                            className="h-11 rounded-xl"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="you@company.com"
                            className="h-11 rounded-xl"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <PasswordInput
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Create a password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm password</FormLabel>
                        <FormControl>
                          <PasswordInput
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Confirm your password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="h-11 w-full rounded-xl bg-amber-400 font-semibold text-slate-950 shadow-sm transition hover:bg-amber-500 cursor-pointer"
                    disabled={isLoading}
                  >
                    {isLoading ? <Spinner /> : "Create account"}
                  </Button>
                </form>
              </Form>

              <p className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="font-semibold text-amber-700 transition hover:text-amber-800"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </section>

        <SignUpFrame />
      </div>
    </main>
  );
}
