-- Add ICD diagnosis codes and surgery name to Path model
ALTER TABLE "paths" ADD COLUMN "icd10_code" VARCHAR(20);
ALTER TABLE "paths" ADD COLUMN "icd9_code" VARCHAR(20);
ALTER TABLE "paths" ADD COLUMN "diagnosis_name" VARCHAR(200);
ALTER TABLE "paths" ADD COLUMN "surgery_name" VARCHAR(200);
