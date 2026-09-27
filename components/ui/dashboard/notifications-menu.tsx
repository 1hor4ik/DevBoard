"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  MessageCircle,
  UserPlus,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/server/actions/notification-actions";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

type NotificationData = Awaited<ReturnType<typeof getNotifications>>;

export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<NotificationData | null>(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const request = useRef(0);
  const refresh = useCallback(async () => {
    const version = ++request.current;
    try {
      const result = await getNotifications();
      if (version === request.current) {
        setData(result);
        setError(false);
      }
    } catch {
      if (version === request.current) setError(true);
    }
  }, []);

  useEffect(() => {
    const update = () => {
      if (!document.hidden) void refresh();
    };
    const initial = setTimeout(update, 0);
    const timer = setInterval(update, 15000);
    window.addEventListener("focus", update);
    return () => {
      clearTimeout(initial);
      clearInterval(timer);
      window.removeEventListener("focus", update);
    };
  }, [refresh]);

  async function markRead(id?: string) {
    setBusy(true);
    request.current++;
    try {
      if (id) await markNotificationRead(id);
      else await markAllNotificationsRead();
      await refresh();
    } catch {
      toast.error("Could not mark notifications as read");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (value) void refresh();
      }}
    >
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications${data?.unreadCount ? `, ${data.unreadCount} unread` : ""}`}
          className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <Bell className="h-4 w-4" />
          {!!data?.unreadCount && (
            <span className="absolute -right-1 -top-1 rounded-full bg-amber-400 px-1.5 text-[10px] font-bold leading-5 text-slate-950">
              {data.unreadCount > 99 ? "99+" : data.unreadCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto border-slate-200 bg-[#FAF8F3] p-5 pt-12 data-[side=right]:w-[min(26rem,94vw)] data-[side=right]:sm:max-w-md">
        <SheetTitle className="text-xl font-bold text-slate-950">
          Notifications
        </SheetTitle>
        <SheetDescription>
          Your latest 30 updates across workspaces.
        </SheetDescription>
        {!!data?.unreadCount && (
          <button
            disabled={busy}
            onClick={() => void markRead()}
            className="flex items-center gap-2 self-start rounded-xl bg-amber-100 px-3 py-2 text-sm font-medium text-amber-900 disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </button>
        )}
        {error && (
          <div
            role="alert"
            className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            Could not load updates.{" "}
            <button onClick={() => void refresh()} className="underline">
              Retry
            </button>
          </div>
        )}
        {!data && !error && (
          <p role="status" className="text-sm text-slate-500">
            Loading notifications…
          </p>
        )}
        {data?.items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            <Bell className="mx-auto mb-3 h-8 w-8 text-amber-500" />
            You’re all caught up.
          </div>
        )}
        <div className="space-y-3">
          {data?.items.map((item) => {
            const Icon =
              item.type === "COMMENT"
                ? MessageCircle
                : item.type === "INVITATION"
                  ? UserPlus
                  : ClipboardList;
            return (
              <article
                key={item.id}
                className={`rounded-2xl border p-4 ${item.isRead ? "border-slate-200 bg-white" : "border-amber-200 bg-amber-50"}`}
              >
                <Link
                  href={item.href}
                  onClick={() => {
                    setOpen(false);
                    if (!item.isRead) void markRead(item.id);
                  }}
                  className="flex gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                  <div className="min-w-0">
                    <p className="break-words text-sm font-medium text-slate-900">
                      {item.message}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {item.workspaceName}
                    </p>
                    <time
                      className="text-xs text-slate-400"
                      dateTime={item.createdAt}
                    >
                      {new Date(item.createdAt).toLocaleString("en-GB")}
                    </time>
                  </div>
                </Link>
                {!item.isRead && (
                  <button
                    disabled={busy}
                    onClick={() => void markRead(item.id)}
                    className="mt-3 text-xs font-semibold text-amber-800 disabled:opacity-50"
                  >
                    Mark as read
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
