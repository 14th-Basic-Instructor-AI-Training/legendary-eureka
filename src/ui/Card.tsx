import type { ComponentProps } from "react";
import { Card as HeroCard } from "@heroui/react";
import { cn } from "@/lib/utils";

/**
 * Jalat Card — wrapper over HeroUI v3's compound Card. Preserves the compound
 * API (`Card.Header`, `Card.Title`, `Card.Description`, `Card.Content`,
 * `Card.Footer`) while routing the root through a single styling seam.
 */
type CardRootProps = ComponentProps<typeof HeroCard>;

function CardRoot({ className, ...props }: CardRootProps) {
  return <HeroCard className={cn(className)} {...props} />;
}

export const Card = Object.assign(CardRoot, {
  Header: HeroCard.Header,
  Title: HeroCard.Title,
  Description: HeroCard.Description,
  Content: HeroCard.Content,
  Footer: HeroCard.Footer,
});
