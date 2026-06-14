import { Reveal } from "@/ui";
import { ArrowRight } from "iconsax-reactjs";
import { LocaleLink } from "@/components/LocaleLink";
import { cn } from "@/lib/utils";

/**
 * Shared section title + subtitle block for the landing page. Pass `actionHref`
 * (+ `actionLabel`) to render a "View all →" link on the right of the heading —
 * e.g. a row that links through to the Explore page. `onAction` fires on click
 * (before navigation), used to seed the Explore store with the right tab/filter.
 */
export function SectionHeading({
  title,
  subtitle,
  align = "left",
  className,
  actionLabel,
  actionHref,
  onAction,
}: {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  const heading = (
    <div
      className={cn(
        "flex max-w-2xl flex-col",
        align === "center" && "mx-auto items-center text-center",
      )}
    >
      <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle ? <p className="text-muted mt-3 text-base">{subtitle}</p> : null}
    </div>
  );

  return (
    <Reveal
      className={cn(
        "mb-8 flex gap-4",
        actionHref ? "items-end justify-between" : "flex-col",
        className,
      )}
    >
      {heading}
      {actionHref ? (
        <LocaleLink
          href={actionHref}
          onClick={onAction}
          className="text-primary group inline-flex shrink-0 items-center gap-1 pb-1 text-sm font-semibold whitespace-nowrap hover:underline"
        >
          {actionLabel}
          <ArrowRight
            size={16}
            color="currentColor"
            className="transition-transform group-hover:translate-x-0.5"
          />
        </LocaleLink>
      ) : null}
    </Reveal>
  );
}
