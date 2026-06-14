import { AppShell } from "@/components/layout/AppShell";

export default function TravelerLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="traveler">{children}</AppShell>;
}
