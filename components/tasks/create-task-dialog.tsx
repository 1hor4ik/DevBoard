"use client";

import type { TaskStatus, TaskMember } from "@/types/task";
import { statusOptions, priorityOptions } from "@/lib/constants/tasks";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createTaskSchema,
  type CreateTaskSchema,
} from "@/lib/validations/taskValidator";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { createTask } from "@/server/actions/task-actions";
import { socket } from "@/lib/socket-client/socket";

type CreateTaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStatus: TaskStatus;
  workspaceSlug: string;
  projectId: string;
  members: TaskMember[];
};

export function CreateTaskDialog({
  open,
  onOpenChange,
  defaultStatus,
  workspaceSlug,
  projectId,
  members,
}: CreateTaskDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateTaskSchema>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: defaultStatus,
      priority: "MEDIUM",
      assigneeId: "",
      dueDate: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: "",
        description: "",
        status: defaultStatus,
        priority: "MEDIUM",
        assigneeId: "",
        dueDate: "",
      });
    }
  }, [open, defaultStatus, form]);

  const onSubmit = async (values: CreateTaskSchema) => {
    try {
      setIsLoading(true);

      const createdTask = await createTask(
        workspaceSlug,
        projectId,
        values.title,
        values.description,
        values.status,
        values.priority,
        values.assigneeId,
        values.dueDate,
      );

      socket.emit("taskCreated", {
        workspaceSlug,
        projectId,
        task: createdTask,
      });

      toast.success("Task created successfully!");

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-xl">
        <div className="border-b border-slate-200 px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight text-slate-950">
              Create new task
            </DialogTitle>

            <DialogDescription className="text-sm text-slate-500">
              Add a task to this project and assign it to a workspace member.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task title</FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Design dashboard sidebar"
                        disabled={isLoading}
                        className="h-11 rounded-xl"
                      />
                    </FormControl>

                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>

                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe what should be done..."
                        disabled={isLoading}
                        className="min-h-28 resize-none rounded-xl"
                      />
                    </FormControl>

                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>

                      <FormControl>
                        <select
                          {...field}
                          disabled={isLoading}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {statusOptions.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>

                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>

                      <FormControl>
                        <select
                          {...field}
                          disabled={isLoading}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {priorityOptions.map((priority) => (
                            <option key={priority.value} value={priority.value}>
                              {priority.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>

                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="assigneeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assignee</FormLabel>

                      <FormControl>
                        <select
                          {...field}
                          disabled={isLoading}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Unassigned</option>

                          {members.map((member) => (
                            <option key={member.id} value={member.id}>
                              {member.name || member.email}
                            </option>
                          ))}
                        </select>
                      </FormControl>

                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due date</FormLabel>

                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          disabled={isLoading}
                          className="h-11 rounded-xl"
                        />
                      </FormControl>

                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => onOpenChange(false)}
                  className="h-11 cursor-pointer rounded-xl"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-11 cursor-pointer rounded-xl bg-amber-400 px-5 font-semibold text-slate-950 shadow-sm transition hover:bg-amber-500"
                >
                  {isLoading ? <Spinner /> : "Create task"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
