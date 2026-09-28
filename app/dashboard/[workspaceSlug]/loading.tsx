import { DashboardPageSkeleton } from "@/components/skeletons/card-skeleton";

export default function Loading() {
  return (
    <div className="w-full space-y-8">
      <DashboardPageSkeleton />
    </div>
  );
}
