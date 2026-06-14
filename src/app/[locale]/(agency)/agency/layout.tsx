import { AppShell } from "@/components/layout/AppShell";

export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="agency">{children}</AppShell>;
}
