import { AgencyDetailScreen } from "@/features/destinations/components/AgencyDetailScreen";

/**
 * Public agency profile route (`/[locale]/agencies/[slug]`). Home for everyone —
 * guests included — so it lives outside the role route groups (no AppShell/guard).
 * Thin: resolves the slug and composes the feature screen, which loads the agency
 * through the data seam and renders all loading / not-found / error / success states.
 */
export default async function AgencyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  return <AgencyDetailScreen slug={slug} />;
}
