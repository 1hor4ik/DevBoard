"use server";

import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth-server";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

export async function createWorkspace(name: string, slug: string) {
  const session = await getSession(await headers());

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const trimmedName = name.trim();
  const trimmedSlug = slug.trim();

  if (!trimmedName || !trimmedSlug) {
    throw new Error("Workspace name and slug are required");
  }

  const existingWorkspace = await prisma.workspace.findUnique({
    where: {
      slug: trimmedSlug,
    },
  });

  if (existingWorkspace) {
    throw new Error("Workspace with this URL already exists");
  }

  try {
    const workspace = await prisma.$transaction(async (tx) => {
      const createdWorkspace = await tx.workspace.create({
        data: {
          name: trimmedName,
          slug: trimmedSlug,
          ownerId: session.user.id,
        },
      });

      await tx.workspaceMember.create({
        data: {
          workspaceId: createdWorkspace.id,
          userId: session.user.id,
          role: "OWNER",
        },
      });

      return createdWorkspace;
    });

    revalidatePath(`/dashboard/${workspace.slug}`);

    return workspace;
  } catch (error) {
    console.error("Error creating workspace:", error);
    throw new Error("Failed to create workspace");
  }
}

export async function updateWorkspace(workspaceId: string, name: string) {
  const session = await getSession(await headers());

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Workspace name is required");
  }

  const slug = slugify(trimmedName);

  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
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

  if (
    !currentMember ||
    (currentMember.role !== "OWNER" && currentMember.role !== "ADMIN")
  ) {
    throw new Error("You don't have permission.");
  }

  const existingWorkspace = await prisma.workspace.findUnique({
    where: {
      slug,
    },
  });

  if (existingWorkspace && existingWorkspace.id !== workspaceId) {
    throw new Error("Workspace URL already exists.");
  }

  await prisma.workspace.update({
    where: {
      id: workspaceId,
    },
    data: {
      name: trimmedName,
      slug,
    },
  });

  revalidatePath(`/dashboard/${slug}`);

  return {
    success: true,
    slug,
    message: "Workspace updated successfully.",
  };
}

export async function deleteWorkspace(workspaceId: string) {
  const session = await getSession(await headers());

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
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

  if (!currentMember || currentMember.role !== "OWNER") {
    throw new Error("Only the workspace owner can delete the workspace.");
  }

  await prisma.workspace.delete({
    where: {
      id: workspaceId,
    },
  });

  revalidatePath("/dashboard");

  return {
    success: true,
    message: `"${workspace.name}" has been deleted.`,
  };
}
