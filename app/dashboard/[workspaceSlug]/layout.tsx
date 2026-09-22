import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

import { Sidebar } from "@/components/ui/dashboard/Sidebar";
import { Topbar } from "@/components/ui/dashboard/Topbar";

import SocketProvider from "@/app/providers/SocketProvider";

type DashboardLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    workspaceSlug: string;
  }>;
};

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
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

  const userWorkspaces = await prisma.workspaceMember.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      workspace: true,
    },
    orderBy: {
      createdAt: "asc",
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
    <div className="flex min-h-screen bg-[#FAF8F3]">
      <Sidebar
        workspaceSlug={workspace.slug}
        workspaces={userWorkspaces.map((membership) => ({
          id: membership.workspace.id,
          name: membership.workspace.name,
          slug: membership.workspace.slug,
          role: membership.role,
        }))}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          workspaceName={workspace.name}
          userName={session.user.name ?? "User"}
          userEmail={session.user.email ?? ""}
          userImage={session.user.image ?? null}
        />

        <SocketProvider>
          <main className="flex-1 p-6">{children}</main>
        </SocketProvider>
      </div>
    </div>
  );
}
