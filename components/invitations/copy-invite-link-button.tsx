"use client";

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

type CopyInviteLinkButtonProps = {
  token: string;
};

export default function CopyInviteLinkButton({
  token,
}: CopyInviteLinkButtonProps) {
  async function handleCopy() {
    const inviteLink = `http://localhost:3000/invite/${token}`;

    await navigator.clipboard.writeText(inviteLink);

    toast.success("Invite link copied to clipboard!");
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="cursor-pointer border-slate-300 font-medium transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
    >
      <Copy className="mr-2 h-4 w-4" />
      Copy link
    </Button>
  );
}
