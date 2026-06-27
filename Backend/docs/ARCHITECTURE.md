# Enterprise Backend Architecture

## Frontend Analysis Summary
- Homepage: static curated sections (hero, categories, bundles, featured, testimonials) -> needs CMS/admin-configurable widgets.
- Category pages: client-side filter/sort with tags, price range, availability, sale flag -> requires server-side filter engine with indexed query params.
- Product listing: static arrays -> needs paginated `/products` with sort, filter, and caching.
- Product detail: static product + gallery + related -> needs `/products/:slug` with relations and recommendations.
- Search flow: header has UI input only, no behavior -> requires full-text search endpoint and typeahead.
- Wishlist: absent in frontend state -> needs authenticated wishlist APIs and merge for guest->user.
- Cart flow: in-memory React context only -> requires guest token cart + persistent user cart + inventory reservation.
- Checkout flow: client-only simulated steps -> requires transactional checkout service, tax/shipping/coupon orchestration.
- Delivery address flow: rich form + type (Home/Work/Other) -> addressed by `ec_addresses` and profile APIs.
- Payment flow: mock payment method screen -> requires Cashfree order session, webhook, verification, idempotency.
- Header/footer: navigation static; search/cart count local -> requires category config endpoint and cart summary endpoint.
- Mobile responsiveness: frontend already responsive; backend must support lightweight paginated responses.
- Dynamic UI requirements: banner, featured products, inventory badges, ratings must be dynamic.
- State requirements: auth/session, cart, wishlist, addresses, orders, notifications.
- API requirements: versioned REST, typed validation, consistent envelope, pagination metadata.
- Future admin requirements: product/catalog/inventory/orders/coupons/reviews/analytics management.

## Architecture
- Runtime: Node.js + Express + TypeScript
- Data: MySQL + Prisma ORM
- Cache: Redis (catalog/search/cart fragments)
- Queue: BullMQ (notifications, webhook retry, inventory alerts)
- Auth: JWT access + refresh rotation, device/session extensible
- Integrations: Cashfree + Shiprocket via dedicated modules
- Style: Clean Architecture + module-first + repository/service/controller split

## API Baseline
- Prefix: `/api/v1`
- Format: `{ success, message?, data?, meta?, errors? }`
- Security middleware: helmet, cors, rate limiting, hpp, auth guard
- Validation: zod-based middleware
- Docs: Swagger at `/docs`

## Module Map
- Implemented router-ready modules: auth, products, cart, checkout, payments, shipments, wishlist, admin.
- Created folder placeholders for remaining modules: users, addresses, categories, brands, inventory, orders, coupons, reviews, notifications, analytics.

## ER Diagram (Text)
- User 1..* Address
- User 1..* Cart
- Cart 1..* CartItem
- Category 1..* Product
- Brand 1..* Product
- Product 1..* ProductImage
- Product 1..* ProductVariant
- User 1..* Order
- Order 1..* OrderItem
- Order 1..* Payment
- Order 1..* Shipment
- Product 1..* Review
- User 1..* Review
- User 1..* Wishlist
- Product 1..* Wishlist

## Scalability Notes
- All business flows should be wrapped in services and DB transactions.
- Use read-through Redis for category and product list pages.
- Queue outbound side effects (email/sms/whatsapp/push).
- Keep provider webhooks idempotent via `ec_webhook_logs` + payment idempotency key.
- Partition analytics workloads to async jobs and reporting tables in future.
