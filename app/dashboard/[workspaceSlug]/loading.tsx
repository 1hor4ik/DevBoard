import { DashboardPageSkeleton } from "@/components/ui/skeletons/CardSkeleton";

export default function Loading() {
  return (
    <div className="w-full space-y-8">
      <DashboardPageSkeleton />
    </div>
  );
}
