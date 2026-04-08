-- Add AI call tracking fields to AuditLog
ALTER TABLE "audit_logs" ADD COLUMN "api_key_id" TEXT;
ALTER TABLE "audit_logs" ADD COLUMN "is_ai_call" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "audit_logs_api_key_id_idx" ON "audit_logs"("api_key_id");