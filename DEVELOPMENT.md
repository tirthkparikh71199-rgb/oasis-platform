# Oasis Platform — Development Tracker

> Last updated: 2025-08-14  
> Current commit: main=`7523bcb`, dev=`6a48a1f` (guardrails) + uncommitted feature build  
> Branch: working on main, will commit feature build to dev  
> PR #1 merged (training). PR #2 pending (feature build).

---

## Architecture Summary

- **Stack**: Next.js 15 + Drizzle + PostgreSQL + tRPC-optional + Tailwind (dark admin)
- **Packages**: `apps/web` (admin+site), `apps/worker` (background), `packages/db`, `packages/config`, `packages/messaging`, `packages/domain`, `packages/rag`, `packages/logger`
- **Deploy**: Hetzner VPS via GitHub Actions → Docker (SSH deploy). **BLOCKED** on `HETZNER_API_TOKEN`, `VPS_SSH_KEY`, `VPS_SSH_PUBKEY`, `DEPLOY_ENV`, `DUCKDNS_TOKEN`
- **Integrations** (dev): mock AI, log email, sandbox WhatsApp. Prod needs: `GEMINI_API_KEY`, real SMTP creds, Meta WhatsApp creds

---

## Git State

| Branch | HEAD | Notes |
|--------|------|-------|
| main | `7523bcb` (PR #1 merge) | Working tree has ALL uncommitted feature files |
| dev | `6a48a1f` (guardrails) | Needs feature build committed on top |

**Next**: `git checkout dev` → commit all → push → open PR #2

---

## Completed Features

### Infrastructure & Auth
- [x] Full admin dashboard with sidebar nav (dark theme)
- [x] Login / session (cookie-based)
- [x] Role-based access control (SUPER_ADMIN, ADMIN, SALES, ANALYST, etc.)
- [x] 89 seeded permissions across 12 groups
- [x] Seed user: admin@oasisimpex.in / ChangeMe123!

### AI Agent & Chat
- [x] RAG engine with Gemini + Pinecone + embeddings
- [x] Web chat widget (floating, real-time)
- [x] WhatsApp integration (Meta API, HMAC verification)
- [x] Shared chat engine (web + WhatsApp use same brain)
- [x] Human handoff system (auto + manual)
- [x] Admin live chat console (reply on WhatsApp from admin)
- [x] Agent training: Oasis-only knowledge base + manual retrain button
- [x] Self-train on first conversation (`ensureAgentTrained`)
- [x] **Out-of-scope guardrails** (commit `6a48a1f` on dev): agent refuses non-Oasis questions

### Public Site
- [x] Full B2B public site (home, about, products, contact, terms, privacy)
- [x] Product catalog with search, categories, BIS/certifications, PDFs
- [x] Trade routes, manufacturing capability, packaging sections
- [x] Contact form → inquiry (phone required, email optional)
- [x] **Product request form** (GA-tracked, new products tracked)

### Admin — Leads & Sales
- [x] Inquiry pipeline (NEW→CONTACTED→QUALIFIED→IN_PROGRESS→CONVERTED/CLOSED)
- [x] Product requests tracker (NEW→QUOTING→ORDERED→AVAILABLE→DECLINED)
- [x] Orders CRUD (no amount/money fields in UI — stripped)
- [x] Customer management (CRUD, status: LEAD/ACTIVE/INACTIVE)
- [x] **Inquiry card**: "Set reminder" link + "360° view" link
- [x] **360° customer view**: email-match across inquiries/chats/orders/requests/reminders

### Admin — Campaigns & Communications
- [x] Email campaigns (create/schedule/send/draft)
- [x] **WhatsApp campaigns** (channel picker: EMAIL | WHATSAPP)
- [x] Campaign recipients: customers, leads, subscribers
- [x] Campaign sender (worker polls, sends via email/WhatsApp provider)
- [x] Newsletter subscriber capture (subscribers table)
- [x] **Unsubscribe**: HMAC-signed links + suppression list + CAN-SPAM footer
- [x] **Email controls**: blocklist (email/domain blocks table)
- [x] **Email validation**: disposable domain detection + MX check
- [x] List-Unsubscribe headers on campaign emails
- [x] WhatsApp STOP/START opt-out handling

### Admin — Analytics & Monitoring
- [x] GA4 tag in root layout (configurable)
- [x] Admin analytics dashboard (KPI cards, channel bars, pipeline)
- [x] GA view_item tracking on product pages
- [x] Lead events (GA generate_lead on inquiry/product request/chat)

### Admin — Content & Settings
- [x] CMS pages editor (SEO, structured data)
- [x] Product management (CRUD + variants)
- [x] Media library
- [x] Daily report (orders, inquiries, customers, handoffs, reminders)

### Admin — Team & Security
- [x] Custom roles (create/edit/delete, permission matrix)
- [x] Team member management (assign roles)
- [x] Audit log (last 14 days, filters, CSV export)
- [x] CSV import/export for customers + inquiries

### Admin — Tasks
- [x] Follow-ups & reminders (create/mark done/delete)
- [x] Linked to inquiries via entity/entityId
- [x] Due items appear in daily brief

### Notifications & Alerts
- [x] Instant email alerts for new leads (inquiries API + WhatsApp webhook)
- [x] notifyTeam helper (email + **WhatsApp forwarding**)
- [x] Team WhatsApp alerts (env TEAM_WHATSAPP_NUMBERS)
- [x] WhatsApp deep-link buttons on inquiries/customer profile

### Deployment
- [x] GitHub Actions CI (e2e, integration, lint+typecheck+unit+build)
- [x] Docker build + push
- [x] Deploy workflow (auto-skips without secrets)
- [x] Hetzner VPS deploy script ready

---

## Schema (packages/db/drizzle)

| Migration | Tables Added |
|-----------|-------------|
| 0000 | products, categories, customers, conversations, messages, handoffs, knowledge, inventory, warehouses |
| 0001 | orders, analyst role |
| 0002 | product_requests, campaigns, campaign_recipients, reminders (roles.name→text for custom roles) |
| 0003 | subscribers, email_blocks, campaigns.channel (EMAIL|WHATSAPP) |

---

## In Progress / Uncommitted on main

All these files are written but NOT committed yet:

**New files:**
- `apps/web/src/app/admin/analytics/page.tsx`
- `apps/web/src/app/admin/audit/page.tsx`
- `apps/web/src/app/admin/campaigns/` (actions, pages, [id])
- `apps/web/src/app/admin/reminders/` (actions, page)
- `apps/web/src/app/admin/roles/` (actions, pages, [id])
- `apps/web/src/app/admin/products/requests/` (actions, page)
- `apps/web/src/app/admin/customers/customer-profile.tsx`
- `apps/web/src/app/api/audit/export/route.ts`
- `apps/web/src/app/api/customers/export/route.ts`
- `apps/web/src/app/api/inquiries/export/route.ts`
- `apps/web/src/app/products/actions.ts`, `product-request-form.tsx`
- `apps/web/src/lib/analytics.ts`, `audit.ts`, `notify.ts`
- `packages/messaging/src/campaigns.ts`

**Modified files:**
- `apps/web/src/app/admin/layout.tsx` (nav rebuilt)
- `apps/web/src/app/admin/inquiries/inquiry-card.tsx` (+remind, +360°)
- `apps/web/src/app/admin/customers/page.tsx` (+CSV export/import, +360°)
- `apps/web/src/app/admin/customers/actions.ts` (+import, +audit)
- `apps/web/src/app/admin/orders/` (amount fields stripped)
- `apps/web/src/app/admin/roles/` (new system)
- `apps/web/src/app/admin/users/page.tsx` (+dynamic roles)
- `apps/web/src/app/api/inquiries/route.ts` (+notifyTeam)
- `apps/web/src/app/api/whatsapp/webhook/route.ts` (+new lead alert)
- `apps/web/src/app/layout.tsx` (+GA4)
- `apps/web/src/app/products/page.tsx` (+product request)
- `apps/web/src/components/chat/ChatWidget.tsx` (+GA track)
- `apps/web/src/app/admin/products/requests/` (tracker)
- `apps/worker/src/index.ts` (+campaigns, +daily report updates)
- `packages/db/src/schema.ts` (new tables)
- `packages/db/src/seed.ts` (new permissions)
- `packages/messaging/src/index.ts` (+campaigns export)
- `packages/messaging/package.json` (+@oasis/db, +drizzle-orm)

---

## Pending Work

### HIGH Priority (enterprise essentials)

#### Unsubscribe System
- [ ] `packages/messaging/src/unsubscribe.ts` — HMAC sign/verify (SESSION_SECRET)
- [ ] `apps/web/src/app/unsubscribe/page.tsx` — confirm + resubscribe
- [ ] `apps/web/src/lib/unsubscribe.ts` — web helper for link generation
- [ ] Append unsubscribe footer to campaign emails (CAN-SPAM: physical address + link)
- [ ] List-Unsubscribe headers on SMTP sends
- [ ] `email.ts` — add `headers` field to EmailMessage

#### Email Controls (fake email management)
- [ ] `apps/web/src/lib/email-validation.ts` — syntax + disposable domain list + MX check
- [ ] `apps/web/src/app/admin/email-controls/page.tsx` — subscribers list, blocks list, stats
- [ ] Subscribe route (`/api/subscribe` or server action) with validation
- [ ] Newsletter signup form on public site footer
- [ ] `buildRecipients` exclude blocked + unsubscribed
- [ ] Flag disposable emails in inquiry metadata (don't reject leads)
- [ ] Block disposable + blocked emails from subscribing

#### WhatsApp Opt-Out
- [ ] Webhook STOP/START handling (upsert subscriber unsubscribed)
- [ ] Append "Reply STOP to opt out" on WhatsApp campaign sends
- [ ] Audit logging on unsubscribe

#### Team WhatsApp Alerts
- [ ] Add `TEAM_WHATSAPP_NUMBERS` to env config
- [ ] `notifyTeam` sends WhatsApp to team numbers (in addition to email)
- [ ] WhatsApp deep-link buttons on inquiry cards + customer profile

#### Public Features
- [ ] Floating WhatsApp button on all public pages
- [ ] Product request status lookup page (by email + request ID)
- [ ] GA view_item on product pages (use `track` helper in product detail)

### MEDIUM Priority

#### Campaign Admin UI Updates
- [ ] Channel picker (EMAIL | WHATSAPP) in new campaign form
- [ ] "SUBSCRIBERS" in audience segment dropdown
- [ ] Show channel in campaign list + detail
- [ ] Recipients list shows phone for WhatsApp campaigns

#### Scaling Groundwork
- [ ] Conversation assignment (handoffs.assignedTo exists — just ensure UI)
- [ ] Multi-agent chat support (conversationParticipants table exists)
- [ ] Campaign throttling (250ms delay between sends)
- [ ] Rate limiting on public forms (IP-based)

### LOW Priority

#### Admin Enhancements
- [ ] Dashboard stats widget (lead velocity, campaigns sent)
- [ ] Campaign analytics (sent/open/click tracking — needs pixel/webhook)
- [ ] Customer segmentation dashboard
- [ ] Bulk operations (assign multiple inquiries)

#### Public Site
- [ ] Customer portal (login, view orders, chat)
- [ ] Product comparison tool
- [ ] Multi-language support

---

## Environment Variables Needed

```bash
# Already in env.ts (with defaults)
APP_URL=http://localhost:3000
SESSION_SECRET=dev-secret-change-me-please
DATABASE_URL=postgresql://oasis:oasis@localhost:5432/oasis
ADMIN_ALERT_EMAIL=tirthkparikh71199@gmail.com
GA_MEASUREMENT_ID=
GEMINI_API_KEY=

# NEW (needed for production)
TEAM_WHATSAPP_NUMBERS=+919825141637,+91XXXXXXXXXX
WHATSAPP_PROVIDER=meta
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_APP_SECRET=
SMTP_HOST=
SMTP_PORT=465
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=Oasis Impex <no-reply@oasisimpex.in>
```

---

## Key Decisions

1. **No money/orders in UI** — Orders table kept but amount/price fields hidden from UI. Agent doesn't discuss pricing.
2. **No inventory** — Warehouses/Stock removed from nav. Knowledge base internal only.
3. **Call-first business** — Phone required on inquiry form, WhatsApp optional, wa.me deep links.
4. **Suppression list** — `subscribers.unsubscribed` acts as global block; `email_blocks` for explicit blocks; both excluded from sends.
5. **Signed unsubscribe** — HMAC token prevents unsubscribing others; POST-only for enterprise compliance.

---

## How to Resume

1. `git checkout dev` (feature files carry over)
2. `git add -A && git commit -m "feat: complete lead platform — campaigns, analytics, roles, controls"`
3. `git push origin dev`
4. `gh pr create --base main --title "PR #2: Lead platform features"`
5. `gh pr checks 2` (wait for green)
6. `gh pr merge 2 --squash` (after all green + review)
7. Set secrets: `gh secret set HETZNER_API_TOKEN --body "xxx"` etc.
8. Push to main triggers deploy

**If session ends**: The `Development Tracker` section above has everything. All uncommitted files are in the working tree on main.
