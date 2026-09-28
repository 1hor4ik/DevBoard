"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";
import {
  ArrowRight,
  FolderKanban,
  ListChecks,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

import {
  onboardingSchema,
  type OnboardingSchema,
} from "../../lib/validations/workspaceValidator";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import OnboardingFrame from "@/components/onboarding/onboarding-frame";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { createWorkspace } from "@/server/actions/workspace-actions";

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<OnboardingSchema>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      workspaceName: "",
    },
  });

  const workspaceName = form.watch("workspaceName");
  const workspaceSlug = createWorkspaceSlug(workspaceName);

  const onSubmit = async (values: OnboardingSchema) => {
    const slug = createWorkspaceSlug(values.workspaceName);

    if (!slug) {
      toast.error("Workspace URL cannot be empty");
      return;
    } 

    try {
      setIsLoading(true);

      await createWorkspace(values.workspaceName.trim(), slug);

      toast.success("Workspace created!");
      router.push(`/dashboard/${slug}`);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FAF8F3]">
      <div className="absolute -left-30 -top-30 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
      <div className="absolute -bottom-35 -right-30 h-80 w-80 rounded-full bg-amber-300/30 blur-3xl" />

      <div className="absolute right-10 top-10 hidden grid-cols-6 gap-2 opacity-40 md:grid">
        {Array.from({ length: 36 }).map((_, index) => (
          <span key={index} className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        ))}
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-10">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <section>
            <Link href="/" className="mb-10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-sm font-bold text-white shadow-sm">
                {"</>"}
              </div>

              <span className="text-xl font-semibold tracking-tight text-slate-950">
                DevBoard
              </span>
            </Link>

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
              <Sparkles className="h-3.5 w-3.5" />
              Setup your first workspace
            </div>

            <h1 className="max-w-xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Welcome to DevBoard. Let&apos;s create your team workspace.
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-slate-500">
              A workspace is where your projects, tasks, members, and activity
              will live. You can create more workspaces later.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:max-w-xl">
              <FeatureCard
                icon={FolderKanban}
                title="Projects"
                text="Group your work by goals."
              />

              <FeatureCard
                icon={ListChecks}
                title="Tasks"
                text="Track everything on boards."
              />

              <FeatureCard
                icon={Users}
                title="Team"
                text="Invite members later."
              />
            </div>
          </section>

          <section className="relative">
            <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full border border-amber-300/60" />
            <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-amber-200/40 blur-2xl" />

            <div className="relative z-20 rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-[0_30px_100px_-45px_rgba(15,23,42,0.45)] backdrop-blur">
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                  Create workspace
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Choose a name for your first workspace. You can change it
                  later in settings.
                </p>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="workspaceName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workspace name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Workspace name"
                            className="h-11 rounded-xl"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-800">
                      Workspace URL
                    </label>

                    <div className="flex h-11 items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
                      <span className="shrink-0 text-slate-400">
                        devboard.com/dashboard/
                      </span>

                      <span className="truncate font-medium text-slate-700">
                        {workspaceSlug || "workspace-name"}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-11 w-full cursor-pointer rounded-xl bg-amber-400 font-semibold text-slate-950 shadow-sm transition hover:bg-amber-500"
                  >
                    {isLoading ? (
                      <Spinner />
                    ) : (
                      <>
                        Continue to dashboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              <OnboardingFrame />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  text,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
        <Icon className="h-4.5 w-4.5" />
      </div>

      <p className="text-sm font-semibold text-slate-950">{title}</p>

      <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
    </div>
  );
}

function createWorkspaceSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
