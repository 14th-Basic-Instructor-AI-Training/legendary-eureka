import { TourDetailScreen } from "@/features/tours/components/TourDetailScreen";

/**
 * Public tour detail route (`/[locale]/tours/[id]`). Home for everyone — guests
 * included — so it lives outside the role route groups (no AppShell/guard). The
 * booking + review actions inside are gated through the permissions module.
 * Thin: resolves the id (id or slug) and composes the feature screen, which loads
 * the tour through the data seam and renders all states.
 */
export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  return <TourDetailScreen id={id} />;
}
