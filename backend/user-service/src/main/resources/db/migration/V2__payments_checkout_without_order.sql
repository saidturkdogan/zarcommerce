-- payment-service (Iyzico) inserts checkout rows before an order exists.
-- V1 required order-scoped legacy columns; relax so Iyzico columns can be used alone.

ALTER TABLE payments ALTER COLUMN order_id DROP NOT NULL;
ALTER TABLE payments ALTER COLUMN provider DROP NOT NULL;
ALTER TABLE payments ALTER COLUMN method DROP NOT NULL;

-- Legacy rows used CHECK (pending|authorized|paid|...); Iyzico uses INITIALIZED|SUCCESS|FAILURE|CANCELLED.
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;

-- Hibernate may not populate legacy amount when using price/paid_price.
ALTER TABLE payments ALTER COLUMN amount DROP NOT NULL;
