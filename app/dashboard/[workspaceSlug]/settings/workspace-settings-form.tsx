"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Pencil, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { updateWorkspace } from "@/server/actions/workspace-actions";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  workspace: {
    id: string;
    name: string;
    slug: string;
  };

  canManage: boolean;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

export function WorkspaceSettingsForm({ workspace, canManage }: Props) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(workspace.name);

  const slug = useMemo(() => slugify(name), [name]);

  const hasChanges = name.trim() !== workspace.name;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      try {
        const result = await updateWorkspace(workspace.id, name);

        toast.success(result.message);

        router.push(`/dashboard/${result.slug}/settings`);

        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Something went wrong.",
        );
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Workspace name</label>

        <div className="relative">
          <Pencil className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 pl-10"
            disabled={!canManage || isPending}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Workspace URL</label>

        <div className="flex">
          <div className="flex h-11 items-center rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 px-3 text-sm text-slate-500">
            devboard.com/
          </div>

          <Input
            value={slug}
            readOnly
            disabled
            className="h-11 rounded-l-none"
          />
        </div>

        <p className="text-xs text-slate-500">
          Generated automatically from the workspace name.
        </p>
      </div>

      {canManage && (
        <Button
          type="submit"
          disabled={!hasChanges || isPending}
          className="cursor-pointer bg-amber-400 text-slate-950 hover:bg-amber-500 h-10"
        >
          <Save className="mr-2 h-4 w-4" />

          {isPending ? <Spinner /> : "Save changes"}
        </Button>
      )}
    </form>
  );
}
