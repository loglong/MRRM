-- Add soft-delete fields to Touchpoint (TOUCH-05)
ALTER TABLE "touchpoints" ADD COLUMN "voided_at" TIMESTAMP;
ALTER TABLE "touchpoints" ADD COLUMN "voided_reason" TEXT;

-- Create index for voided queries
CREATE INDEX IF NOT EXISTS "touchpoints_voided_at_idx" ON "touchpoints"("voided_at");
