import type { ComponentProps } from "react";

import { fieldControlClassName } from "@/components/ui/field-styles";
import { cn } from "@/lib/utils";

export function Input({ className, type = "text", ...props }: ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(fieldControlClassName, "h-14 [&::-webkit-date-and-time-value]:text-left", className)}
      {...props}
    />
  );
}
