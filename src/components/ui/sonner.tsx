import type { CSSProperties } from "react";
import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

const toasterStyle = {
  "--normal-bg": "var(--surface)",
  "--normal-text": "var(--foreground)",
  "--normal-border": "var(--border)",
  "--border-radius": "0px",
} as CSSProperties;

/** Su mobile i toast restano sopra la bottom navigation (vedi `--toast-offset-bottom`). */
const TOAST_OFFSET = { bottom: "var(--toast-offset-bottom)" };

export function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      theme="dark"
      position="bottom-center"
      offset={TOAST_OFFSET}
      mobileOffset={TOAST_OFFSET}
      style={toasterStyle}
      toastOptions={{ className: "font-sans" }}
      {...props}
    />
  );
}
