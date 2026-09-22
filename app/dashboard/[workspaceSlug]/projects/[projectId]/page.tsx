import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Eye,
  ListChecks,
} from "lucide-react";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

import { ProjectBoard } from "@/components/ui/tasks/project-board";

type ProjectDetailPageProps = {
  params: Promise<{
    workspaceSlug: string;
    projectId: string;
  }>;
};

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { workspaceSlug, projectId } = await params;

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

  const workspaceMembers = await prisma.workspaceMember.findMany({
    where: {
      workspaceId: workspace.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspaceId: workspace.id,
    },
    include: {
      tasks: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          comments: {
            orderBy: {
              createdAt: "asc",
            },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
      },
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const todoTasks = project.tasks.filter((task) => task.status === "TODO");

  const inProgressTasks = project.tasks.filter(
    (task) => task.status === "IN_PROGRESS",
  );

  const reviewTasks = project.tasks.filter((task) => task.status === "REVIEW");

  const doneTasks = project.tasks.filter((task) => task.status === "DONE");

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href={`/dashboard/${workspaceSlug}/projects`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to projects
          </Link>
        </div>

        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
              Project
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              {project.name}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              {project.description || "No description for this project yet."}
            </p>

            <p className="mt-3 text-xs text-slate-400">
              Created by {project.createdBy.name || project.createdBy.email}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-slate-500">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              {project.dueDate
                ? new Date(project.dueDate).toLocaleDateString()
                : "No due date"}
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <ListChecks className="h-4 w-4 text-slate-400" />
              {project.tasks.length} tasks
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <ProjectStatCard
          title="Total tasks"
          value={project.tasks.length}
          icon={ListChecks}
        />

        <ProjectStatCard title="Todo" value={todoTasks.length} icon={Circle} />

        <ProjectStatCard
          title="In progress"
          value={inProgressTasks.length}
          icon={Clock3}
        />

        <ProjectStatCard
          title="In review"
          value={reviewTasks.length}
          icon={Eye}
        />

        <ProjectStatCard
          title="Done"
          value={doneTasks.length}
          icon={CheckCircle2}
        />
      </section>

      <ProjectBoard
        workspaceSlug={workspaceSlug}
        projectId={project.id}
        tasks={project.tasks}
        members={workspaceMembers.map((member) => ({
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
        }))}
      />
    </div>
  );
}

function ProjectStatCard({
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
