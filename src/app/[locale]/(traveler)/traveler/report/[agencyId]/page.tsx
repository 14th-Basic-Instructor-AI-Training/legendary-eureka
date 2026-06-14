import { ReportAgencyScreen } from "@/features/report/components/ReportAgencyScreen";

/**
 * Report an agency (`/[locale]/traveler/report/[agencyId]`). Traveler-only — the
 * `(traveler)` shell guards the role (only travelers have `reportAgency`). Thin:
 * resolves the agency id and composes the feature screen.
 */
export default async function ReportAgencyPage({
  params,
}: {
  params: Promise<{ locale: string; agencyId: string }>;
}) {
  const { agencyId } = await params;
  return <ReportAgencyScreen agencyId={agencyId} />;
}
