"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { SidebarContent, type DashboardSidebarProps } from "./Sidebar";

export function MobileNavigation(props: DashboardSidebarProps) {
  const pathname = usePathname();
  const [openedPath, setOpenedPath] = useState<string | null>(null);
  const open = openedPath === pathname;
  const setOpen = (value: boolean) => setOpenedPath(value ? pathname : null);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
    const closeOnDesktop = () => { if (desktop.matches) setOpenedPath(null); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button type="button" aria-label="Open navigation menu" className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-800 shadow-sm transition hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 xl:hidden">
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="gap-0 overflow-y-auto border-slate-200 bg-[#FAF8F3] p-5 pt-6 text-slate-950 data-[side=left]:w-[min(20rem,88vw)]">
        <SheetTitle className="sr-only">Workspace navigation</SheetTitle>
        <SheetDescription className="sr-only">Switch workspaces or open a dashboard page.</SheetDescription>
        <SidebarContent {...props} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
