"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export function DashboardToast() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const toastType = params.get("toast");

    if (toastType === "joined") {
      toast.success("Successfully joined workspace!");

      router.replace(window.location.pathname);
    }
  }, []);

  return null;
}
