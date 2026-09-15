import type { ComponentProps } from "react";

import { fieldControlClassName } from "@/components/ui/field-styles";
import { cn } from "@/lib/utils";

export function Input({ className, type = "text", ...props }: ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(fieldControlClassName, "h-12", className)}
      {...props}
    />
  );
}
