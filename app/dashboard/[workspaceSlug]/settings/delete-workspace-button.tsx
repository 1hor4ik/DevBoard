"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteWorkspace } from "@/server/actions/workspace-actions";

import { Button } from "@/components/ui/button";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type DeleteWorkspaceButtonProps = {
  workspaceId: string;
};

export function DeleteWorkspaceButton({
  workspaceId,
}: DeleteWorkspaceButtonProps) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        const result = await deleteWorkspace(workspaceId);

        toast.success(result.message);

        router.push("/dashboard");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to delete workspace.",
        );
      }
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="
            h-13
            cursor-pointer
            border-red-200
            text-red-600
            transition-all
            duration-200
            hover:-translate-y-1
            hover:border-red-500
            hover:bg-red-50
            hover:text-red-700
            hover:shadow-sm
            active:translate-y-0
            active:scale-95
          "
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete workspace
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-md rounded-2xl border border-neutral-200 bg-white shadow-xl">
        <AlertDialogHeader className="space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>

          <AlertDialogTitle className="text-xl font-semibold text-neutral-900">
            Delete workspace?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-sm leading-6 text-neutral-600">
            This action is permanent.
            <br />
            All projects, tasks, members and invitations inside this workspace
            will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6 gap-2">
          <AlertDialogCancel
            className="
        cursor-pointer
        rounded-xl
        border-neutral-300
        hover:bg-neutral-100
      "
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="
        cursor-pointer
        rounded-xl
        bg-red-600
        text-white
        hover:bg-red-700
        focus:ring-2
        focus:ring-red-300
      "
          >
            {isPending ? "Deleting..." : "Delete workspace"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
