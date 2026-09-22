import { Bell } from "lucide-react";
import { UserMenu } from "./user-menu";

type DashboardTopbarProps = {
  workspaceName: string;
  userName: string;
  userEmail: string;
  userImage?: string | null;
};

export function Topbar({
  workspaceName,
  userName,
  userEmail,
  userImage,
}: DashboardTopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">Workspace</p>
          <h1 className="truncate text-xl font-semibold tracking-tight text-slate-950">
            {workspaceName}
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50">
            <Bell className="h-4 w-4" />
          </button>

          <UserMenu
            userName={userName}
            userEmail={userEmail}
            userImage={userImage}
          />
        </div>
      </div>
    </header>
  );
}
