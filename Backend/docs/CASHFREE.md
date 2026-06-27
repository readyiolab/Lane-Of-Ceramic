# Cashfree Integration Notes
- Create payment session in `/payments/cashfree/session`.
- Store `provider_order_id`, idempotency key, and full payload in `ec_payments`.
- Verify webhook signature and persist raw webhook in `ec_webhook_logs`.
- Apply order status transition only once (idempotent).
- Use refund API endpoint to create and track refunds.
