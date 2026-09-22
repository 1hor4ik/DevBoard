import { headers } from "next/headers";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

import OnboardingClient from "./onboarding-client";

export default async function OnboardingPage() {
  const session = await getSession(await headers());

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const existingMembership = await prisma.workspaceMember.findFirst({
    where: {
      userId: session.user.id,
    },
    include: {
      workspace: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (existingMembership) {
    redirect(`/dashboard/${existingMembership.workspace.slug}`);
  }

  return <OnboardingClient />;
}
