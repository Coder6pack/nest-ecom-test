CREATE UNIQUE INDEX "brand_unique_name"
ON "Brand" ("name")
WHERE "deletedAt" IS NULL;-- This is an empty migration.