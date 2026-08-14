# Oasis Platform — Enterprise Setup Guide

## Quick Start (Development)

```bash
# 1. Clone repo
git clone https://github.com/tirthkparikh71199-rgb/oasis-platform.git
cd oasis-platform

# 2. Install dependencies
pnpm install

# 3. Start database
docker compose up -d db

# 4. Set up environment
cp .env.example .env
# Edit .env with your values (defaults work for dev)

# 5. Run migrations
pnpm --filter @oasis/db db:migrate

# 6. Seed data
pnpm --filter @oasis/db db:seed

# 7. Start dev server
pnpm dev
```

## Environment Variables

### Required for Production
| Variable | Description | Example |
|----------|-------------|---------|
| `SESSION_SECRET` | 32+ char random string | `openssl rand -hex 32` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@host:5432/db` |
| `GEMINI_API_KEY` | Google AI Studio key | `AIza...` |
| `SMTP_USER` | Email address | `you@gmail.com` |
| `SMTP_PASS` | App password | `xxxx-xxxx-xxxx-xxxx` |
| `WHATSAPP_ACCESS_TOKEN` | Meta Cloud API token | `EAA...` |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta phone number ID | `1234567890` |

### Optional
| Variable | Description | Default |
|----------|-------------|---------|
| `TEAM_WHATSAPP_NUMBERS` | Comma-separated team numbers | `""` |
| `GA_MEASUREMENT_ID` | Google Analytics 4 ID | `""` |
| `DAILY_REPORT_HOUR` | Daily report time (IST) | `08:00` |

## Deployment

### Staging (auto-deploy from dev branch)
```bash
git push origin dev
# GitHub Actions builds and deploys to staging VPS
```

### Production (auto-deploy from main branch)
```bash
git checkout main
git merge dev
git push origin main
# GitHub Actions builds and deploys to production VPS
```

### Manual Deploy
```bash
gh workflow run deploy-staging.yml
gh workflow run deploy.yml
```

## Admin Credentials

### Default (change after first login)
- **Email**: admin@oasisimpex.in
- **Password**: ChangeMe123!

### Reset Password
```sql
-- Connect to database
psql -U oasis -d oasis

-- Update password (generate hash first with bcrypt)
UPDATE users SET password_hash = '$2a$10$...' WHERE email = 'admin@oasisimpex.in';
```

## Testing

### Run All Tests
```bash
pnpm test:unit        # Unit tests
pnpm typecheck        # TypeScript check
pnpm lint            # ESLint check
```

### Test Specific Features
```bash
# Test chatbot
curl -X POST http://localhost:3000/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"1234567890","message":"Test inquiry"}'

# Test email processing
curl -X POST http://localhost:3000/api/email/process \
  -H "Content-Type: application/json" \
  -d '{"from":"test@example.com","subject":"Test","text":"Hello"}'

# Test health check
curl http://localhost:3000/api/health
```

## Troubleshooting

### Database Connection
```bash
# Check PostgreSQL is running
docker compose ps db

# Reset database
docker compose down -v
docker compose up -d db
pnpm --filter @oasis/db db:migrate
pnpm --filter @oasis/db db:seed
```

### WhatsApp Not Working
1. Verify webhook URL: `https://your-domain.com/api/whatsapp/webhook`
2. Check Meta Dashboard for webhook subscriptions
3. Ensure `WHATSAPP_ACCESS_TOKEN` is not expired

### Email Not Sending
1. Check SMTP credentials
2. For Gmail: enable 2FA and create app password
3. Check spam folder for alerts

### AI Not Responding
1. Verify `GEMINI_API_KEY` is valid
2. Check quota: https://makersuite.google.com/app/apikey
3. System falls back to mock automatically on quota exhaustion

## Monitoring

### Health Check
```bash
curl https://your-domain.com/api/health
# Returns: {"status":"healthy","checks":{"database":"ok"}}
```

### Logs
```bash
# View container logs
docker compose logs -f web
docker compose logs -f worker

# View specific service
docker compose logs -f web --tail 100
```

### Audit Trail
All admin actions are logged to `audit_logs` table. View in admin: `/admin/audit`

## Scaling

### Vertical (bigger server)
```bash
# Upgrade Hetzner server
hcloud server change-type oasis-impex cx32
```

### Horizontal (multiple instances)
```bash
# Add more web containers
docker compose up -d --scale web=3

# Add load balancer (Caddy/Nginx)
# Update docker-compose.yml with replicas
```

## Security Checklist

- [ ] Change default admin password
- [ ] Set strong `SESSION_SECRET`
- [ ] Enable HTTPS (Caddy auto-provisions)
- [ ] Restrict database access (no public exposure)
- [ ] Set up backups (automated daily)
- [ ] Monitor audit logs regularly
- [ ] Update dependencies monthly
