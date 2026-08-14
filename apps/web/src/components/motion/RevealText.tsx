"use client";

import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";

interface RevealTextProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  delay?: number;
  accentWords?: string[];
}

/**
 * Award-winning "line-mask" headline reveal:
 * each word is clipped behind a mask and rises into place as it scrolls into view.
 * Reduced-motion + small screens get a plain render (no masking), so content
 * is always fully visible and fast.
 */
export function RevealText({ text, as = "h1", className, delay = 0, accentWords = [] }: RevealTextProps) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  const Tag = as;

  if (reduce) {
    return (
      <Tag className={className}>
        {words.map((w, i) =>
          accentWords.includes(w) ? (
            <span key={i} className="gradient-text">
              {w}{" "}
            </span>
          ) : (
            <span key={i}>
              {w}{" "}
            </span>
          ),
        )}
      </Tag>
    );
  }

  return (
    <Tag className={className}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-top pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className={accentWords.includes(w) ? "gradient-text inline-block will-change-transform" : "inline-block will-change-transform"}
            initial={{ y: "110%", rotate: 2 }}
            whileInView={{ y: 0, rotate: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.75, delay: delay + i * 0.055, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </Tag>
  );
}

export function RevealTextInner({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.span>
  );
}
