import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { LandingPage } from "@/components/landing/landing-page";

export default async function HomePage() {
  const user = await getCurrentUser(await headers());
  const membership = user
    ? await prisma.workspaceMember.findFirst({
        where: { userId: user.id },
        select: { workspace: { select: { slug: true } } },
        orderBy: { createdAt: "asc" },
      })
    : null;
  const destination = !user
    ? "/sign-up"
    : membership
      ? `/dashboard/${membership.workspace.slug}`
      : "/onboarding";
  return <LandingPage destination={destination} signedIn={!!user} />;
}
