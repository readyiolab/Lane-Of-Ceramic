# API Documentation

Base URL: `http://localhost:3000/api/v1`

## Core Endpoints
- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `GET /products`
- `GET /products/:slug`
- `GET /cart`
- `POST /cart/items`
- `PATCH /cart/items/:itemId`
- `DELETE /cart/items/:itemId`
- `POST /checkout/summary`
- `POST /checkout/place-order`
- `POST /payments/cashfree/session`
- `POST /payments/webhook/cashfree`
- `POST /shipments/shiprocket/create`
- `POST /shipments/webhook/shiprocket`
- `GET /wishlist`
- `POST /wishlist/items`
- `DELETE /wishlist/items/:productId`
- `GET /admin/dashboard`

Swagger UI path: `/docs`
