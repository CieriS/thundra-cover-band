import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Fade-up all'ingresso nel viewport tramite CSS scroll-driven animations
 * (utility `reveal` in globals.css): solo transform/opacity, nessun JS.
 */
export function Reveal({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("reveal", className)} {...props} />;
}
