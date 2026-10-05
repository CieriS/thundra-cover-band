import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Accordion(props: ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

export function AccordionItem({
  className,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b border-border", className)}
      {...props}
    />
  );
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group flex min-h-14 flex-1 items-center justify-between gap-4 py-4 text-left outline-none",
          "font-display text-2xl uppercase leading-none sm:text-3xl",
          "hover:text-accent-ink focus-visible:text-accent-ink",
          className,
        )}
        {...props}
      >
        {children}
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center border border-border group-hover:border-foreground group-data-[state=open]:bg-foreground group-data-[state=open]:text-background"
        >
          <Plus className="size-4 transition-transform duration-500 group-data-[state=open]:rotate-45" />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

/** Apertura con opacity/transform: nessuna animazione dell'altezza (layout). */
export function AccordionContent({
  className,
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=open]:animate-fade-down"
      {...props}
    >
      <div className={cn("pb-8", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}
