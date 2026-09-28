"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, Settings, User } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type UserMenuProps = {
  userName: string;
  userEmail: string;
  userImage?: string | null;
};

export function UserMenu({ userName, userEmail, userImage }: UserMenuProps) {
  const router = useRouter();

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      await authClient.signOut();

      toast.success("Logged out successfully");
      router.push("/sign-in");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
      setLogoutDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:bg-slate-50">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700">
              {userImage ? (
                <Image
                  src={userImage}
                  alt={userName}
                  width={32}
                  height={32}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                initials || "U"
              )}
            </div>

            <div className="hidden text-left md:block">
              <p className="text-sm font-medium text-slate-900">{userName}</p>
              <p className="text-xs text-slate-500">{userEmail}</p>
            </div>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-64 rounded-2xl border-slate-200 p-2 bg-white shadow-md"
        >
          <DropdownMenuLabel>
            <div>
              <p className="truncate text-sm font-semibold text-slate-950">
                {userName}
              </p>
              <p className="truncate text-xs font-normal text-slate-500">
                {userEmail}
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem className="cursor-pointer rounded-xl">
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer rounded-xl">
            <Settings className="mr-2 h-4 w-4" />
            Account settings
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setLogoutDialogOpen(true);
            }}
            className="cursor-pointer rounded-xl text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent className="rounded-3xl border-slate-200 bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold tracking-tight text-slate-950">
              Log out of DevBoard?
            </AlertDialogTitle>

            <AlertDialogDescription className="text-sm leading-6 text-slate-500">
              Are you sure you want to log out? You will need to sign in again
              to access your workspaces, projects, and tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isLoggingOut}
              className="cursor-pointer rounded-xl"
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="cursor-pointer rounded-xl bg-red-600 text-white hover:bg-red-700"
            >
              {isLoggingOut ? "Logging out..." : "Log out"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
