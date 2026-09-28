export default function AuthPreviewPanel() {
  return (
    <section className="relative hidden overflow-hidden border-l border-slate-200/70 bg-white lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.22),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.15),transparent_35%)]" />

      <div className="absolute left-12 top-12 h-24 w-24 rounded-full border border-amber-300/50" />
      <div className="absolute right-16 top-28 h-40 w-40 rounded-full bg-amber-300/25 blur-2xl" />
      <div className="absolute bottom-20 left-20 h-52 w-52 rounded-full bg-amber-200/30 blur-3xl" />

      <div className="absolute right-10 top-10 grid grid-cols-6 gap-2 opacity-40">
        {Array.from({ length: 36 }).map((_, index) => (
          <span key={index} className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        ))}
      </div>

      <div className="relative z-10 flex h-full items-center justify-center p-12">
        <div className="w-full max-w-xl">
          <div className="mb-8">
            <div className="mb-4 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
              Built for productive teams
            </div>

            <h2 className="max-w-md text-4xl font-bold tracking-tight text-slate-950">
              Plan, track, and ship your work with confidence.
            </h2>

            <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
              DevBoard gives small teams a clean workspace for projects, tasks,
              collaboration, and progress tracking.
            </p>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_30px_100px_-45px_rgba(15,23,42,0.45)]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    Sprint 12
                  </p>
                  <p className="text-xs text-slate-500">DevBoard MVP</p>
                </div>

                <div className="flex -space-x-2">
                  <div className="h-8 w-8 rounded-full border-2 border-white bg-amber-200" />
                  <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-200" />
                  <div className="h-8 w-8 rounded-full border-2 border-white bg-amber-400" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <KanbanColumn
                  title="To Do"
                  tone="bg-slate-50"
                  tasks={[
                    "Create auth flow",
                    "Design onboarding",
                    "Add project cards",
                  ]}
                />

                <KanbanColumn
                  title="In Progress"
                  tone="bg-amber-50"
                  tasks={["Build dashboard", "Create task modal"]}
                />

                <KanbanColumn
                  title="Done"
                  tone="bg-emerald-50"
                  tasks={["Setup Next.js", "Install shadcn/ui"]}
                />
              </div>
            </div>

            <div className="absolute -bottom-16 -left-8 w-52 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">
                  Team velocity
                </p>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  +12%
                </span>
              </div>

              <p className="text-3xl font-bold text-slate-950">24.5</p>

              <div className="mt-4 flex h-16 items-end gap-1">
                {[24, 38, 30, 48, 44, 58, 70].map((height, index) => (
                  <div
                    key={index}
                    className="w-full rounded-t-md bg-amber-300"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="absolute -right-6 -top-10 w-56 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
              <p className="mb-3 text-xs font-medium text-slate-500">
                Recent activity
              </p>

              <div className="space-y-3">
                <ActivityItem title="Task moved to Done" time="2m ago" />
                <ActivityItem title="Comment added" time="8m ago" />
                <ActivityItem title="New member invited" time="16m ago" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function KanbanColumn({
  title,
  tasks,
  tone,
}: {
  title: string;
  tasks: string[];
  tone: string;
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 p-3 ${tone}`}>
      <p className="mb-3 text-xs font-semibold text-slate-700">{title}</p>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task}
            className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
          >
            <p className="text-xs font-medium leading-5 text-slate-800">
              {task}
            </p>
            <div className="mt-2 h-1.5 w-12 rounded-full bg-amber-300" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityItem({ title, time }: { title: string; time: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-amber-400" />
        <p className="text-xs font-medium text-slate-700">{title}</p>
      </div>

      <span className="text-[10px] text-slate-400">{time}</span>
    </div>
  );
}
