import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared surface for every dashboard card — matches the admin queue cards
 * (`bg-surface`, `border-border`, rounded-2xl) so the overview sits seamlessly
 * above the existing tabs. Header (title/subtitle/action) is optional.
 */
export function Panel({
  title,
  subtitle,
  action,
  className,
  children,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("bg-surface border-border rounded-2xl border p-5", className)}>
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h3 className="text-primary font-semibold tracking-tight">{title}</h3>}
            {subtitle && <p className="text-muted mt-0.5 text-sm">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
