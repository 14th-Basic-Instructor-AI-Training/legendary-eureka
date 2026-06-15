"use client";

import { ProfileHeader } from "./ProfileHeader";
import { ProfileTabs } from "./ProfileTabs";

/**
 * Top-level Traveler Profile screen. Rendered inside the traveler `AppShell`
 * (which already guards the route to the traveler role), so it composes the
 * identity header + the section tabs without re-checking auth here.
 */
export function TravelerProfileScreen() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <ProfileHeader />
      <ProfileTabs />
    </div>
  );
}
