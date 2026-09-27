import { ActivityFeed } from "@/components/ui/dashboard/activity-feed";

export default async function ActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { workspaceSlug } = await params;
  const query = await searchParams;
  const parsed = Number(query.page ?? 1);
  const page =
    Number.isSafeInteger(parsed) && parsed > 0 ? Math.min(parsed, 10000) : 1;
  return <ActivityFeed workspaceSlug={workspaceSlug} page={page} />;
}
