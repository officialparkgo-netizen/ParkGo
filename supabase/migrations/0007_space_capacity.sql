-- =============================================================================
-- ParkGo — per-listing capacity (how many cars fit). Search hides a space on
-- dates where paid/active bookings >= capacity. Idempotent.
-- =============================================================================

alter table spaces add column if not exists capacity int not null default 1;
