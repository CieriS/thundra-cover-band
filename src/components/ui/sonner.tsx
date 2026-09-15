import { useTheme } from "next-themes";
import type { CSSProperties } from "react";
import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

const toasterStyle = {
  "--normal-bg": "var(--surface)",
  "--normal-text": "var(--foreground)",
  "--normal-border": "var(--border)",
  "--border-radius": "0px",
} as CSSProperties;

export function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme();
  const theme: ToasterProps["theme"] =
    resolvedTheme === "light" || resolvedTheme === "dark" ? resolvedTheme : "system";

  return (
    <SonnerToaster
      theme={theme}
      position="bottom-center"
      style={toasterStyle}
      toastOptions={{ className: "font-sans" }}
      {...props}
    />
  );
}
