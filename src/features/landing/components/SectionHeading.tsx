import { Reveal } from "@/ui";
import { cn } from "@/lib/utils";

/** Shared section title + subtitle block for the landing page. */
export function SectionHeading({
  title,
  subtitle,
  align = "left",
  className,
}: {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "mb-8 flex max-w-2xl flex-col",
        align === "center" && "mx-auto items-center text-center",
        className,
      )}
    >
      <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle ? <p className="text-muted mt-3 text-base">{subtitle}</p> : null}
    </Reveal>
  );
}
