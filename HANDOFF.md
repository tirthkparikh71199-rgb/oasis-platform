# OASIS IMPEX PLATFORM — AGENT HANDOVER
> Give this file to any AI agent (Copilot / Cursor / Codeium) to continue work.
> Updated: 2026-08-14 | Branch: dev | Status: DEV TESTED ✅ → PROD DEPLOY PENDING

---

## 0. WHERE THINGS LIVE

| Environment | Where | URL | Database |
|-------------|-------|-----|----------|
| **DEV** | Your Mac (local Docker) | http://localhost:3000 | `postgresql://oasis:oasis@localhost:5432/oasis` |
| **PROD** | VPS 160.187.87.93 (port 62247) | https://oasisimpex.duckdns.org | PostgreSQL on same VPS |
| **Git** | GitHub | https://github.com/tirthkparikh71199-rgb/oasis-platform | — |

**VPS specs:** Ubuntu 22.04, 1 vCPU, 2GB RAM, 25GB SSD
**DNS:** DuckDNS → `oasisimpex.duckdns.org` (token in owner-provided secrets, see §2)

---

## 1. QUICK START (any machine)

```bash
git clone https://github.com/tirthkparikh71199-rgb/oasis-platform.git
cd oasis-platform
git checkout dev
pnpm install

# Database (needs Docker Desktop running)
docker compose up -d db
pnpm --filter @oasis/db db:migrate
pnpm --filter @oasis/db db:seed

pnpm dev
# Site:  http://localhost:3000
# Admin: http://localhost:3000/admin  (admin@oasisimpex.in / ChangeMe123!)
```

---

## 2. SECRETS (never commit these)

All secrets live in `.env` (gitignored). **Get them from the project owner (Tirth).** The owner already has:
- Gemini API key (AI chatbot)
- Gmail app password (SMTP)
- Meta WhatsApp credentials (Phone Number ID, Access Token, App Secret, Verify Token)
- DuckDNS token
- GA4 Measurement IDs (dev + prod)
- VPS IP/port/root password

**If `.env` is missing values, ask the owner — never hardcode them into files.**

---

## 3. HOW DEV → PROD WORKS

```
You edit code locally
      ↓
git push origin dev
      ↓
GitHub Actions runs CI (typecheck, lint, unit tests, e2e)
      ↓
Green → create PR to main
      ↓
Merge to main
      ↓
Deploy workflow builds Docker image → SSH to VPS → docker compose up
      ↓
Live at https://oasisimpex.duckdns.org
```

### Manual deploy to VPS (one command)
```bash
sshpass -p "<VPS_PASSWORD>" ssh -p 62247 root@160.187.87.93 \
  "cd /opt/oasis-platform && git pull origin main && docker compose pull web && docker compose up -d --force-recreate web worker"
```

Or run `bash deploy.sh` on the VPS (it does clone → env check → compose up → migrate → seed → health check).

### First-time VPS setup
```bash
sshpass -p "<VPS_PASSWORD>" ssh -p 62247 root@160.187.87.93
curl -fsSL https://get.docker.com | sh
mkdir -p /opt/oasis-platform && cd /opt/oasis-platform
git clone https://github.com/tirthkparikh71199-rgb/oasis-platform.git .
# create .env with PROD values (ask owner for the prod env file)
docker compose up -d
docker compose exec web pnpm --filter @oasis/db db:migrate
docker compose exec web pnpm --filter @oasis/db db:seed
curl http://localhost:3000/api/health   # expect healthy
```

### Point DNS to VPS
```bash
curl "https://www.duckdns.org/update?domains=oasisimpex&token=<DUCKDNS_TOKEN>&ip=160.187.87.93"
```

---

## 4. ARCHITECTURE (what's what)

```
apps/web        Next.js 15 — public site + admin console + API routes
apps/worker     60s poller — handoff alerts, daily report, campaign sender, IMAP email inbox
packages/db     Drizzle ORM + PostgreSQL + pgvector (RAG embeddings)
packages/ai     Gemini provider + Mock fallback (auto-switch on rate limit)
packages/rag    RAG: chunk → embed → vector search → context for AI
packages/messaging  Email (nodemailer), WhatsApp (Meta Cloud API), campaign sender, unsubscribe
packages/config Zod-validated env
packages/domain Shared Zod form schemas
```

### Chat engine (the core) — `apps/web/src/lib/chat-engine.ts`
1. Incoming message + channel (WEB / WHATSAPP / EMAIL) + externalId
2. Find/create conversation
3. RAG retrieves Oasis knowledge (PUBLIC only)
4. Gemini replies using SYSTEM_PROMPT (`lib/agent-policy.ts` — refuses non-Oasis questions)
5. If user wants human → creates handoff (notified to admin email + team WhatsApp)
6. Reply saved + returned

### Channels
- **Web chat** — widget on site, `POST /api/chat`
- **WhatsApp** — Meta webhook `POST /api/whatsapp/webhook` (HMAC-verified), replies via Meta API
- **Email** — worker polls Gmail IMAP → `POST /api/email/process` → AI replies via SMTP
- **Admin replies** from `/admin/chats/[id]` go out on the customer's channel

---

## 5. WHAT'S ALREADY BUILT (don't rebuild)

**Public:** homepage (ship/truck/blob animations), products catalog, contact form, product request + status lookup, newsletter signup, chat widget, vendors/testimonials/customer logos sections.

**Admin:** dashboard, inquiries pipeline, unified chat inbox, email+WhatsApp campaigns (suppression, CAN-SPAM, unsubscribe), products CRUD + images, inventory + warehouses + low-stock, orders (no money), customers + 360° view + CSV import/export, vendors + logos, testimonials, custom roles (89 permissions), email controls (blocklist, disposable detection), audit log + CSV export, reminders, CMS content editor (all sections + image upload), navigation manager, form builder, page builder, usage & billing dashboard (auto-stop at cap, alerts at 80/95/100%).

**SEO:** full meta/OG/Twitter, JSON-LD (Organization, LocalBusiness, Product, Breadcrumb, FAQ, Reviews, WebSite, Service) in `apps/web/src/lib/seo.ts`, sitemap.xml, robots.txt.

**Analytics:** GA4 tag, view_item, generate_lead, chat_message events.

---

## 6. COST MODEL (everything free except VPS)

| Service | Cost |
|---------|------|
| VPS (HostPeppy) | owner paying |
| Gemini AI | ₹0 free tier (15 RPM) — auto-falls back to mock on quota |
| Gmail SMTP | ₹0 |
| WhatsApp **service** conversations | ₹0 — **UNLIMITED free in India** (Nov 2024+) |
| WhatsApp **marketing** conversations | 1,000 free/month, then ₹0.73 — worker auto-stops at cap + emails owner at 80/95/100% |
| GA4 | ₹0 |
| DuckDNS | ₹0 |

---

## 7. KNOWN BUGS FIXED (do not regress)

1. **Embedding dims** → pgvector HNSW max 2000. `EMBEDDING_DIM=1536` in env. DB column altered to `vector(1536)`.
2. **Float token counts** → all AI providers must `Math.ceil()` (aiUsage.inputTokens is integer).
3. **`.env.development`** → was overriding real creds with mocks; DELETED. Do not recreate.
4. **Gemini 503/timeouts** → always send `generationConfig.thinkingConfig.thinkingBudget: 0`.
5. **RAG retrieve** → wrapped in try/catch (returns [] on failure; chat still works).
6. **GitHub secret scanning** → never commit `.env` or paste keys into .md files (this file must stay clean).

---

## 8. REMAINING TASKS (do in order)

1. **Deploy prod** (§3) → verify `https://oasisimpex.duckdns.org/api/health`
2. **WhatsApp webhook** — Meta Dashboard → Configuration → callback `https://oasisimpex.duckdns.org/api/whatsapp/webhook`, verify token `oasis-whatsapp-verify-2024`, subscribe `messages`
3. **GA Data API dashboard** — owner creates Google Cloud service account + grants viewer on GA property → build `/admin/analytics/ga`
4. **SEO report** — after live: Search Console verify (`GOOGLE_SITE_VERIFICATION` env already supported), submit sitemap, Lighthouse audit
5. **WordPress-style page builder UI** — current builder saves JSON blocks to `dynamic_pages.content.blocks`; build a visual drag-drop block editor at `/admin/pages/[id]` rendering via `app/[slug]/page.tsx`

---

## 9. TEST COMMANDS

```bash
pnpm typecheck && pnpm lint && pnpm test:unit

curl localhost:3000/api/health
curl -X POST localhost:3000/api/chat -H 'Content-Type: application/json' \
  -d '{"content":"What PVC grades do you sell?"}'
curl -X POST localhost:3000/api/inquiries -H 'Content-Type: application/json' \
  -d '{"name":"Test","phone":"9876543210","message":"Need K67"}'
```

### Error → fix table
| Error | Fix |
|-------|-----|
| `invalid input syntax for type integer: "17.75"` | Math.ceil() missing in an AI provider |
| `more than 2000 dimensions for hnsw` | EMBEDDING_DIM > 2000 — set 1536 |
| Gemini 503 | thinkingBudget missing |
| Email shows `[email:log]` | EMAIL_TRANSPORT not smtp, or stray env override |
| Chat 500 | DB down — `docker compose up -d db` |
| Empty AI answers | Retrain agent from /admin/content (retrain button) |

---

## 10. FILES MAP (when agent needs to find things)

```
Chat:        apps/web/src/lib/chat-engine.ts + agent-policy.ts
RAG:         packages/rag/src/index.ts
AI:          packages/ai/src/gemini.ts + mock.ts + fallback.ts
Campaigns:   packages/messaging/src/campaigns.ts
Email/WA:    packages/messaging/src/email.ts + whatsapp.ts
Unsubscribe: packages/messaging/src/unsubscribe.ts + apps/web/src/app/unsubscribe/
Worker:      apps/worker/src/index.ts + email-channel.ts
SEO:         apps/web/src/lib/seo.ts
CMS:         apps/web/src/app/admin/content/ + lib/site-content.ts
Schema:      packages/db/src/schema.ts + seed.ts
Env:         packages/config/src/env.ts
Deploy:      docker-compose.yml, Caddyfile, deploy.sh, scripts/setup.sh, .github/workflows/
Docs:        ARCHITECTURE.md, DEVELOPMENT.md, SETUP.md, GOLIVE.md, HANDOFF.md
```

---

**START HERE: §1 quick start → §7 known bugs → §8 remaining tasks (deploy prod first).**
