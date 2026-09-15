import type { ComponentProps } from "react";

import { fieldControlClassName } from "@/components/ui/field-styles";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(fieldControlClassName, "min-h-36 resize-y py-3 leading-relaxed", className)}
      {...props}
    />
  );
}
