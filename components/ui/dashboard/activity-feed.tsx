import Link from "next/link";
import { headers } from "next/headers";
import {
  Activity,
  MessageCircle,
  UserPlus,
  ArrowRightLeft,
  Trash2,
  Plus,
  Pencil,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

const icons = {
  TASK_CREATED: Plus,
  TASK_UPDATED: Pencil,
  TASK_MOVED: ArrowRightLeft,
  TASK_DELETED: Trash2,
  COMMENT_CREATED: MessageCircle,
  MEMBER_JOINED: UserPlus,
};

export async function ActivityFeed({
  workspaceSlug,
  page = 1,
  compact = false,
}: {
  workspaceSlug: string;
  page?: number;
  compact?: boolean;
}) {
  const session = await getSession(await headers());
  if (!session?.user.id) return null;
  const workspace = await prisma.workspace.findFirst({
    where: {
      slug: workspaceSlug,
      members: { some: { userId: session.user.id } },
    },
    select: { id: true },
  });
  if (!workspace) return null;
  const limit = compact ? 8 : 25;
  const rows = await prisma.activity.findMany({
    where: { workspaceId: workspace.id },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * limit,
    take: limit + 1,
    include: { actor: { select: { name: true } } },
  });
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl bg-amber-100 p-3 text-amber-700">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-950">
            {compact ? "Recent activity" : "Workspace activity"}
          </h3>
          <p className="text-sm text-slate-500">Your team’s latest changes.</p>
        </div>
      </div>
      {!rows.length && (
        <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
          No activity yet. New actions will appear here.
        </p>
      )}
      <ol className="space-y-4">
        {rows.slice(0, limit).map((entry) => {
          const Icon = icons[entry.type];
          return (
            <li
              key={entry.id}
              className="flex gap-3 border-b border-slate-100 pb-4 last:border-0"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="break-words text-sm leading-6 text-slate-700">
                  {entry.message}
                </p>
                <time
                  dateTime={entry.createdAt.toISOString()}
                  className="text-xs text-slate-400"
                >
                  {entry.createdAt.toLocaleString("en-GB", { timeZone: "UTC" })}{" "}
                  UTC
                </time>
              </div>
            </li>
          );
        })}
      </ol>
      {compact ? (
        <Link
          href={`/dashboard/${workspaceSlug}/activity`}
          className="mt-4 inline-block text-sm font-semibold text-amber-800"
        >
          View all activity →
        </Link>
      ) : (
        <nav
          aria-label="Activity pages"
          className="mt-5 flex justify-between text-sm font-semibold text-amber-800"
        >
          {page > 1 ? (
            <Link href={`?page=${page - 1}`}>← Previous</Link>
          ) : (
            <span />
          )}
          {rows.length > limit && (
            <Link href={`?page=${page + 1}`}>Next →</Link>
          )}
        </nav>
      )}
    </section>
  );
}
