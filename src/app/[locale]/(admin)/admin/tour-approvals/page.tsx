import { redirect } from "next/navigation";

// Package approvals now live inside the admin Requests page.
export default async function AdminTourApprovalsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/admin/requests?tab=tourApprovals`);
}
