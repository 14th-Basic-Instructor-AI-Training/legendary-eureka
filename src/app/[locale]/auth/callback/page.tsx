import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { homePathFor } from "@/lib/permissions";

/**
 * Post-sign-in redirect page. Auth.js redirects here after a successful
 * credentials sign-in; this server component reads the session role and
 * immediately redirects to the correct home for that role.
 */
export default async function AuthCallbackPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session) {
    redirect(`/${locale}/login`);
  }

  redirect(`/${locale}${homePathFor(session.role)}`);
}
