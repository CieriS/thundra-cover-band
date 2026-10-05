import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
      <Toaster />
    </MotionConfig>
  );
}
