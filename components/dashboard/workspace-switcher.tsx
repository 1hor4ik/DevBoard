"use client";

import type { WorkspaceSummary } from "@/types/workspace";

import Link from "next/link";
import { ChevronDown, Plus, Check } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type WorkspaceSwitcherProps = {
  currentWorkspaceSlug: string;
  workspaces: WorkspaceSummary[];
};

export function WorkspaceSwitcher({
  currentWorkspaceSlug,
  workspaces,
}: WorkspaceSwitcherProps) {
  const currentWorkspace = workspaces.find(
    (workspace) => workspace.slug === currentWorkspaceSlug,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-[#FAF8F3] p-4 text-left transition hover:bg-amber-50">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950">
              {currentWorkspace?.name ?? "Workspace"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {currentWorkspace?.role?.toLowerCase() ?? "member"}
            </p>
          </div>

          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="z-[60] w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-2 shadow-lg"
      >
        <DropdownMenuLabel className="text-xs text-slate-500">
          Workspaces
        </DropdownMenuLabel>

        {workspaces.map((workspace) => {
          const isActive = workspace.slug === currentWorkspaceSlug;

          return (
            <DropdownMenuItem key={workspace.id} asChild>
              <Link
                href={`/dashboard/${workspace.slug}`}
                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {workspace.name}
                  </p>

                  <p className="text-xs text-slate-500">
                    {workspace.role.toLowerCase()}
                  </p>
                </div>

                {isActive && <Check className="h-4 w-4 text-amber-600" />}
              </Link>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            href="/create-workspace"
            className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Create workspace
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
