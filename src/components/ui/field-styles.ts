import { cn } from "@/lib/utils";

/** Stile condiviso dei controlli di form (Input, Textarea). */
export const fieldControlClassName = cn(
  // text-base (16px) evita lo zoom automatico di iOS al focus.
  "w-full min-w-0 appearance-none rounded-none border border-border bg-background px-4 text-base text-foreground",
  "placeholder:text-muted-foreground/70 outline-none",
  "focus-visible:border-foreground focus-visible:ring-1 focus-visible:ring-foreground",
  "aria-invalid:border-danger aria-invalid:focus-visible:ring-danger",
  "disabled:cursor-not-allowed disabled:opacity-50",
);
