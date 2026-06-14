import { redirect } from "next/navigation";

// Destinations management now lives as a tab in the admin content page.
export default async function AdminDestinationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/admin/content?tab=destinations`);
}
