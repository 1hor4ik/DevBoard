import type { TaskPriority, TaskStatus } from "@/generated/prisma/enums";

export type { TaskPriority, TaskStatus };

export type TaskMember = {
  id: string;
  name: string;
  email: string;
};

export type TaskComment = {
  id: string;
  content: string;
  createdAt: Date | string;
  author: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
  };
};

/** The task data rendered by the board and its dialogs. */
export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | string | null;
  createdAt: Date | string;
  assignee: TaskMember | null;
  comments: TaskComment[];
};

export type EditableTask = Pick<
  Task,
  | "id"
  | "title"
  | "description"
  | "status"
  | "priority"
  | "dueDate"
  | "assignee"
>;
