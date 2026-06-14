"use client";

import type { ReactNode } from "react";
import { Card } from "@/ui";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="w-full max-w-xl">
      <div className="mb-8 text-center">
        <h1 className="text-primary text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="text-muted mt-1 text-sm">{subtitle}</p> : null}
      </div>

      <Card variant="default" className="bg-surface rounded-2xl p-8 shadow-primary">
        {children}
      </Card>

      {footer ? <div className="mt-6 text-center text-sm">{footer}</div> : null}
    </div>
  );
}
