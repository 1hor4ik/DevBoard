import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Eye,
  Flag,
  ListChecks,
} from "lucide-react";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

type MyTasksPageProps = {
  params: Promise<{
    workspaceSlug: string;
  }>;
};

export default async function MyTasksPage({ params }: MyTasksPageProps) {
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
      members: {
        where: {
          userId: session.user.id,
        },
      },
    },
  });

  if (!workspace) {
    notFound();
  }

  const currentMember = workspace.members[0];

  if (!currentMember) {
    notFound();
  }

  const tasks = await prisma.task.findMany({
    where: {
      workspaceId: workspace.id,
      assigneeId: session.user.id,
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const todoTasks = tasks.filter((task) => task.status === "TODO");

  const inProgressTasks = tasks.filter((task) => task.status === "IN_PROGRESS");

  const reviewTasks = tasks.filter((task) => task.status === "REVIEW");

  const doneTasks = tasks.filter((task) => task.status === "DONE");

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <p className="mb-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
          My tasks
        </p>

        <h2 className="text-3xl font-bold tracking-tight text-slate-950">
          Tasks assigned to you
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
          Track the work assigned to you across all projects in this workspace.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MyTaskStatCard title="Total" value={tasks.length} icon={ListChecks} />

        <MyTaskStatCard title="Todo" value={todoTasks.length} icon={Circle} />

        <MyTaskStatCard
          title="In progress"
          value={inProgressTasks.length}
          icon={Clock3}
        />

        <MyTaskStatCard
          title="In review"
          value={reviewTasks.length}
          icon={Eye}
        />

        <MyTaskStatCard
          title="Done"
          value={doneTasks.length}
          icon={CheckCircle2}
        />
      </section>

      {tasks.length === 0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <ListChecks className="h-6 w-6" />
          </div>

          <h3 className="text-lg font-semibold text-slate-950">
            No assigned tasks
          </h3>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Tasks assigned to you will appear here. You can assign yourself a
            task from a project board.
          </p>
        </div>
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          {tasks.map((task) => (
            <article
              key={task.id}
              className="flex flex-col rounded-3xl border border-slate-200 bg-linear-to-br from-white to-amber-50/40 p-5 shadow-sm transition duration-200 hover:border-amber-300 hover:shadow-md motion-safe:hover:-translate-y-0.5"
            >
              <div className="mb-3 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="break-words text-base font-semibold text-slate-950">
                    {task.title}
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Project: {task.project.name}
                  </p>
                </div>

                <span className={getStatusClassName(task.status)}>
                  {formatStatus(task.status)}
                </span>
              </div>

              <p className="line-clamp-2 text-sm leading-6 text-slate-500">
                {task.description || "No description"}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className={getPriorityClassName(task.priority)}>
                  <Flag className="h-3 w-3" />
                  {formatPriority(task.priority)}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                  <CalendarDays className="h-3 w-3" />
                  {task.dueDate ? formatDate(task.dueDate) : "No due date"}
                </span>
              </div>
              <div className="mt-auto pt-5">
                <div className="flex justify-end border-t border-slate-200/70 pt-4">
                  <Link
                    href={`/dashboard/${workspaceSlug}/projects/${task.project.id}`}
                    aria-label={`Go to task: ${task.title}`}
                    className="group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition-colors hover:bg-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 sm:w-auto"
                  >
                    Go to task
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

function MyTaskStatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
        <Icon className="h-5 w-5" />
      </div>

      <p className="text-sm font-medium text-slate-500">{title}</p>

      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
}

function getPriorityClassName(priority: "LOW" | "MEDIUM" | "HIGH") {
  const base =
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold";

  if (priority === "HIGH") {
    return `${base} bg-red-50 text-red-600`;
  }

  if (priority === "MEDIUM") {
    return `${base} bg-amber-50 text-amber-700`;
  }

  return `${base} bg-emerald-50 text-emerald-700`;
}

function getStatusClassName(
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE",
) {
  const base = "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold";

  if (status === "DONE") {
    return `${base} bg-emerald-50 text-emerald-700`;
  }

  if (status === "IN_PROGRESS") {
    return `${base} bg-blue-50 text-blue-700`;
  }

  if (status === "REVIEW") {
    return `${base} bg-purple-50 text-purple-700`;
  }

  return `${base} bg-slate-100 text-slate-600`;
}

function formatPriority(priority: "LOW" | "MEDIUM" | "HIGH") {
  if (priority === "LOW") return "Low";
  if (priority === "MEDIUM") return "Medium";
  return "High";
}

function formatStatus(status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE") {
  if (status === "TODO") return "Todo";
  if (status === "IN_PROGRESS") return "In progress";
  if (status === "REVIEW") return "Review";
  return "Done";
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}
