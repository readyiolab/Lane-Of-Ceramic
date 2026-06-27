# Shiprocket Integration Notes
- Authenticate and cache provider token.
- Create order shipment and AWB in `/shipments/shiprocket/create`.
- Persist AWB/tracking URL/status in `ec_shipments`.
- Process provider webhooks idempotently and update order/shipment status.
- Queue periodic tracking sync for in-transit orders.
