import type { Task, TaskStatus } from "./task";

export type TaskEvent = { projectId: string; task: Task };
export type TaskDeletedEvent = { projectId: string; taskId: string };
export type TaskStatusEvent = TaskDeletedEvent & { status: TaskStatus };

export type TypingUser = { socketId: string; userId: string; name: string };
export type TaskTypingPresence = { taskId: string; users: TypingUser[] };
