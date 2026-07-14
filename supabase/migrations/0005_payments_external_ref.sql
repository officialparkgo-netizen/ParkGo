-- =============================================================================
-- ParkGo — store the payment provider's reference (e.g. Stripe payment intent)
-- so cancellations can issue real refunds. Idempotent.
-- =============================================================================

alter table payments add column if not exists external_ref text;
