"use server";

import prisma from "@/lib/prisma";
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
    const comment = await prisma.taskComment.create({
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

    return comment;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw new Error("Failed to create comment");
  }
}
