# Deployment Guide

## Local
1. Copy `.env.example` -> `.env`
2. `npm install`
3. `npx prisma generate`
4. `npx prisma migrate dev`
5. `npm run dev`

## Production
- Run via Docker Compose or build + PM2 + Nginx reverse proxy.
- Set strong JWT secrets and provider keys.
- Enable HTTPS and secure cookies.
