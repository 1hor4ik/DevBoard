"use server";

import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import crypto from "crypto";

import InviteWorkspaceEmail from "../../components/ui/emails/invite-workspace-email";

import { getSession } from "@/lib/auth-server";

type Role = "ADMIN" | "MEMBER";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function createInvitation({
  email,
  role,
  workspaceSlug,
}: {
  email: string;
  role: Role;
  workspaceSlug: string;
}) {
  const session = await getSession(await headers());

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    throw new Error("Email is required");
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
    throw new Error("Workspace not found");
  }

  const currentMember = workspace.members[0];

  if (!currentMember) {
    throw new Error("You are not a member of this workspace");
  }

  if (trimmedEmail === session.user.email) {
    throw new Error("You cannot invite yourself");
  }

  if (currentMember.role !== "OWNER" && currentMember.role !== "ADMIN") {
    throw new Error("You do not have permission to invite members");
  }

  const existingMember = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: workspace.id,
      user: {
        email: trimmedEmail,
      },
    },
  });

  if (existingMember) {
    throw new Error("This user is already a member.");
  }

  const existingInvitation = await prisma.workspaceInvitation.findFirst({
    where: {
      workspaceId: workspace.id,
      email: trimmedEmail,
      status: "PENDING",
    },
  });

  if (existingInvitation) {
    throw new Error("Invitation already sent.");
  }

  try {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.workspaceInvitation.create({
      data: {
        email: trimmedEmail,
        role,
        workspaceId: workspace.id,
        token,
        invitedById: session.user.id,
        expiresAt,
      },
    });

    const inviteUrl = `${process.env.BETTER_AUTH_URL}/invite/${token}`;

    await resend.emails.send({
      from: "DevBoard <noreply@students.codes>",
      to: trimmedEmail,
      subject: `${session.user.name} invited you to ${workspace.name}`,
      react: InviteWorkspaceEmail({
        workspaceName: workspace.name,
        inviterName: session.user.name,
        inviteUrl,
        role,
      }),
    });

    revalidatePath(`/dashboard/${workspace.slug}/members`);
  } catch (error) {
    console.error("Error creating invitation:", error);
    throw new Error("Failed to create invitation");
  }
}

export async function acceptInvitation(token: string) {
  const session = await getSession(await headers());

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!token) {
    throw new Error("Token is required");
  }

  const invitation = await prisma.workspaceInvitation.findUnique({
    where: {
      token,
    },
  });

  if (!invitation) {
    throw new Error("Invalid invitation token");
  }

  const workspace = await prisma.workspace.findUnique({
    where: {
      id: invitation.workspaceId,
    },
  });

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  if (invitation.status !== "PENDING") {
    throw new Error("Invitation has already been accepted or declined");
  }

  if (invitation.email !== session.user.email) {
    throw new Error("This invitation is not for your email address");
  }

  if (invitation.expiresAt < new Date()) {
    throw new Error("Invitation has expired");
  }

  try {
    await prisma.$transaction([
      prisma.workspaceMember.create({
        data: {
          userId: session.user.id,
          workspaceId: invitation.workspaceId,
          role: invitation.role,
        },
      }),

      prisma.workspaceInvitation.update({
        where: {
          id: invitation.id,
        },
        data: {
          status: "ACCEPTED",
        },
      }),
    ]);

    revalidatePath(`/dashboard/${workspace.slug}/members`);

    return {
      workspaceSlug: workspace.slug,
      success: true,
      message: `You have successfully joined the workspace ${workspace.name}.`,
    };
  } catch (error) {
    console.error("Error accepting invitation:", error);
    throw new Error("Failed to accept invitation");
  }
}

export async function cancelInvitation(invitationId: string) {
  const session = await getSession(await headers());

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const invitation = await prisma.workspaceInvitation.findUnique({
    where: {
      id: invitationId,
    },
    include: {
      workspace: {
        include: {
          members: {
            where: {
              userId: session.user.id,
            },
          },
        },
      },
    },
  });

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  const currentMember = invitation.workspace.members[0];

  if (!currentMember) {
    throw new Error("Forbidden");
  }

  if (currentMember.role !== "OWNER" && currentMember.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  await prisma.workspaceInvitation.update({
    where: {
      id: invitation.id,
    },
    data: {
      status: "REJECTED",
    },
  });

  revalidatePath(`/dashboard/${invitation.workspace.slug}/members`);

  return {
    success: true,
    message: "Invitation cancelled.",
  };
}
