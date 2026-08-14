"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface ChatMessage {
  role: "user" | "bot" | "agent";
  content: string;
}

const QUICK_PROMPTS = ["What products do you supply?", "Do you have PVC Resin K67?", "Get a quotation", "Talk to a sales agent"];

const STORAGE_KEY = "oasis_chat_conv";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", content: "Namaste! I'm the Oasis Impex assistant. Ask me about PVC Resin, PVC Regrind, PET Resin and Calcium Carbonate — or connect with our sales team." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [waitingForAgent, setWaitingForAgent] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    return window.localStorage.getItem(STORAGE_KEY) ?? undefined;
  });
  const convRef = useRef(conversationId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    convRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing, open]);

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (!waitingForAgent || !convRef.current) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      try {
        const res = await fetch(`/api/chat/history?conversationId=${encodeURIComponent(convRef.current!)}`);
        const data = await res.json();
        if (!res.ok || !Array.isArray(data.messages)) return;
        const agentMsgs = data.messages.filter(
          (m: { senderType: string; content: string }) => m.senderType === "AGENT" && m.content.trim(),
        );
        if (agentMsgs.length > 0) {
          const seen = new Set(messagesRef.current.filter((m) => m.role !== "user").map((m) => m.content));
          const fresh = agentMsgs.filter((m: { content: string }) => !seen.has(m.content));
          if (fresh.length > 0) {
            setMessages((prev) => [
              ...prev,
              ...fresh.map((m: { content: string }) => ({ role: "agent" as const, content: m.content })),
            ]);
            setWaitingForAgent(false);
          }
        }
      } catch {
        // transient — keep polling
      }
      if (!stopped) timer = setTimeout(tick, 5000);
    };
    void tick();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [waitingForAgent]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || typing) return;
    setMessages((m) => [...m, { role: "user", content }]);
    setInput("");
    setTyping(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, conversationId: convRef.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "chat failed");
      setConversationId(data.conversationId);
      window.localStorage.setItem(STORAGE_KEY, data.conversationId);
      setMessages((m) => [...m, { role: "bot", content: data.reply }]);
      if (data.handoffCreated) {
        setWaitingForAgent(true);
      }
    } catch {
      setMessages((m) => [...m, { role: "bot", content: "I couldn't reach the assistant right now. Please try again, or call us directly — our team is available Mon–Sat." }]);
    } finally {
      setTyping(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Open chat assistant"
        onClick={() => setOpen((v) => !v)}
        className="tap-none fixed bottom-5 right-5 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-3 to-brand-ink text-white shadow-lift transition-transform hover:scale-105 active:scale-95 sm:bottom-6 sm:right-6"
      >
        <span className="pulse-ring" />
        <svg viewBox="0 0 24 24" className="relative h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {open ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <>
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </>
          )}
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-4 left-4 z-[90] flex h-[70vh] max-h-[560px] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-lift sm:bottom-28 sm:right-6 sm:left-auto sm:w-[380px]"
            role="dialog"
            aria-label="Oasis Impex assistant"
          >
            <div className="flex items-center gap-3 bg-ink px-4 py-3.5 text-white">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-3 to-brand-ink">
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" opacity="0.7" />
                </svg>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-ink bg-emerald-400" />
              </span>
              <div className="flex-1">
                <div className="font-display text-sm font-bold">Oasis Assistant</div>
                <div className="text-[11px] text-white/55">RAG-powered · answers in seconds</div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-mist/60 px-4 py-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                  {m.role === "agent" ? (
                    <span className="mb-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Sales team</span>
                  ) : null}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                      m.role === "user"
                        ? "rounded-br-md bg-brand text-white"
                        : m.role === "agent"
                          ? "rounded-bl-md border border-emerald-200 bg-emerald-50 text-ink"
                          : "rounded-bl-md border border-line bg-white text-ink"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-line bg-white px-4 py-3">
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        className="h-1.5 w-1.5 rounded-full bg-brand/50"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.7, repeat: Infinity, delay: d * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {waitingForAgent && !typing && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-amber-800">
                    <motion.span
                      className="h-1.5 w-1.5 rounded-full bg-amber-500"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                    />
                    One of our sales agents is picking this up — they'll reply here shortly.
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 border-t border-line bg-white px-3 pt-2.5">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => void send(q)}
                  className="tap-none rounded-full border border-line bg-mist px-2.5 py-1 text-[11px] font-medium text-ink/70 transition hover:border-brand/40 hover:text-brand"
                >
                  {q}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="flex items-center gap-2 bg-white px-3 py-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about products, availability…"
                aria-label="Message"
                className="min-w-0 flex-1 rounded-xl border border-line bg-mist px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-3 focus:ring-2 focus:ring-brand-3/20"
              />
              <button
                type="submit"
                disabled={typing || !input.trim()}
                aria-label="Send message"
                className="tap-none flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white transition hover:bg-brand-2 disabled:opacity-40"
              >
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
