"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";

import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { cancelInvitation } from "@/server/actions/invitation-actions";

import { useRouter } from "next/navigation";

type CancelInvitationButtonProps = {
  invitationId: string;
};

export default function CancelInvitationButton({
  invitationId,
}: CancelInvitationButtonProps) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    startTransition(async () => {
      try {
        const result = await cancelInvitation(invitationId);

        toast.success(result.message);

        router.refresh();
      } catch {
        toast.error("Failed to cancel invitation.");
      }
    });
  }

  return (
    <Button
      type="button"
      size="sm"
      disabled={isPending}
      onClick={handleCancel}
      className="cursor-pointer bg-red-500 font-medium text-white transition-all hover:bg-red-600"
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <X className="mr-2 h-4 w-4" />
      )}
      Cancel
    </Button>
  );
}
