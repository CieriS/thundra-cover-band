import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-2 whitespace-nowrap border font-mono uppercase leading-none tracking-[0.12em]",
  {
    variants: {
      variant: {
        outline: "border-border px-2.5 py-1.5 text-[11px] text-foreground",
        accent: "border-accent bg-accent px-2.5 py-1.5 text-[11px] text-accent-foreground",
        warning: "border-accent-ink/60 px-2.5 py-1.5 text-[11px] text-accent-ink",
        inverse: "border-foreground bg-foreground px-2.5 py-1.5 text-[11px] text-background",
        muted: "border-border bg-surface px-2.5 py-1.5 text-[11px] text-muted-foreground",
        tag: "border-border px-1.5 py-1 text-[10px] text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  },
);

export interface BadgeProps extends ComponentProps<"span">, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}
