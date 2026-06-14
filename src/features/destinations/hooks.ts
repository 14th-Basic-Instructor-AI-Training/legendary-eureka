"use client";

/**
 * The destinations data-loading hook now lives in the shared lib layer (it is
 * reused by other features). Re-exported here for backward-compatible imports.
 */
export {
  useResource,
  type ResourceState,
  type ResourceStatus,
} from "@/lib/useResource";
