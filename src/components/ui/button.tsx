import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center gap-2.5 whitespace-nowrap select-none",
    "font-sans text-[0.8125rem] font-semibold uppercase leading-none tracking-[0.12em]",
    // Feedback al tocco solo con transform: resta sul compositor a 60fps.
    "transition-transform duration-150 ease-out active:scale-[0.97]",
    "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        primary: "bg-foreground text-background hover:bg-foreground/85",
        accent: "bg-accent text-accent-foreground hover:bg-accent-strong",
        outline: "border border-foreground/40 bg-background/40 text-foreground hover:border-foreground",
        ghost: "text-foreground hover:bg-surface",
      },
      size: {
        // Almeno 48×48 px sui dispositivi touch; più compatto solo su desktop.
        sm: "min-h-12 px-5 lg:min-h-10 lg:px-4",
        md: "min-h-12 px-6",
        lg: "min-h-14 px-7 text-sm",
        icon: "size-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps extends ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
