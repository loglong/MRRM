-- Add ICD diagnosis codes and surgery name to Path model
ALTER TABLE "paths" ADD COLUMN "icd10_code" VARCHAR(20);
ALTER TABLE "paths" ADD COLUMN "icd9_code" VARCHAR(20);
ALTER TABLE "paths" ADD COLUMN "diagnosis_name" VARCHAR(200);
ALTER TABLE "paths" ADD COLUMN "surgery_name" VARCHAR(200);

-- Add treatment phases fields to Demand model
ALTER TABLE "demands" ADD COLUMN "created_by" VARCHAR(255);
ALTER TABLE "demands" ADD COLUMN "development_manager" VARCHAR(255);
ALTER TABLE "demands" ADD COLUMN "pre_treatment_start_date" TIMESTAMP;
ALTER TABLE "demands" ADD COLUMN "pre_treatment_manager" VARCHAR(255);
ALTER TABLE "demands" ADD COLUMN "treatment_start_date" TIMESTAMP;
ALTER TABLE "demands" ADD COLUMN "treatment_manager" VARCHAR(255);
ALTER TABLE "demands" ADD COLUMN "treatment_end_date" TIMESTAMP;
ALTER TABLE "demands" ADD COLUMN "path_id" VARCHAR(255);
ALTER TABLE "demands" ADD COLUMN "maintenance_manager" VARCHAR(255);
ALTER TABLE "demands" ADD COLUMN "maintenance_plan_id" VARCHAR(255);
ALTER TABLE "demands" ADD COLUMN "demand_end_date" TIMESTAMP;

-- Add foreign key for path_id
ALTER TABLE "demands" ADD CONSTRAINT "demands_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "paths"("id") ON DELETE SET NULL;
