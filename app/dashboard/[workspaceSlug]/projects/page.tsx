import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

import { SearchInput } from "@/components/ui/shared/search-input";

import {
  ArrowRight,
  CalendarDays,
  ListChecks,
  Plus,
  Search,
} from "lucide-react";

import Link from "next/link";

import { CreateProjectDialog } from "@/components/ui/projects/create-project-dialog";

type ProjectsPageProps = {
  params: Promise<{
    workspaceSlug: string;
  }>;
  searchParams: Promise<{
    search?: string;
  }>;
};

export default async function ProjectsPage({
  params,
  searchParams,
}: ProjectsPageProps) {
  const { workspaceSlug } = await params;
  const { search } = await searchParams;
  const searchQuery = search?.trim() || "";

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
      projects: {
        where: searchQuery
          ? {
              OR: [
                {
                  name: {
                    contains: searchQuery,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: searchQuery,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : undefined,
        orderBy: {
          createdAt: "desc",
        },
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
    notFound();
  }

  const currentMember = workspace.members[0];

  if (!currentMember) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm md:flex-row md:items-center">
        <div>
          <p className="mb-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
            Projects
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-slate-950">
            Manage your projects
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Create projects for product ideas, client work, university tasks, or
            team sprints.
          </p>
        </div>

        <CreateProjectDialog workspaceSlug={workspaceSlug} />
      </section>

      <div className=" flex items-center justify-center gap-4">
        <SearchInput placeholder="Search projects..." />
      </div>

      {workspace.projects.length === 0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            {searchQuery ? (
              <Search className="h-6 w-6" />
            ) : (
              <Plus className="h-6 w-6" />
            )}
          </div>

          <h3 className="text-lg font-semibold text-slate-950">
            {searchQuery ? "No projects found" : "No projects yet"}
          </h3>

          <p className="mt-2 mb-4 max-w-md text-sm leading-6 text-slate-500">
            {searchQuery
              ? "Try searching by another project name or description."
              : "Create your first project to start organizing tasks on a board."}
          </p>

          {!searchQuery && (
            <CreateProjectDialog workspaceSlug={workspaceSlug} />
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workspace.projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/${workspaceSlug}/projects/${project.id}`}
              className="group flex min-h-56 flex-col justify-between rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md"
            >
              <div>
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-sm font-bold text-amber-700">
                    {getProjectInitials(project.name)}
                  </div>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                    Project
                  </span>
                </div>

                <h3 className="line-clamp-1 text-lg font-semibold text-slate-950">
                  {project.name}
                </h3>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                  {project.description || "No description"}
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-medium">
                    <ListChecks className="h-3.5 w-3.5" />
                    {project._count.tasks}{" "}
                    {project._count.tasks === 1 ? "task" : "tasks"}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-medium">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {project.dueDate
                      ? formatDate(project.dueDate)
                      : "No due date"}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs font-medium text-slate-400">
                    Open project board
                  </span>

                  <span className="inline-flex h-9 items-center gap-2 rounded-xl bg-amber-400 px-3 text-sm font-semibold text-slate-950 transition group-hover:bg-amber-500">
                    View project
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function getProjectInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}
