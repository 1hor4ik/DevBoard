"use server";

import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth-server";

export async function createProject(
  workspaceSlug: string,
  name: string,
  description: string,
  dueDate?: string,
) {
  const session = await getSession(await headers());

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Project name is required");
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

  //   Creating a project
  try {
    const project = await prisma.project.create({
      data: {
        name: trimmedName,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        workspaceId: workspace.id,
        createdById: session.user.id,
      },
      select: {
        id: true,
        name: true,
        workspaceId: true,
      },
    });

    revalidatePath(`/dashboard/${workspace.slug}/projects`);

    return project;
  } catch (error) {
    console.error("Error creating project:", error);
    throw new Error("Failed to create project");
  }
}
