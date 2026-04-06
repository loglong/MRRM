-- Add default value for tags column
ALTER TABLE "patients" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::TEXT[];