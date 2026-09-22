import Link from "next/link";
import { ArrowLeft, Home, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FAF8F3] px-6">
      <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />
      <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-amber-300/30 blur-3xl" />

      <div className="absolute right-10 top-10 hidden grid-cols-6 gap-2 opacity-40 md:grid">
        {Array.from({ length: 36 }).map((_, index) => (
          <span key={index} className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        ))}
      </div>

      <section className="relative z-10 w-full max-w-2xl text-center">
        <Link href="/" className="mx-auto mb-10 flex w-fit items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400 text-sm font-bold text-white shadow-sm">
            {"</>"}
          </div>

          <span className="text-xl font-semibold tracking-tight text-slate-950">
            DevBoard
          </span>
        </Link>

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-200 bg-amber-50 text-amber-700 shadow-sm">
          <SearchX className="h-9 w-9" />
        </div>

        <p className="mb-4 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
          404 — Page not found
        </p>

        <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
          This page or content wasn&apos;t found.
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-500">
          The page you&apos;re looking for may have been moved, deleted, or you
          may not have permission to access this workspace.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            asChild
            className="h-11 cursor-pointer rounded-xl bg-amber-400 px-5 font-semibold text-slate-950 shadow-sm transition hover:bg-amber-500"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go home
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-11 cursor-pointer rounded-xl bg-white px-5"
          >
            <Link href="/onboarding">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to workspace
            </Link>
          </Button>
        </div>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white/80 p-5 text-left shadow-sm backdrop-blur">
          <p className="text-sm font-semibold text-slate-950">
            Why am I seeing this?
          </p>

          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-500">
            <li>• The workspace URL may be incorrect.</li>
            <li>• The project or page may not exist yet.</li>
            <li>• You may not be a member of this workspace.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
