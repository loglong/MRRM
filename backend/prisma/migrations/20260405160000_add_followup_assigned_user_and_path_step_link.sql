-- Migration: Add followup assigned user and path step link
-- FOLLOW-01: Add assignedUserId to FollowupPlan
ALTER TABLE "followup_plans" ADD COLUMN "assigned_user_id" UUID;
ALTER TABLE "followup_plans" ADD CONSTRAINT "followup_plans_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "users"("id") ON DELETE SET NULL;
CREATE INDEX "followup_plans_assigned_user_id_idx" ON "followup_plans"("assigned_user_id");

-- FOLLOW-02: Add pathInstanceStepId to FollowupRecord
ALTER TABLE "followup_records" ADD COLUMN "path_instance_step_id" UUID;
ALTER TABLE "followup_records" ADD CONSTRAINT "followup_records_path_instance_step_id_fkey" FOREIGN KEY ("path_instance_step_id") REFERENCES "path_instance_steps"("id") ON DELETE SET NULL;
CREATE INDEX "followup_records_path_instance_step_id_idx" ON "followup_records"("path_instance_step_id");
