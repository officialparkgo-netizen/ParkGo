-- =============================================================================
-- ParkGo — add 'refunded' to payout_status so cancelled bookings' payments are
-- excluded from host earnings / payouts due. Idempotent.
-- =============================================================================

alter type payout_status add value if not exists 'refunded';
