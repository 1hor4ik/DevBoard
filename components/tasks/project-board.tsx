"use client";

import type { Task, TaskMember, TaskStatus, TaskPriority } from "@/types/task";
import type {
  TaskEvent,
  TaskDeletedEvent,
  TaskStatusEvent,
} from "@/types/socket";

import { useState, useEffect, useTransition } from "react";
import {
  CalendarDays,
  CircleUserRound,
  Flag,
  Plus,
  MoreHorizontal,
  Pencil,
  MessageCircleMore,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { CreateTaskDialog } from "./create-task-dialog";
import { EditTaskDialog } from "./edit-task-dialog";
import { CommentsDialog } from "./task-comments-dialog";

import { toast } from "sonner";

import { socket } from "@/lib/socket-client/socket";

import { deleteTask, updateTaskStatus } from "@/server/actions/task-actions";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

type ProjectBoardProps = {
  workspaceSlug: string;
  projectId: string;
  tasks: Task[];
  members: TaskMember[];
};

const columns: {
  title: string;
  status: TaskStatus;
}[] = [
  {
    title: "Todo",
    status: "TODO",
  },
  {
    title: "In progress",
    status: "IN_PROGRESS",
  },
  {
    title: "Review",
    status: "REVIEW",
  },
  {
    title: "Done",
    status: "DONE",
  },
];

export function ProjectBoard({
  workspaceSlug,
  projectId,
  tasks,
  members,
}: ProjectBoardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("TODO");

  const [localTasks, setLocalTasks] = useState(tasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const joinProject = () => {
      socket.emit("joinProjectRoom", projectId);
    };
    const onCreated = (payload: TaskEvent) => {
      if (payload.projectId !== projectId) return;
      setLocalTasks((current) =>
        current.some((task) => task.id === payload.task.id)
          ? current
          : [...current, payload.task],
      );
    };
    const onDeleted = (payload: TaskDeletedEvent) => {
      if (payload.projectId !== projectId) return;
      setLocalTasks((current) =>
        current.filter((task) => task.id !== payload.taskId),
      );
    };
    const onStatusUpdated = (payload: TaskStatusEvent) => {
      if (payload.projectId !== projectId) return;
      setLocalTasks((current) =>
        current.map((task) =>
          task.id === payload.taskId
            ? { ...task, status: payload.status }
            : task,
        ),
      );
    };
    const onEdited = (payload: TaskEvent) => {
      if (payload.projectId !== projectId) return;
      setLocalTasks((current) =>
        current.map((task) =>
          task.id === payload.task.id ? payload.task : task,
        ),
      );
    };

    socket.on("taskCreated", onCreated);
    socket.on("taskDeleted", onDeleted);
    socket.on("taskStatusUpdated", onStatusUpdated);
    socket.on("taskEdited", onEdited);
    // Rejoin after reconnecting: disconnected sockets lose their rooms.
    socket.on("connect", joinProject);
    if (socket.connected) joinProject();

    return () => {
      socket.off("connect", joinProject);
      socket.off("taskCreated", onCreated);
      socket.off("taskDeleted", onDeleted);
      socket.off("taskStatusUpdated", onStatusUpdated);
      socket.off("taskEdited", onEdited);
      if (socket.connected) socket.emit("leaveProjectRoom", projectId);
    };
  }, [projectId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalTasks(tasks);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const openCreateTaskDialog = (status: TaskStatus) => {
    setDefaultStatus(status);
    setDialogOpen(true);
  };

  const findColumnStatus = (id: string): TaskStatus | null => {
    const column = columns.find((column) => column.status === id);

    if (column) {
      return column.status;
    }

    const task = localTasks.find((task) => task.id === id);

    return task?.status ?? null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = localTasks.find((task) => task.id === event.active.id);

    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);

    const { active, over } = event;

    if (!over) {
      return;
    }

    const activeTaskId = String(active.id);
    const overId = String(over.id);

    const draggedTask = localTasks.find((task) => task.id === activeTaskId);

    if (!draggedTask) {
      return;
    }

    const newStatus = findColumnStatus(overId);

    if (!newStatus) {
      return;
    }

    if (draggedTask.status === newStatus) {
      return;
    }

    const previousTasks = localTasks;

    setLocalTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === activeTaskId
          ? {
              ...task,
              status: newStatus,
            }
          : task,
      ),
    );

    startTransition(async () => {
      try {
        await updateTaskStatus(
          workspaceSlug,
          projectId,
          activeTaskId,
          newStatus,
        );

        socket.emit("taskStatusUpdated", {
          projectId,
          taskId: activeTaskId,
          status: newStatus,
        });

        toast.success("Task status updated");
      } catch (error) {
        console.error(error);
        setLocalTasks(previousTasks);
        toast.error("Failed to update task status");
      }
    });
  };

  return (
    <>
      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">
              Board
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Drag tasks between columns to update their status.
            </p>
          </div>

          <Button
            onClick={() => openCreateTaskDialog("TODO")}
            disabled={isPending}
            className="h-11 cursor-pointer rounded-xl bg-amber-400 px-5 font-semibold text-slate-950 shadow-sm transition hover:bg-amber-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create task
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid gap-4 xl:grid-cols-4">
            {columns.map((column) => {
              const columnTasks = localTasks.filter(
                (task) => task.status === column.status,
              );

              return (
                <TaskColumn
                  key={column.status}
                  title={column.title}
                  status={column.status}
                  tasks={columnTasks}
                  workspaceSlug={workspaceSlug}
                  projectId={projectId}
                  members={members}
                  onAddTask={() => openCreateTaskDialog(column.status)}
                />
              );
            })}
          </div>

          <DragOverlay>
            {activeTask ? (
              <TaskCard
                task={activeTask}
                workspaceSlug={workspaceSlug}
                projectId={projectId}
                members={members}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </section>

      <CreateTaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultStatus={defaultStatus}
        workspaceSlug={workspaceSlug}
        projectId={projectId}
        members={members}
      />
    </>
  );
}

function TaskColumn({
  title,
  status,
  tasks,
  workspaceSlug,
  projectId,
  members,
  onAddTask,
}: {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  workspaceSlug: string;
  projectId: string;
  members: TaskMember[];
  onAddTask: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-96 rounded-3xl border p-4 shadow-sm transition ${
        isOver
          ? "border-amber-300 bg-amber-50/60"
          : "border-slate-200 bg-white/70"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>

        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
          {tasks.length}
        </span>
      </div>

      <button
        type="button"
        onClick={onAddTask}
        className="mb-4 flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white text-sm font-medium text-slate-500 transition hover:border-amber-300 hover:bg-amber-50 hover:text-slate-900"
      >
        <Plus className="h-4 w-4" />
        Add task
      </button>

      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-center text-sm text-slate-400">
              Drop tasks here
            </div>
          ) : (
            tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                workspaceSlug={workspaceSlug}
                projectId={projectId}
                members={members}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableTaskCard({
  task,
  workspaceSlug,
  projectId,
  members,
}: {
  task: Task;
  workspaceSlug: string;
  projectId: string;
  members: TaskMember[];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? "opacity-40" : ""}
    >
      <TaskCard
        task={task}
        workspaceSlug={workspaceSlug}
        projectId={projectId}
        members={members}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </div>
  );
}

function TaskCard({
  task,
  workspaceSlug,
  projectId,
  members,
  dragAttributes,
  dragListeners,
  isOverlay = false,
}: {
  task: Task;
  workspaceSlug: string;
  projectId: string;
  members: TaskMember[];
  dragAttributes?: React.HTMLAttributes<HTMLButtonElement>;
  dragListeners?: React.HTMLAttributes<HTMLButtonElement>;
  isOverlay?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);

  const assigneeName = task.assignee?.name || task.assignee?.email;
  const assigneeInitials = getInitials(assigneeName || "Unassigned");

  const handleDeleteTask = () => {
    startTransition(async () => {
      try {
        await deleteTask(workspaceSlug, projectId, task.id);

        socket.emit("taskDeleted", { projectId, taskId: task.id });

        toast.success("Task deleted");
        setDeleteDialogOpen(false);
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete task");
      }
    });
  };

  return (
    <>
      <article
        className={`group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition ${
          isOverlay
            ? "rotate-2 shadow-xl"
            : "hover:-translate-y-0.5 hover:shadow-md"
        }`}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <button
            type="button"
            {...dragAttributes}
            {...dragListeners}
            className="text-2xl mt-0.5 flex h-6 w-4 shrink-0 cursor-grab items-center justify-center rounded text-slate-300 transition hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing"
          >
            ⋮⋮
          </button>
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-950">
              {task.title}
            </p>

            <p className="mt-1 text-[11px] font-medium text-slate-400">
              TASK-{task.id.slice(0, 5).toUpperCase()}
            </p>
          </div>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                disabled={isPending}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-400 opacity-0 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="right"
              align="start"
              sideOffset={8}
              className="w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
            >
              <DropdownMenuLabel className="px-2 py-1 text-xs font-medium text-slate-500">
                Task actions
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setEditDialogOpen(true);
                }}
                className="cursor-pointer rounded-xl py-2.5"
              >
                <Pencil className="mr-2 h-4 w-4 text-amber-600" />
                Edit task
              </DropdownMenuItem>

              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setCommentsDialogOpen(true);
                }}
                className="cursor-pointer rounded-xl py-2.5"
              >
                <MessageCircleMore className="mr-2 h-4 w-4 text-blue-600" />
                Comments
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setDeleteDialogOpen(true);
                }}
                className="cursor-pointer rounded-xl py-2.5 text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="mb-4 line-clamp-2 text-xs leading-5 text-slate-500">
          {task.description || "No description"}
        </p>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className={getPriorityClassName(task.priority)}>
            <Flag className="h-3 w-3" />
            {formatPriority(task.priority)}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
            <CalendarDays className="h-3 w-3" />
            {task.dueDate ? formatDate(task.dueDate) : "No due date"}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="flex min-w-0 items-center gap-2">
            {task.assignee ? (
              <>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-semibold text-amber-700">
                  {assigneeInitials}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-slate-700">
                    {assigneeName}
                  </p>
                  <p className="truncate text-[11px] text-slate-400">
                    Assignee
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100">
                  <CircleUserRound className="h-3.5 w-3.5" />
                </div>
                Unassigned
              </div>
            )}
          </div>

          <span className="text-[11px] text-slate-400">
            {formatDate(task.createdAt)}
          </span>
        </div>
      </article>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl border-slate-200 bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold tracking-tight text-slate-950">
              Delete task?
            </AlertDialogTitle>

            <AlertDialogDescription className="text-sm leading-6 text-slate-500">
              This action cannot be undone. The task
              <span className="font-medium text-slate-700">
                &quot;{task.title}&quot;
              </span>{" "}
              will be permanently deleted from this project.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isPending}
              className="cursor-pointer rounded-xl"
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={isPending}
              onClick={handleDeleteTask}
              className="cursor-pointer rounded-xl bg-red-600 text-white hover:bg-red-700"
            >
              {isPending ? "Deleting..." : "Delete task"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditTaskDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        workspaceSlug={workspaceSlug}
        projectId={projectId}
        task={task}
        members={members}
      />

      <CommentsDialog
        open={commentsDialogOpen}
        onOpenChange={setCommentsDialogOpen}
        workspaceSlug={workspaceSlug}
        projectId={projectId}
        task={task}
      />
    </>
  );
}

function getPriorityClassName(priority: TaskPriority) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold";

  if (priority === "HIGH") {
    return `${base} bg-red-50 text-red-600`;
  }

  if (priority === "MEDIUM") {
    return `${base} bg-amber-50 text-amber-700`;
  }

  return `${base} bg-emerald-50 text-emerald-700`;
}

function formatPriority(priority: TaskPriority) {
  if (priority === "LOW") return "Low";
  if (priority === "MEDIUM") return "Medium";
  return "High";
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getInitials(value: string) {
  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
