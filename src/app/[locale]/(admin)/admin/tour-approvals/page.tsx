import { redirect } from "next/navigation";

// Package approvals now live as a tab in the admin content page.
export default async function AdminTourApprovalsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/admin/content?tab=approvals`);
}
