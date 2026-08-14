"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export function LeadTracker({ email, name, product }: { email?: string; name?: string; product?: string }) {
  useEffect(() => {
    if (email) {
      track("generate_lead", {
        lead_type: "visitor_identified",
        email,
        name: name ?? "",
        product_interest: product ?? "",
      });
    }
  }, [email, name, product]);

  return null;
}

export function ProductViewTracker({ productId, productName, category }: { productId: string; productName: string; category?: string }) {
  useEffect(() => {
    track("view_item", {
      item_id: productId,
      item_name: productName,
      item_category: category ?? "polymer",
    });
  }, [productId, productName, category]);

  return null;
}

export function ContactFormTracker() {
  useEffect(() => {
    track("begin_checkout", {
      currency: "INR",
      value: 0,
    });
  }, []);

  return null;
}

export function WhatsAppClickTracker() {
  useEffect(() => {
    track("select_content", {
      content_type: "whatsapp",
      content_id: "whatsapp_button",
    });
  }, []);

  return null;
}

export function PhoneCallTracker() {
  useEffect(() => {
    track("select_content", {
      content_type: "phone_call",
      content_id: "phone_button",
    });
  }, []);

  return null;
}
