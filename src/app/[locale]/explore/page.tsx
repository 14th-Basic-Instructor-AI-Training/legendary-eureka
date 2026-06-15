import { ExploreScreen } from "@/features/explore/components/ExploreScreen";

/**
 * Explore index (`/[locale]/explore`). Public, browse-first for everyone (guests
 * included), so it lives outside the role route groups. Thin: composes the
 * feature screen, which loads catalog data through the data seam and renders all
 * loading / empty / error states.
 */
export default function ExplorePage() {
  return <ExploreScreen />;
}
