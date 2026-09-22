"use client";

import { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";

import {
  inviteMemberSchema,
  type InviteMemberSchema,
} from "@/lib/validations/inviteMemberValidator";

import { createInvitation } from "@/server/actions/invitation-actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UserPlus } from "lucide-react";

export default function SendInvitationDialog({
  workspaceSlug,
}: {
  workspaceSlug: string;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<InviteMemberSchema>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "MEMBER",
    },
  });

  async function onSubmit(values: InviteMemberSchema) {
    try {
      setIsLoading(true);

      await createInvitation({
        email: values.email,
        role: values.role,
        workspaceSlug: workspaceSlug,
      });

      toast.success("Invitation sent!");
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to send invitation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-amber-400 px-5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-amber-500"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Invite member
        </button>
      </DialogTrigger>

      <DialogContent className="rounded-3xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-lg">
        <div className="border-b border-slate-200 px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight text-slate-950">
              Invite member
            </DialogTitle>

            <DialogDescription className="text-sm text-slate-500">
              Add a member to this workspace and start collaborating.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="member@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                      >
                        <option value="MEMBER">Member</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  className="h-11 cursor-pointer rounded-xl bg-slate-100 px-5 font-semibold text-slate-950 shadow-sm transition hover:bg-slate-200"
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-11 cursor-pointer rounded-xl bg-amber-400 px-5 font-semibold text-slate-950 shadow-sm transition hover:bg-amber-500"
                >
                  {isLoading ? <Spinner /> : "Invite"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
