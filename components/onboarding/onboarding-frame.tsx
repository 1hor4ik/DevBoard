import { CheckCircle2 } from "lucide-react";

export default function OnboardingFrame() {
  return (
    <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
      <div className="flex gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

        <div>
          <p className="text-sm font-semibold text-slate-900">
            What happens next?
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            We&apos;ll create your workspace and you&apos;ll become the owner.
            After that, you can create your first project.
          </p>
        </div>
      </div>
    </div>
  );
}
