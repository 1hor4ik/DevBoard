"use server";

import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

async function notificationScope() {
  const session = await getSession(await headers());
  if (!session?.user.id) throw new Error("Unauthorized");
  const invitations = await prisma.workspaceInvitation.findMany({
    where: {
      email: session.user.email,
      status: "PENDING",
      expiresAt: { gt: new Date() },
    },
    select: { id: true, token: true },
  });
  const where = {
    userId: session.user.id,
    OR: [
      {
        type: { not: "INVITATION" as const },
        workspace: { members: { some: { userId: session.user.id } } },
      },
      {
        type: "INVITATION" as const,
        invitationId: { in: invitations.map((item) => item.id) },
      },
    ],
  };
  return { where, invitations };
}

export async function getNotifications() {
  const { where, invitations } = await notificationScope();
  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 30,
      include: { workspace: { select: { slug: true, name: true } } },
    }),
    prisma.notification.count({ where: { ...where, isRead: false } }),
  ]);
  const projects = await prisma.project.findMany({
    where: {
      id: {
        in: items.flatMap((item) => (item.projectId ? [item.projectId] : [])),
      },
    },
    select: { id: true, workspaceId: true },
  });
  return {
    unreadCount,
    items: items.map((item) => {
      const invitation = invitations.find(
        (invite) => invite.id === item.invitationId,
      );
      const project = projects.find(
        (project) =>
          project.id === item.projectId &&
          project.workspaceId === item.workspaceId,
      );
      return {
        id: item.id,
        type: item.type,
        message: item.message,
        isRead: item.isRead,
        createdAt: item.createdAt.toISOString(),
        workspaceName: item.workspace.name,
        href: invitation
          ? `/invite/${invitation.token}`
          : project
            ? `/dashboard/${item.workspace.slug}/projects/${project.id}`
            : `/dashboard/${item.workspace.slug}`,
      };
    }),
  };
}

export async function markNotificationRead(id: string) {
  const { where } = await notificationScope();
  await prisma.notification.updateMany({
    where: { ...where, id },
    data: { isRead: true },
  });
}

export async function markAllNotificationsRead() {
  const { where } = await notificationScope();
  await prisma.notification.updateMany({
    where: { ...where, isRead: false },
    data: { isRead: true },
  });
}
