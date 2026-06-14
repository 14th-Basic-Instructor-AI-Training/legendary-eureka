import { LandingScreen } from "@/features/landing/components/LandingScreen";

/**
 * Root route: the public landing page. It is home for everyone — guests and
 * signed-in travelers/agencies — so there is no redirect here. Login sends
 * admins to /admin; the header offers each role a link to its own area.
 */
export default function HomePage() {
  return <LandingScreen />;
}
