# Oasis Platform — Production Go-Live Checklist

## Step 1: Get Credentials (10 minutes)

### Required (must have)
- [ ] **Hetzner API Token** — https://console.hetzner.cloud/api/tokens
- [ ] **SSH Key** — `ssh-keygen -t ed25519 -f ~/.ssh/oasis-deploy`
- [ ] **Gemini API Key** — https://makersuite.google.com/app/apikey (free)
- [ ] **Gmail App Password** — https://myaccount.google.com/apppasswords (enable 2FA first)

### Optional (can add later)
- [ ] WhatsApp Business credentials
- [ ] Google Analytics 4 ID
- [ ] Product images
- [ ] Company logo

## Step 2: Set GitHub Secrets (5 minutes)

Go to: https://github.com/tirthkparikh71199-rgb/oasis-platform/settings/secrets/actions

Add:
```
HETZNER_API_TOKEN = your_token
VPS_SSH_KEY = private_key_content
VPS_SSH_PUBKEY = public_key_content
DEPLOY_ENV = full_env_content
DUCKDNS_TOKEN = your_token (optional)
```

## Step 3: Deploy (1 minute)

```bash
# Push to main triggers deploy
git checkout main
git merge dev
git push origin main
```

Or manual:
```bash
gh workflow run deploy.yml
```

## Step 4: Post-Deploy (10 minutes)

1. **Login** — https://oasisimpex.in/admin
2. **Change password** — Settings → Profile
3. **Add products** — Products → Add Product (with images)
4. **Add vendors** — Vendors → Add Vendor (with logos)
5. **Add testimonials** — Testimonials → Add Testimonial
6. **Configure WhatsApp** — Settings → WhatsApp (if you have Meta credentials)

## Step 5: Verify (5 minutes)

- [ ] Website loads
- [ ] Admin login works
- [ ] Chat widget responds
- [ ] Contact form submits
- [ ] Product pages load
- [ ] Images display

## Total Time: ~30 minutes to go live

## What Works Immediately (No Config Needed)
- ✅ Public website
- ✅ Admin dashboard
- ✅ AI chatbot (mock mode)
- ✅ Contact forms
- ✅ Product catalog
- ✅ Basic analytics

## What Needs Config Later
- ⏳ Real AI responses (needs Gemini key)
- ⏳ Email sending (needs SMTP)
- ⏳ WhatsApp integration (needs Meta)
- ⏳ Product images (needs upload)
- ⏳ Advanced analytics (needs GA4)
