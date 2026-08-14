"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export function ProductViewTracker({ product }: { product: { id: string; name: string; slug: string; category?: string | null } }) {
  useEffect(() => {
    track("view_item", {
      item_id: product.id,
      item_name: product.name,
      item_category: product.category ?? "polymer",
    });
  }, [product.id, product.name, product.category]);

  return null;
}
