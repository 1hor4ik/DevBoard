function ProjectItem({
  name,
  status,
  tone,
}: {
  name: string;
  status: string;
  tone: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`h-8 w-8 rounded-lg ${tone}`} />
        <div>
          <p className="text-xs font-semibold text-slate-800">{name}</p>
          <p className="text-[10px] text-slate-400">Workspace project</p>
        </div>
      </div>

      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
        {status}
      </span>
    </div>
  );
}

function ProgressBars() {
  const bars = [32, 54, 42, 68, 74, 46, 88];

  return (
    <div className="mt-5 flex h-20 items-end gap-2">
      {bars.map((height, index) => (
        <div
          key={index}
          className="w-full rounded-t-md bg-amber-300"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}

export function SignUpFrame() {
  return (
    <section className="relative hidden overflow-hidden border-l border-slate-200/70 bg-white lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.25),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.14),transparent_35%)]" />

      <div className="absolute right-20 top-16 h-28 w-28 rounded-full bg-amber-300/35 blur-2xl" />
      <div className="absolute bottom-16 left-16 h-64 w-64 rounded-full bg-amber-200/35 blur-3xl" />
      <div className="absolute left-16 top-20 h-24 w-24 rotate-12 rounded-3xl border border-amber-300/50" />
      <div className="absolute bottom-24 right-20 h-16 w-16 rotate-45 rounded-2xl border border-amber-300/50" />

      <div className="absolute right-12 top-12 grid grid-cols-6 gap-2 opacity-40">
        {Array.from({ length: 36 }).map((_, index) => (
          <span key={index} className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        ))}
      </div>

      <div className="relative z-10 flex h-full items-center justify-center p-12">
        <div className="w-full max-w-xl">
          <div className="mb-8">
            <div className="mb-4 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
              Start your first workspace
            </div>

            <h2 className="max-w-md text-4xl font-bold tracking-tight text-slate-950">
              Create your team space and turn ideas into shipped work.
            </h2>

            <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
              Build workspaces, organize projects, assign tasks, and track
              progress with a clean collaboration dashboard.
            </p>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_30px_100px_-45px_rgba(15,23,42,0.45)]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    Your first workspace
                  </p>
                  <p className="text-xs text-slate-500">
                    Plan your MVP from day one
                  </p>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  Active
                </span>
              </div>

              <div className="space-y-3">
                <ProjectItem
                  name="DevBoard MVP"
                  status="Active"
                  tone="bg-amber-200"
                />
                <ProjectItem
                  name="Portfolio Redesign"
                  status="Planning"
                  tone="bg-slate-200"
                />
                <ProjectItem
                  name="Smart IT Content"
                  status="Active"
                  tone="bg-amber-400"
                />
              </div>
            </div>

            <div className="absolute -bottom-20 -right-5 w-60 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Current sprint
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">68%</p>
                </div>

                <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-[8px] border-amber-100">
                  <div className="absolute inset-[-8px] rounded-full border-[8px] border-transparent border-t-amber-400 border-r-amber-400" />
                  <span className="text-xs font-semibold text-slate-700">
                    Done
                  </span>
                </div>
              </div>

              <ProgressBars />
            </div>

            <div className="absolute -left-8 -top-8 w-56 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
              <p className="mb-3 text-xs font-medium text-slate-500">
                What you can build
              </p>

              <div className="space-y-3">
                <FeatureItem title="Workspaces" />
                <FeatureItem title="Kanban boards" />
                <FeatureItem title="Team roles" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureItem({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50">
        <div className="h-2 w-2 rounded-full bg-amber-400" />
      </div>

      <p className="text-xs font-medium text-slate-700">{title}</p>
    </div>
  );
}
