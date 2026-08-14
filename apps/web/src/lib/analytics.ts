"use client";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function track(event: string, params: Record<string, string | number | boolean> = {}): void {
  try {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    window.gtag("event", event, params);
  } catch {
    // analytics must never break the app
  }
}
