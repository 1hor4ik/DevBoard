"use server";

import {
  createActivity,
  createNotifications,
} from "@/server/services/activity";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { getSession } from "@/lib/auth-server";

export async function createComment({
  content,
  taskId,
}: {
  content: string;
  taskId: string;
}) {
  const session = await getSession(await headers());

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const trimmedContent = content.trim();

  if (!trimmedContent) {
    throw new Error("Comment content is required");
  }

  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    include: {
      project: {
        select: {
          id: true,
          workspace: {
            select: {
              slug: true,
              members: {
                where: {
                  userId: session.user.id,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  if (task.project.workspace.members.length === 0) {
    throw new Error("You are not a member of this workspace");
  }

  try {
    const comment = await prisma.$transaction(async (tx) => {
      const saved = await tx.taskComment.create({
        data: {
          content: trimmedContent,
          taskId: task.id,
          authorId: session.user.id,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      await createActivity(tx, {
        workspaceId: task.workspaceId,
        projectId: task.projectId,
        taskId: task.id,
        actorId: session.user.id,
        type: "COMMENT_CREATED",
        message: session.user.name + " commented on: " + task.title,
      });
      await createNotifications(tx, {
        workspaceId: task.workspaceId,
        projectId: task.projectId,
        taskId: task.id,
        actorId: session.user.id,
        type: "COMMENT",
        message: session.user.name + " commented on: " + task.title,
        userIds: [task.createdById, task.assigneeId],
      });
      return saved;
    });
    revalidatePath(`/dashboard/${task.project.workspace.slug}`);
    revalidatePath(`/dashboard/${task.project.workspace.slug}/activity`);
    return comment;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw new Error("Failed to create comment");
  }
}
