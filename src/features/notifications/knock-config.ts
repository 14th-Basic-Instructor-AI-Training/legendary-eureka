/**
 * Knock in-app feed configuration, read from public env vars (inlined by Next at
 * build time). When either value is missing the notifications inbox falls back to
 * local fixtures via the Zustand store, so the app runs without a Knock account.
 *
 * - NEXT_PUBLIC_KNOCK_API_KEY        — public key (pk_…) for the Knock environment
 * - NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID — id (UUID) of the in-app feed channel
 */
export const KNOCK_PUBLIC_API_KEY = process.env.NEXT_PUBLIC_KNOCK_API_KEY ?? "";
export const KNOCK_FEED_CHANNEL_ID =
  process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID ?? "";

export const KNOCK_ENABLED = Boolean(
  KNOCK_PUBLIC_API_KEY && KNOCK_FEED_CHANNEL_ID,
);

/**
 * Enable when Knock "enhanced security" mode is on for the environment. The
 * client then authenticates with a backend-signed user token (fetched from
 * `/notifications/knock-token`) in addition to the public key.
 */
export const KNOCK_ENHANCED_SECURITY =
  process.env.NEXT_PUBLIC_KNOCK_ENHANCED_SECURITY === "true";
