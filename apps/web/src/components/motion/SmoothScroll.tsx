"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";

/**
 * Buttery smooth scrolling via Lenis.
 * - Enabled only on devices with a fine pointer + no reduced-motion preference,
 *   so phones/tablets keep native momentum scrolling.
 * - Pairs with scroll-linked reveals; safe on every breakpoint.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenisRef.current = lenis;

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onChange = () => {
      if (!fine.matches || reduced.matches) lenis.destroy();
    };
    fine.addEventListener("change", onChange);
    reduced.addEventListener("change", onChange);

    return () => {
      cancelAnimationFrame(raf);
      fine.removeEventListener("change", onChange);
      reduced.removeEventListener("change", onChange);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
