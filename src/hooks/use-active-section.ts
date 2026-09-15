import { useEffect, useState } from "react";

/**
 * Restituisce l'id della sezione che attraversa la fascia centrale del viewport.
 * `ids` deve essere un riferimento stabile (es. costante di modulo).
 */
export function useActiveSection<T extends string>(ids: readonly T[]): T | null {
  const [activeId, setActiveId] = useState<T | null>(null);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id as T);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [ids]);

  return activeId;
}
