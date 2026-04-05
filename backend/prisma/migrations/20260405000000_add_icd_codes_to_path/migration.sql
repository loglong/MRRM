-- Add ICD diagnosis codes to Path model
ALTER TABLE "paths" ADD COLUMN "icd10_code" VARCHAR(20);
ALTER TABLE "paths" ADD COLUMN "icd9_code" VARCHAR(20);
ALTER TABLE "paths" ADD COLUMN "diagnosis_name" VARCHAR(200);
