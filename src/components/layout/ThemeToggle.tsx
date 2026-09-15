import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

/**
 * Le icone sono gestite via CSS (`dark:`) così il markup è identico
 * tra server e client: nessun mismatch di idratazione.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Cambia tema chiaro/scuro"
      title="Cambia tema"
    >
      <Sun className="absolute scale-0 rotate-90 transition-transform duration-500 dark:scale-100 dark:rotate-0" />
      <Moon className="scale-100 rotate-0 transition-transform duration-500 dark:scale-0 dark:-rotate-90" />
    </Button>
  );
}
