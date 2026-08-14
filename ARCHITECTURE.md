# Oasis Impex Platform — Architecture Guide

> For: agent handoff / continuity  
> Last updated: 2025-08-14  
> Current state: dev branch, ALL features built, awaiting commit + PR #2

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      PUBLIC SITE (Next.js)                       │
│  Products • Contact Form • Product Request • Newsletter Signup   │
│  Product Request Status Lookup • Terms • Privacy                 │
└──────────────┬──────────────────────────┬───────────────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────┐    ┌──────────────────────────────────┐
│   AI AGENT (RAG)     │    │   INQUIRY API (POST)             │
│   Gemini + Pinecone  │    │   → saves inquiry                │
│   + Knowledge Base   │    │   → emails sales@                │
│   + Chat Engine      │    │   → notifyTeam (email+WA)        │
└──────┬───────┬───────┘    └──────────────────────────────────┘
       │       │
       ▼       ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ WhatsApp │ │  Web     │ │  Email   │
│ (Meta)   │ │  Chat    │ │ (IMAP)   │
│ webhook  │ │  Widget  │ │ listener │
└────┬─────┘ └────┬─────┘ └────┬─────┘
     │            │            │
     ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN CONSOLE (Next.js)                       │
│  Dashboard • Inquiries • Chats • Campaigns • Products           │
│  Analytics • Roles • Subscribers • Email Controls • Audit Log    │
│  Human can reply on ANY channel from admin console              │
│  All channels share same AI brain                               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │   Worker    │
                    │ (60s poll)  │
                    │ • Handoff   │
                    │ • Daily rpt │
                    │ • Campaigns │
                    │ • Email IMAP│
                    └─────────────┘
```

---

## 2. Package Map

| Package | Purpose | Key Files |
|---------|---------|-----------|
| `apps/web` | Next.js app (public site + admin) | `app/`, `components/`, `lib/` |
| `apps/worker` | Background job runner (polls every 60s) | `src/index.ts`, `src/email-channel.ts` |
| `packages/db` | Drizzle schema + migrations + seed | `src/schema.ts`, `src/seed.ts`, `drizzle/` |
| `packages/config` | Zod env validation | `src/env.ts` |
| `packages/messaging` | Email + WhatsApp + Campaigns + Unsubscribe + Validation | `src/email.ts`, `src/whatsapp.ts`, `src/campaigns.ts`, `src/unsubscribe.ts`, `src/email-validation.ts` |
| `packages/domain` | Shared Zod schemas (forms) | `src/forms.ts` |
| `packages/rag` | RAG engine + training | `src/rag.ts`, `src/train.ts` |
| `packages/logger` | Pino logger | `src/index.ts` |

---

## 3. Chat Engine Architecture (THE CORE)

The chat engine (`apps/web/src/lib/chat-engine.ts`) is the CORE of the platform. It handles ALL customer-facing conversations across ALL channels.

### How it works:
1. Receives message + channel (WEB/WHATSAPP/EMAIL) + externalId
2. Finds or creates conversation (by channel + externalId)
3. Loads conversation history
4. Runs RAG retrieval (Pinecone) for relevant knowledge
5. Generates AI reply via Gemini (with SYSTEM_PROMPT + knowledge context)
6. If AI can't answer → creates handoff for human
7. Saves reply to messages table
8. Returns { reply, conversationId, handoffCreated }

### Channels:
- **WEB**: `externalId = web:<visitorId>` (anonymous)
- **WHATSAPP**: `externalId = wa:<phone>` (phone number)
- **EMAIL**: `externalId = email:<address>` (email address)

### Admin Reply:
- `apps/web/src/app/admin/chats/actions.ts` → `sendAgentMessage`
- Saves AGENT message to DB
- If channel is WHATSAPP → forwards via WhatsApp provider
- If channel is EMAIL → forwards via email provider
- If channel is WEB → shows in chat widget (no external send)

### Smart Personality (agent-policy.ts):
- Sales-oriented, enthusiastic, warm
- Creates urgency ("strong stock", "high demand")
- Always guides toward call/WhatsApp
- Out-of-scope guardrails (refuses non-Oasis questions)
- Call-to-action at end of responses

---

## 4. Database Schema (Key Tables)

### Identity
- `users` — admin users (email, passwordHash, name, roles via userRoles)
- `roles` — RBAC roles (SUPER_ADMIN, ADMIN, SALES, etc. + custom)
- `permissions` — 89 permission codes across 12 groups
- `rolePermissions` — role↔permission mapping

### Customers & Leads
- `customers` — saved customer records (name, company, email, phone, whatsapp, status)
- `inquiries` — website form submissions (pipeline: NEW→CONTACTED→QUALIFIED→IN_PROGRESS→CONVERTED/CLOSED)
- `productRequests` — customer requests for products we don't list (status: NEW→QUOTING→ORDERED→AVAILABLE→DECLINED)

### Conversations
- `conversations` — chat sessions (channel, status, externalId, customerId)
- `messages` — individual messages (senderType, direction, content, metadata)
- `handoffs` — human intervention requests (status, priority, assignedTo)

### Campaigns & Subscribers
- `campaigns` — email/WhatsApp campaigns (channel: EMAIL|WHATSAPP, audience, status, scheduledAt)
- `campaignRecipients` — per-campaign send queue (email or phone, status: PENDING|SENT|FAILED)
- `subscribers` — newsletter/announcement list (email, phone, unsubscribed flag)
- `emailBlocks` — blocklist (kind: EMAIL|DOMAIN, value, reason)

### Products & Orders
- `products` — catalog (name, slug, category, pricing tiers, BIS certs)
- `orders` — sales orders (customerId, productId, quantity, status — NO amount/money in UI)
- `inventory` — warehouse stock (hidden from UI)

### Admin
- `reminders` — follow-up tasks (title, dueAt, done, entity/entityId link)
- `auditLogs` — activity trail (actor, action, entity, entityId, metadata)
- `settings` — key-value config store
- `seoPages` — CMS page metadata

---

## 5. Permissions (12 Groups, 89 Codes)

| Group | Key Permissions |
|-------|----------------|
| catalog | products.read/write/manage, categories.* |
| customers | partners.read/write/manage |
| orders | orders.read/write/manage |
| leads | leads.read/write/manage |
| chat | chat.read/reply |
| inventory | inventory.read/write/manage |
| knowledge | knowledge.read/write/manage |
| settings | settings.read/write/manage |
| analytics | analytics.read |
| roles | roles.manage |
| requests | requests.read/write |
| campaigns | campaigns.read/write |

SUPER_ADMIN bypasses all permission checks via `hasPermission()`.

---

## 6. Notification System

### notifyTeam(event, lines, extra?)
- Sends email to ADMIN_ALERT_EMAIL (configurable)
- Sends WhatsApp to TEAM_WHATSAPP_NUMBERS (if configured)
- Used for: new leads, product requests, handoffs

### Campaign Sender (worker)
- Polls every 60s for SCHEDULED campaigns
- Builds recipient list from customers/leads/subscribers
- Applies suppression (unsubscribed + email blocks)
- Sends via email or WhatsApp provider
- CAN-SPAM footer + List-Unsubscribe headers on emails
- 250ms throttle between sends

### Unsubscribe System
- HMAC-signed links (SESSION_SECRET, 32-char hex token)
- `/unsubscribe` page with confirm + resubscribe
- `/api/unsubscribe` POST route (redirects after action)
- Suppression list: subscribers.unsubscribed + email_blocks
- WhatsApp STOP/START handling in webhook

---

## 7. Environment Variables

```bash
# Core
APP_URL=http://localhost:3000
SESSION_SECRET=dev-secret-change-me-please
DATABASE_URL=postgresql://oasis:oasis@localhost:5432/oasis

# AI
AI_PROVIDER=gemini|mock
GEMINI_API_KEY=
AI_MODEL=gemini-2.0-flash

# Email
EMAIL_TRANSPORT=smtp|log
SMTP_HOST= SMTP_PORT=465 SMTP_USER= SMTP_PASS=
EMAIL_FROM= EMAIL_REPLY_TO=
ADMIN_ALERT_EMAIL=tirthkparikh71199@gmail.com
DAILY_REPORT_HOUR=08:00

# WhatsApp
WHATSAPP_PROVIDER=sandbox|meta
WHATSAPP_PHONE_NUMBER_ID= WHATSAPP_ACCESS_TOKEN=
WHATSAPP_VERIFY_TOKEN= WHATSAPP_APP_SECRET=
TEAM_WHATSAPP_NUMBERS=+91XXXXXXXXXX

# Email Inbox (IMAP — for email channel)
EMAIL_INBOX_HOST= EMAIL_INBOX_PORT=993
EMAIL_INBOX_USER= EMAIL_INBOX_PASS=

# Analytics
GA_MEASUREMENT_ID=

# Deploy
HETZNER_API_TOKEN= VPS_SSH_KEY= VPS_SSH_PUBKEY=
DUCKDNS_TOKEN= DUCKDNS_SUBDOMAIN=
```

---

## 8. What's Built (ALL Features)

### ✅ Committed (on dev: 6a48a1f)
- Agent training (knowledge corpus + retrain button)
- Out-of-scope guardrails (SYSTEM_PROMPT + agent-policy.ts + tests)

### ✅ Built This Session (uncommitted, ready to commit)
See DEVELOPMENT.md "In Progress / Uncommitted" section for full file list.

### ✅ Complete Feature List
1. Public B2B site (home, products, contact, about, terms, privacy)
2. AI agent with RAG (Gemini + Pinecone + knowledge base)
3. **Smart chatbot personality** (sales-oriented, urgency, CTAs)
4. Web chat widget (floating, real-time)
5. **WhatsApp integration** (Meta API, HMAC verify, webhook)
6. **Email channel** (IMAP listener + API endpoint)
7. Admin chat console (reply on ANY channel)
8. Human handoff system
9. Inquiry pipeline with status tracking
10. Product requests tracker
11. Customer management (CRUD + 360° view)
12. Custom roles & permission matrix
13. **Email campaigns** (EMAIL | WHATSAPP channel)
14. Campaign sender with suppression + CAN-SPAM
15. Newsletter subscriber capture
16. **Email validation** (disposable domain detection)
17. **Email blocklist management** (admin controls)
18. **Unsubscribe system** (HMAC-signed)
19. **WhatsApp STOP/START handling**
20. **Team WhatsApp alerts** (notifyTeam + TEAM_WHATSAPP_NUMBERS)
21. **Product request status lookup** (public, by email)
22. GA4 tracking + analytics dashboard
23. **GA view_item tracking** (product pages)
24. Audit log (last 14 days, CSV export)
25. CSV import/export (customers, inquiries)
26. Follow-up reminders with due dates
27. Daily report (orders, inquiries, handoffs, reminders)
28. Orders (no money fields in UI)

---

## 9. What's Still Missing (Minor Items)

### Must Do Before Deploy
- [ ] Newsletter footer form component (route exists at /api/subscribe)
- [ ] Wire GA view_item tracker into product detail page
- [ ] Migration 0004 for email_blocks table
- [ ] Commit all files to dev + push + PR #2

### Nice to Have (Post-MVP)
- [ ] Multi-language support (Hindi, Gujarati)
- [ ] Rate limiting on public forms (IP-based)
- [ ] Campaign analytics (open/click tracking — needs pixel/webhook)
- [ ] Customer portal (login, view orders, chat)
- [ ] Product comparison tool

---

## 10. Deployment

### GitHub Actions Workflow
1. PR triggers: e2e tests, integration tests, lint+typecheck+unit+build
2. Merge to main: builds Docker image, pushes to registry
3. Deploy workflow: SSH to Hetzner VPS, pull image, restart containers

### Docker Compose
- `web` — Next.js app (port 3000)
- `worker` — Background job runner
- `db` — PostgreSQL (with volume)
- `redis` — Optional (for rate limiting, queues)

### VPS Setup
- Hetzner CX22 (2 vCPU, 4GB RAM)
- Docker + Docker Compose
- Nginx reverse proxy (SSL via Let's Encrypt)
- DuckDNS for dynamic DNS

---

## 11. How to Resume Work

### If session ends:
1. Read this ARCHITECTURE.md + DEVELOPMENT.md
2. `git status` — check what's uncommitted
3. `git log --oneline -5` — see recent commits
4. `pnpm typecheck` — verify no broken code
5. Continue from "What's Still Missing" section

### To commit current work:
```bash
git checkout dev  # feature files carry over
git add -A
git commit -m "feat: complete lead platform — campaigns, analytics, roles, controls"
git push origin dev
gh pr create --base main --title "PR #2: Lead platform features"
```

### To deploy:
```bash
gh secret set HETZNER_API_TOKEN --body "xxx"
gh secret set VPS_SSH_KEY --body "xxx"
gh secret set VPS_SSH_PUBKEY --body "xxx"
gh secret set DEPLOY_ENV --body "production"
gh secret set DUCKDNS_TOKEN --body "xxx"
# Push to main triggers deploy
```

---

## 12. Key Design Decisions

1. **No money/orders in UI** — Orders table kept but amount fields hidden. Agent doesn't discuss pricing.
2. **No inventory** — Warehouses/Stock removed from nav. Knowledge base internal only.
3. **Call-first business** — Phone required on inquiry form, WhatsApp optional.
4. **Suppression list** — subscribers.unsubscribed acts as global block; email_blocks for explicit blocks.
5. **Signed unsubscribe** — HMAC token prevents unsubscribing others; POST-only for enterprise compliance.
6. **Chatbot as core** — Works on WhatsApp + admin + email. Same AI brain, different channels.
7. **Free tier focus** — Sandbox WhatsApp, log email, mock AI in dev. Real integrations need prod creds.
8. **Enterprise email** — CAN-SPAM footer, List-Unsubscribe headers, disposable domain detection, blocklist.
9. **WhatsApp-first alerts** — Team gets notifications on WhatsApp (not just email).
10. **No floating button** — WhatsApp IS the channel; customers message the number directly.
