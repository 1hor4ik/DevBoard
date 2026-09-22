import Link from "next/link";
import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  Settings,
  Users,
} from "lucide-react";
import { WorkspaceSwitcher } from "@/components/ui/dashboard/workspace-switcher";

type SidebarWorkspaceProps = {
  id: string;
  name: string;
  slug: string;
  role: string;
};

type DashboardSidebarProps = {
  workspaceSlug: string;
  workspaces: SidebarWorkspaceProps[];
};

const navItems = [
  {
    label: "Overview",
    href: "",
    icon: LayoutDashboard,
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    label: "My Tasks",
    href: "/my-tasks",
    icon: ListChecks,
  },
  {
    label: "Members",
    href: "/members",
    icon: Users,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar({ workspaceSlug, workspaces }: DashboardSidebarProps) {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white/80 p-4 backdrop-blur lg:block">
      <Link href="/" className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-sm font-bold text-white shadow-sm">
          {"</>"}
        </div>

        <span className="text-lg font-semibold tracking-tight text-slate-950">
          DevBoard
        </span>
      </Link>

      <div className="mb-6">
        <WorkspaceSwitcher
          currentWorkspaceSlug={workspaceSlug}
          workspaces={workspaces}
        />
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={`/dashboard/${workspaceSlug}${item.href}`}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-amber-50 hover:text-slate-950"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
