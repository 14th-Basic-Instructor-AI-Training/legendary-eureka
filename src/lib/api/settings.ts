// Wire types for platform settings.

/**
 * Public, unauthenticated subset of platform settings (`GET /settings/public`).
 * Reachable even while the platform is in maintenance mode, so the UI can gate
 * access accordingly.
 */
export interface PublicSettings {
  maintenanceMode: boolean;
  registrationOpen: boolean;
  bookingEnabled: boolean;
}
