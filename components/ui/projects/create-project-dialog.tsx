"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";

import {
  createProjectSchema,
  type CreateProjectSchema,
} from "@/lib/validations/projectValidator";

import { createProject } from "@/server/actions/project-actions";

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
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type CreateProjectDialogProps = {
  workspaceSlug: string;
};

export function CreateProjectDialog({
  workspaceSlug,
}: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateProjectSchema>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      dueDate: "",
    },
  });

  const onSubmit = async (values: CreateProjectSchema) => {
    try {
      setIsLoading(true);

      const result = await createProject(
        workspaceSlug,
        values.name,
        values.description || "",
        values.dueDate || "",
      );

      if (!result) {
        throw new Error("Failed to create project");
      }

      toast.success("Project created!");
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 cursor-pointer rounded-xl bg-amber-400 px-5 font-semibold text-slate-950 shadow-sm transition hover:bg-amber-500">
          <Plus className="mr-2 h-4 w-4" />
          Create project
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-3xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-lg">
        <div className="border-b border-slate-200 px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight text-slate-950">
              Create new project
            </DialogTitle>

            <DialogDescription className="text-sm text-slate-500">
              Add a project to this workspace and start organizing tasks.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="DevBoard MVP"
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
                        placeholder="Short description of this project..."
                        disabled={isLoading}
                        className="min-h-28 resize-none rounded-xl"
                      />
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

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => setOpen(false)}
                  className="h-11 cursor-pointer rounded-xl"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-11 cursor-pointer rounded-xl bg-amber-400 px-5 font-semibold text-slate-950 shadow-sm transition hover:bg-amber-500"
                >
                  {isLoading ? <Spinner /> : "Create project"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
