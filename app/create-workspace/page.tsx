import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth-server";

import CreateWorkspaceClient from "./create-workspace-client";

export default async function CreateWorkspacePage() {
  const session = await getSession(await headers());

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  return <CreateWorkspaceClient />;
}
