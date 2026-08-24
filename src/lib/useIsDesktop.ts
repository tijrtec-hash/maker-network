"use client";

import { useEffect, useState } from "react";

/**
 * Retorna true quando a viewport está no breakpoint desktop (>= 768px).
 * Usado para escolher tamanhos de página e outros ajustes específicos
 * de layout que não podem ser resolvidos só com CSS.
 */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isDesktop;
}
