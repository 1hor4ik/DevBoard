import Link from "next/link";
import { Button } from "@/components/ui/button";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth-server";
import prisma from "@/lib/prisma";

export default async function HomePage() {
  const user = await getCurrentUser(await headers());

  const existingMembership = user
    ? await prisma.workspaceMember.findFirst({
        where: {
          userId: user.id,
        },
        include: {
          workspace: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      })
    : null;

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-semibold">
            DevBoard
          </Link>

          {user ? (
            <div className="flex">
              <Button asChild size="lg">
                <Link
                  href={`/dashboard/${existingMembership?.workspace?.slug}`}
                >
                  Go To My Dashboard
                </Link>
              </Button>
            </div>
          ) : (
            <nav className="flex items-center gap-3">
              <Button asChild variant="ghost">
                <Link href="/sign-in">Sign in</Link>
              </Button>

              <Button asChild>
                <Link href="/sign-up">Get started</Link>
              </Button>
            </nav>
          )}
        </div>
      </header>

      <section className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
        <p className="mb-4 rounded-full border px-4 py-1 text-sm text-muted-foreground">
          Project management for small developer teams
        </p>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          Organize projects, tasks, and teamwork in one clean workspace.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          DevBoard helps teams create workspaces, manage projects, organize
          tasks on Kanban boards, and track progress with a simple dashboard.
        </p>

        {user ? (
          <div className="mt-8 flex">
            <Button asChild size="lg">
              <Link href={`/dashboard/${existingMembership?.workspace?.slug}`}>
                Go To My Dashboard
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 flex gap-3">
            <Button asChild size="lg">
              <Link href="/sign-up">Get started</Link>
            </Button>

            <Button asChild size="lg" variant="outline">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
