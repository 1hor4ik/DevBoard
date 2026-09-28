import { Skeleton } from "@/components/ui/skeleton";

export function DashboardPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="w-full rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="w-full space-y-4">
            <Skeleton className="h-6 w-28 rounded-full" />

            <Skeleton className="h-10 w-72" />

            <Skeleton className="h-4 w-full " />
            <Skeleton className="h-4 w-full " />
          </div>

          <Skeleton className="h-11 w-40 rounded-xl" />
        </div>
      </section>

      {/* Stats */}
      <section className="grid w-full gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="w-full rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm"
          >
            <Skeleton className="mb-5 h-11 w-11 rounded-2xl" />

            <Skeleton className="mb-3 h-4 w-24" />

            <Skeleton className="mb-2 h-10 w-14" />

            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </section>

      {/* Bottom */}
      <section className="grid w-full gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="w-full rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <Skeleton className="mb-2 h-6 w-44" />
          <Skeleton className="mb-6 h-4 w-60" />

          <div className="rounded-2xl border border-dashed border-slate-200 p-6">
            <div className="space-y-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <Skeleton className="mb-2 h-6 w-40" />
          <Skeleton className="mb-6 h-4 w-52" />

          <div className="rounded-2xl border border-dashed border-slate-200 p-6">
            <div className="space-y-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
