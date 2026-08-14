import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.string().trim().email("Please enter a valid email").optional().or(z.literal("")),
  phone: z.string().trim().min(7, "Please enter a valid phone number").max(20),
  whatsapp: z.string().trim().max(20).optional().or(z.literal("")),
  productId: z.string().uuid().optional().or(z.literal("")),
  quantityRequested: z.string().trim().max(60).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Please tell us a little more").max(4000),
});
export type ContactFormInput = z.infer<typeof contactFormSchema>;

export const chatMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  content: z.string().trim().min(1, "Message cannot be empty").max(2000),
});
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

export const handoffSchema = z.object({
  conversationId: z.string().uuid(),
  reason: z.string().trim().min(1).max(500),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  contact: z.object({
    name: z.string().trim().min(1).max(120),
    phone: z.string().trim().min(7).max(20),
    email: z.string().trim().email().optional().or(z.literal("")),
    company: z.string().trim().max(120).optional().or(z.literal("")),
  }),
});
export type HandoffInput = z.infer<typeof handoffSchema>;
