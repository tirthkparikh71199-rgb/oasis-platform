#!/bin/bash
# =============================================================
# Oasis Platform — Deploy Script
# Run on VPS: bash deploy.sh
# =============================================================

set -euo pipefail

echo "🚀 Oasis Platform — Production Deploy"
echo "======================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root: sudo bash deploy.sh${NC}"
  exit 1
fi

# Install Docker if not present
if ! command -v docker &> /dev/null; then
  echo -e "${YELLOW}Installing Docker...${NC}"
  curl -fsSL https://get.docker.com | sh
fi

# Install Docker Compose plugin if not present
if ! docker compose version &> /dev/null; then
  echo -e "${YELLOW}Installing Docker Compose...${NC}"
  apt-get update && apt-get install -y docker-compose-plugin
fi

# Create directory
mkdir -p /opt/oasis-platform
cd /opt/oasis-platform

# Clone or pull
if [ -d ".git" ]; then
  echo -e "${YELLOW}Pulling latest...${NC}"
  git pull origin main
else
  echo -e "${YELLOW}Cloning repo...${NC}"
  git clone https://github.com/tirthkparikh71199-rgb/oasis-platform.git .
fi

# Check .env
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}Creating .env from template...${NC}"
  cp .env.production .env
  echo -e "${RED}⚠️  Edit .env with your credentials before starting!${NC}"
  echo "   nano /opt/oasis-platform/.env"
  echo ""
  echo "Required:"
  echo "  - SESSION_SECRET (run: openssl rand -hex 32)"
  echo "  - DATABASE_URL"
  echo "  - GEMINI_API_KEY"
  echo "  - SMTP_USER + SMTP_PASS"
  echo ""
  exit 1
fi

# Start services
echo -e "${YELLOW}Starting services...${NC}"
docker compose pull web 2>/dev/null || true
docker compose up -d --force-recreate web worker db caddy

# Wait for DB
echo -e "${YELLOW}Waiting for database...${NC}"
sleep 10

# Run migrations
echo -e "${YELLOW}Running migrations...${NC}"
docker compose exec -T web pnpm --filter @oasis/db db:migrate || true

# Seed data
echo -e "${YELLOW}Seeding data...${NC}"
docker compose exec -T web pnpm --filter @oasis/db db:seed || true

# Health check
echo -e "${YELLOW}Running health check...${NC}"
for i in {1..30}; do
  CODE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/health 2>/dev/null || echo "000")
  if [ "$CODE" = "200" ]; then
    echo -e "${GREEN}✅ Service is healthy!${NC}"
    break
  fi
  sleep 2
done

# Cleanup
docker system prune -f --filter 'until=48h' 2>/dev/null || true

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "Access:"
echo "  - Website: https://oasisimpex.in"
echo "  - Admin: https://oasisimpex.in/admin"
echo "  - Login: admin@oasisimpex.in"
echo ""
echo "Next steps:"
echo "  1. Change admin password"
echo "  2. Add products via admin"
echo "  3. Add vendor logos"
echo "  4. Add testimonials"
echo "  5. Configure WhatsApp webhook"
echo ""
