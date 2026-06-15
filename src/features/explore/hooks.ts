"use client";

/**
 * Re-export the shared loader so Explore components import it from the feature,
 * matching the convention in the other features.
 */
export {
  useResource,
  type ResourceState,
  type ResourceStatus,
} from "@/lib/useResource";
