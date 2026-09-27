"use server";

import {
  createActivity,
  createNotifications,
} from "@/server/services/activity";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth-server";
import { TaskStatus, TaskPriority } from "@/generated/prisma/client";

export async function createTask(
  workspaceSlug: string,
  projectId: string,
  title: string,
  description?: string,
  status?: TaskStatus,
  priority?: TaskPriority,
  assigneeId?: string,
  dueDate?: string,
) {
  const session = await getSession(await headers());

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const trimmedTitle = title.trim();
  const trimmedDescription = description?.trim() || null;

  if (!trimmedTitle) {
    throw new Error("Task title is required");
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

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspaceId: workspace.id,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (assigneeId) {
    const assigneeMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: workspace.id,
          userId: assigneeId,
        },
      },
    });

    if (!assigneeMember) {
      throw new Error("Assignee is not a member of this workspace");
    }
  }

  try {
    const task = await prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          title: trimmedTitle,
          description: trimmedDescription,
          status: status ?? "TODO",
          priority: priority ?? "MEDIUM",
          dueDate: dueDate ? new Date(dueDate) : null,
          workspaceId: workspace.id,
          projectId: project.id,
          createdById: session.user.id,
          assigneeId: assigneeId || null,
        },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          comments: {
            include: {
              author: {
                select: { id: true, name: true, email: true, image: true },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      await createActivity(tx, {
        workspaceId: workspace.id,
        projectId: project.id,
        taskId: task.id,
        actorId: session.user.id,
        type: "TASK_CREATED",
        message: session.user.name + " created task: " + task.title,
      });
      await createNotifications(tx, {
        workspaceId: workspace.id,
        projectId: project.id,
        taskId: task.id,
        actorId: session.user.id,
        type: "TASK_ASSIGNED",
        message: session.user.name + " assigned you: " + task.title,
        userIds: [task.assigneeId],
      });
      return task;
    });

    revalidatePath(`/dashboard/${workspace.slug}`);
    revalidatePath(`/dashboard/${workspace.slug}/activity`);
    revalidatePath(`/dashboard/${workspace.slug}/projects/${project.id}`);

    return task;
  } catch (error) {
    console.error("Error creating task:", error);
    throw new Error("Failed to create task");
  }
}

async function getTaskAccessData(
  workspaceSlug: string,
  projectId: string,
  taskId: string,
) {
  const session = await getSession(await headers());

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
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

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspaceId: workspace.id,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      projectId: project.id,
      workspaceId: workspace.id,
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  return {
    session,
    workspace,
    project,
    task,
  };
}

export async function updateTaskStatus(
  workspaceSlug: string,
  projectId: string,
  taskId: string,
  status: TaskStatus,
) {
  const { workspace, project, session } = await getTaskAccessData(
    workspaceSlug,
    projectId,
    taskId,
  );

  try {
    const updatedTask = await prisma.$transaction(async (tx) => {
      const before = await tx.task.findUniqueOrThrow({ where: { id: taskId } });
      const updatedTask = await tx.task.update({
        where: {
          id: taskId,
        },
        data: {
          status,
        },
        select: {
          id: true,
          status: true,
        },
      });

      if (before.status !== status)
        await createActivity(tx, {
          workspaceId: workspace.id,
          projectId: project.id,
          taskId: before.id,
          actorId: session.user.id,
          type: "TASK_MOVED",
          message:
            session.user.name +
            " moved task: " +
            before.title +
            " to " +
            status,
        });
      return updatedTask;
    });

    revalidatePath(`/dashboard/${workspace.slug}`);
    revalidatePath(`/dashboard/${workspace.slug}/activity`);
    revalidatePath(`/dashboard/${workspace.slug}/projects/${project.id}`);

    return updatedTask;
  } catch (error) {
    console.error("Error updating task status:", error);
    throw new Error("Failed to update task status");
  }
}

export async function deleteTask(
  workspaceSlug: string,
  projectId: string,
  taskId: string,
) {
  const { workspace, project, session } = await getTaskAccessData(
    workspaceSlug,
    projectId,
    taskId,
  );

  try {
    await prisma.$transaction(async (tx) => {
      const before = await tx.task.findUniqueOrThrow({ where: { id: taskId } });
      await tx.task.delete({
        where: {
          id: taskId,
        },
      });

      await createActivity(tx, {
        workspaceId: workspace.id,
        projectId: project.id,
        taskId: before.id,
        actorId: session.user.id,
        type: "TASK_DELETED",
        message: session.user.name + " deleted task: " + before.title,
      });
    });

    revalidatePath(`/dashboard/${workspace.slug}`);
    revalidatePath(`/dashboard/${workspace.slug}/activity`);
    revalidatePath(`/dashboard/${workspace.slug}/projects/${project.id}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting task:", error);
    throw new Error("Failed to delete task");
  }
}

export async function updateTask(
  workspaceSlug: string,
  projectId: string,
  taskId: string,
  title: string,
  description?: string,
  status?: TaskStatus,
  priority?: TaskPriority,
  assigneeId?: string,
  dueDate?: string,
) {
  const { workspace, project, session } = await getTaskAccessData(
    workspaceSlug,
    projectId,
    taskId,
  );

  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    throw new Error("Task title is required");
  }

  if (assigneeId) {
    const assigneeMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: workspace.id,
          userId: assigneeId,
        },
      },
    });

    if (!assigneeMember) {
      throw new Error("Assignee is not a member of this workspace");
    }
  }

  try {
    const updatedTask = await prisma.$transaction(async (tx) => {
      const before = await tx.task.findUniqueOrThrow({ where: { id: taskId } });
      const updatedTask = await tx.task.update({
        where: {
          id: taskId,
        },
        data: {
          title: trimmedTitle,
          description: description?.trim() || null,
          status: status ?? "TODO",
          priority: priority ?? "MEDIUM",
          assigneeId: assigneeId || null,
          dueDate: dueDate ? new Date(dueDate) : null,
        },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          comments: {
            include: {
              author: {
                select: { id: true, name: true, email: true, image: true },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      await createActivity(tx, {
        workspaceId: workspace.id,
        projectId: project.id,
        taskId: before.id,
        actorId: session.user.id,
        type: "TASK_UPDATED",
        message: session.user.name + " updated task: " + updatedTask.title,
      });
      if (before.assigneeId !== updatedTask.assigneeId)
        await createNotifications(tx, {
          workspaceId: workspace.id,
          projectId: project.id,
          taskId: before.id,
          actorId: session.user.id,
          type: "TASK_ASSIGNED",
          message: session.user.name + " assigned you: " + updatedTask.title,
          userIds: [updatedTask.assigneeId],
        });
      if (before.status !== updatedTask.status)
        await createActivity(tx, {
          workspaceId: workspace.id,
          projectId: project.id,
          taskId: before.id,
          actorId: session.user.id,
          type: "TASK_MOVED",
          message:
            session.user.name +
            " moved task: " +
            updatedTask.title +
            " to " +
            updatedTask.status,
        });
      return updatedTask;
    });

    revalidatePath(`/dashboard/${workspace.slug}`);
    revalidatePath(`/dashboard/${workspace.slug}/activity`);
    revalidatePath(`/dashboard/${workspace.slug}/projects/${project.id}`);

    return updatedTask;
  } catch (error) {
    console.error("Error updating task:", error);
    throw new Error("Failed to update task");
  }
}
