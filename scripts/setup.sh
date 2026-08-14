#!/bin/bash
# =============================================================
# Oasis Platform — Production Setup Script
# Run this on the VPS after first deploy
# =============================================================

set -euo pipefail

echo "🚀 Oasis Platform — Production Setup"
echo "======================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if .env exists
if [ ! -f .env ]; then
  echo -e "${RED}Error: .env file not found${NC}"
  echo "Copy .env.example to .env and fill in your credentials"
  exit 1
fi

# Source .env
source .env

echo -e "${YELLOW}Checking credentials...${NC}"

# Required checks
check_var() {
  local var=$1
  local name=$2
  if [ -z "${!var}" ] || [ "${!var}" = "CHANGE_ME" ] || [[ "${!var}" == *"change"* ]]; then
    echo -e "${RED}❌ $name not set${NC}"
    return 1
  else
    echo -e "${GREEN}✅ $name${NC}"
    return 0
  fi
}

echo ""
echo "=== Required Credentials ==="
check_var "SESSION_SECRET" "Session Secret"
check_var "DATABASE_URL" "Database URL"
check_var "GEMINI_API_KEY" "Gemini API Key"
check_var "SMTP_USER" "SMTP User"
check_var "SMTP_PASS" "SMTP Password"

echo ""
echo "=== Optional but Recommended ==="
check_var "WHATSAPP_ACCESS_TOKEN" "WhatsApp Token" || true
check_var "GA_MEASUREMENT_ID" "GA4 Measurement ID" || true
check_var "TEAM_WHATSAPP_NUMBERS" "Team WhatsApp" || true

echo ""
echo "=== Database Setup ==="
echo "Running migrations..."
docker compose exec -T web pnpm --filter @oasis/db db:migrate 2>/dev/null || echo "Migrations may need manual run"

echo ""
echo "=== Seed Data ==="
echo "Seeding initial data..."
docker compose exec -T web pnpm --filter @oasis/db db:seed 2>/dev/null || echo "Seed may need manual run"

echo ""
echo "=== Health Check ==="
echo "Checking if service is running..."
for i in {1..30}; do
  CODE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/health 2>/dev/null || echo "000")
  if [ "$CODE" = "200" ]; then
    echo -e "${GREEN}✅ Service is healthy${NC}"
    break
  fi
  sleep 2
done

echo ""
echo "=== Setup Complete ==="
echo -e "${GREEN}🎉 Oasis Platform is running!${NC}"
echo ""
echo "Access:"
echo "  - Website: ${APP_URL:-http://localhost:3000}"
echo "  - Admin: ${APP_URL:-http://localhost:3000}/admin"
echo "  - Login: admin@oasisimpex.in / ChangeMe123!"
echo ""
echo "Next steps:"
echo "  1. Change admin password"
echo "  2. Add products via admin"
echo "  3. Add vendor logos"
echo "  4. Add testimonials"
echo "  5. Configure WhatsApp webhook"
echo ""
