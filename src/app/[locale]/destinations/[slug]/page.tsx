import { DestinationDetailScreen } from "@/features/destinations/components/DestinationDetailScreen";

/**
 * Public destination detail route (`/[locale]/destinations/[slug]`). Home for
 * everyone — guests included — so it lives outside the role route groups (no
 * AppShell/guard). Thin: resolves the slug and composes the feature screen,
 * which loads the destination through the data seam and renders all states.
 */
export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  return <DestinationDetailScreen slug={slug} />;
}
