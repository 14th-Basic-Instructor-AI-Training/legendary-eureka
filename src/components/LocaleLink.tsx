"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { localePath, useLocale } from "@/lib/locale";

type LocaleLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/**
 * Next.js Link that prefixes the active locale onto the href. Use for all
 * in-app navigation so links stay within the current `/[locale]`.
 */
export function LocaleLink({ href, ...props }: LocaleLinkProps) {
  const locale = useLocale();
  return <Link href={localePath(locale, href)} {...props} />;
}
