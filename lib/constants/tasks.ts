import type { TaskPriority, TaskStatus } from "@/types/task";

export const statusOptions: { label: string; value: TaskStatus }[] = [
  { label: "Todo", value: "TODO" },
  { label: "In progress", value: "IN_PROGRESS" },
  { label: "Review", value: "REVIEW" },
  { label: "Done", value: "DONE" },
];

export const priorityOptions: { label: string; value: TaskPriority }[] = [
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
];
