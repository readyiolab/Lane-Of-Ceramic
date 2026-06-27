# Production Security Checklist

## Authentication
- [ ] Change `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` to strong random values (32+ chars)
- [ ] Set `COOKIE_SECURE=true` in production
- [ ] Set `NODE_ENV=production`
- [ ] Admin accounts use `ADMIN` or `SUPER_ADMIN` role only

## Network
- [ ] Configure `CORS_ORIGIN` to exact storefront and admin URLs (no wildcards)
- [ ] HTTPS termination at reverse proxy (nginx/Caddy)
- [ ] Rate limiting enabled (default 100 req/min global, 5/min auth)

## Database
- [ ] MySQL user with least privilege (not root in production)
- [ ] Regular backups via `scripts/db-backup.ts` (when implemented)
- [ ] Run migration: `prisma/migrations/001_admin_platform.sql`

## Payments & Webhooks
- [ ] Configure real Cashfree credentials
- [ ] Webhook signature verification enabled (`CASHFREE_SECRET_KEY`)
- [ ] Shiprocket webhook verification in production

## Secrets
- [ ] Never commit `.env` files
- [ ] Rotate Cloudinary, SMTP, SMS API keys periodically

## Admin Panel
- [ ] Served on separate origin or path with auth required
- [ ] Audit logs reviewed via `GET /api/v1/audit`

## Storefront
- [ ] `VITE_API_BASE_URL` points to production API
- [ ] Static product fallback disabled once catalog is fully seeded
