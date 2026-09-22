import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

import { WorkspaceSettingsForm } from "./workspace-settings-form";
import { DeleteWorkspaceButton } from "./delete-workspace-button";

import {
  CalendarDays,
  Shield,
  Users,
  FolderKanban,
  CheckSquare,
  Link2,
  Settings,
} from "lucide-react";

type SettingsPageProps = {
  params: Promise<{
    workspaceSlug: string;
  }>;
};

export default async function SettingsPage({ params }: SettingsPageProps) {
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

      _count: {
        select: {
          members: true,
          projects: true,
          tasks: true,
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

  const canManage =
    currentMember.role === "OWNER" || currentMember.role === "ADMIN";

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <Settings className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
              Workspace
            </p>

            <h1 className="text-3xl font-bold text-slate-950">Settings</h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your workspace information.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">General</h2>

        <p className="mt-1 text-sm text-slate-500">
          Update your workspace information.
        </p>

        <WorkspaceSettingsForm workspace={workspace} canManage={canManage} />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-950">
            Workspace information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Overview and statistics for this workspace.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <InfoCard
            title="Members"
            value={workspace._count.members.toString()}
            description="People collaborating"
            icon={Users}
          />

          <InfoCard
            title="Projects"
            value={workspace._count.projects.toString()}
            description="Projects in workspace"
            icon={FolderKanban}
          />

          <InfoCard
            title="Tasks"
            value={workspace._count.tasks.toString()}
            description="Tasks across all projects"
            icon={CheckSquare}
          />

          <InfoCard
            title="Workspace URL"
            value={workspace.slug}
            description="Used in workspace links"
            icon={Link2}
          />

          <InfoCard
            title="Your role"
            value={formatRole(currentMember.role)}
            description="Current permissions"
            icon={Shield}
          />

          <InfoCard
            title="Created"
            value={formatDate(workspace.createdAt)}
            description="Workspace creation date"
            icon={CalendarDays}
          />
        </div>
      </section>

      {currentMember.role === "OWNER" && (
        <section className="rounded-3xl border border-red-200 bg-red-50/50 p-6 shadow-sm">
          <div className="flex justify-between items-center gap-6">
            <div>
              <h2 className="text-lg font-semibold text-red-700">
                Danger Zone
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-red-600">
                Deleting this workspace is permanent. All projects, tasks and
                members will be removed forever.
              </p>
            </div>

            <DeleteWorkspaceButton workspaceId={workspace.id} />
          </div>
        </section>
      )}
    </div>
  );
}

function formatRole(role: "OWNER" | "ADMIN" | "MEMBER") {
  switch (role) {
    case "OWNER":
      return "Owner";
    case "ADMIN":
      return "Admin";
    default:
      return "Member";
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function InfoCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-amber-200 hover:shadow-md">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
        <Icon className="h-5 w-5" />
      </div>

      <p className="text-sm font-medium text-slate-500">{title}</p>

      <p className="mt-2 break-all text-3xl font-bold tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}
