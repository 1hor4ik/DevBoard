export default function CommentSkeletonList() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex gap-4">
            {/* Avatar skeleton */}
            <div className="h-11 w-11 shrink-0 rounded-full bg-slate-200" />

            <div className="min-w-0 flex-1 space-y-3">
              {/* Name and Date skeleton */}
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 rounded bg-slate-200" />
                <div className="h-3 w-16 rounded bg-slate-200" />
              </div>

              {/* Text content skeleton */}
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-slate-200" />
                <div className="h-4 w-3/4 rounded bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
