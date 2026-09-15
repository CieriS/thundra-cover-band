import { cn } from "@/lib/utils";

/** Stile condiviso dei controlli di form (Input, Textarea). */
export const fieldControlClassName = cn(
  "w-full border border-border bg-background px-4 text-base text-foreground",
  "placeholder:text-muted-foreground/60 transition-[border-color,box-shadow] duration-200 outline-none",
  "hover:border-foreground/40 focus-visible:border-foreground focus-visible:ring-1 focus-visible:ring-foreground",
  "aria-invalid:border-danger aria-invalid:focus-visible:ring-danger",
  "disabled:cursor-not-allowed disabled:opacity-50",
);
