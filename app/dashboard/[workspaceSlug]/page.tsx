import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";
import { DashboardToast } from "@/components/dashboard/dashboard-toast";

import { DashboardStatCard } from "@/components/dashboard/stat-card";
import {
  CheckCircle2,
  FolderKanban,
  ListChecks,
  CalendarDays,
  ChevronRight,
  Users,
} from "lucide-react";

import Link from "next/link";

type DashboardPageProps = {
  params: Promise<{
    workspaceSlug: string;
  }>;
};

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { workspaceSlug } = await params;

  const session = await getSession(await headers());

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const workspace = await prisma.workspace.findUnique({
    where: {
      slug: workspaceSlug,
    },
    include: {
      members: true,
      projects: {
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        include: {
          _count: {
            select: {
              tasks: true,
            },
          },
        },
      },
    },
  });

  if (!workspace) {
    redirect("/onboarding");
  }

  const projectsCount = await prisma.project.count({
    where: {
      workspaceId: workspace.id,
    },
  });

  const membersCount = await prisma.workspaceMember.count({
    where: {
      workspaceId: workspace.id,
    },
  });

  const tasksCount = await prisma.task.count({
    where: {
      workspaceId: workspace.id,
    },
  });

  const completedTasksCount = await prisma.task.count({
    where: {
      workspaceId: workspace.id,
      status: "DONE",
    },
  });

  return (
    <div className="space-y-8">
      <DashboardToast />
      <section className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm md:flex-row md:items-center">
        <div>
          <p className="mb-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
            Dashboard overview
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-slate-950">
            Welcome back.
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Here is a quick overview of your workspace. Create projects, invite
            members, and start organizing your team work.
          </p>
        </div>

        <Link
          href={`/dashboard/${workspaceSlug}/projects/`}
          className="flex items-center justify-center h-11 rounded-xl bg-amber-400 px-5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-amber-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 active:bg-amber-600"
        >
          Create project
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          title="Projects"
          value={projectsCount}
          description="Workspace projects"
          icon={FolderKanban}
        />

        <DashboardStatCard
          title="Members"
          value={membersCount}
          description="People in workspace"
          icon={Users}
        />

        <DashboardStatCard
          title="Tasks"
          value={tasksCount}
          description="Total tasks"
          icon={ListChecks}
        />

        <DashboardStatCard
          title="Completed"
          value={completedTasksCount}
          description="Completed tasks"
          icon={CheckCircle2}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Recent projects
              </h3>
              <p className="text-sm text-slate-500">
                Your latest workspace projects.
              </p>
            </div>
          </div>

          {workspace.projects.length === 0 ? (
            <EmptyState
              title="No projects yet"
              text="Create your first project to start organizing tasks."
            />
          ) : (
            <div className="space-y-3">
              {workspace.projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/${workspaceSlug}/projects/${project.id}`}
                  className="
        group
        block
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        transition-all
        duration-200
        hover:-translate-y-1
        hover:border-amber-300
        hover:shadow-md
      "
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                          <FolderKanban className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <h4 className="truncate font-semibold text-slate-950 transition-colors group-hover:text-amber-700">
                            {project.name}
                          </h4>

                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                            {project.description || "No description provided."}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <ListChecks className="h-4 w-4" />

                          <span>
                            {project._count.tasks}{" "}
                            {project._count.tasks === 1 ? "task" : "tasks"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4" />

                          <span>
                            {new Intl.DateTimeFormat("en-GB", {
                              day: "numeric",
                              month: "short",
                            }).format(project.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight
                      className="
            mt-1
            h-5
            w-5
            shrink-0
            text-slate-400
            transition-all
            group-hover:translate-x-1
            group-hover:text-amber-600
          "
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <ActivityFeed workspaceSlug={workspaceSlug} compact />
      </section>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}
