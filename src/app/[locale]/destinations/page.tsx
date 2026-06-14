import { DiscoverScreen } from "@/features/destinations/components/DiscoverScreen";

/**
 * Public Discover index (`/[locale]/destinations`). Home for everyone — guests
 * included — so it lives outside the role route groups (no AppShell/guard). Thin:
 * composes the feature screen, which loads catalog data through the data seam and
 * renders all loading / empty / error states.
 */
export default function DiscoverPage() {
  return <DiscoverScreen />;
}
