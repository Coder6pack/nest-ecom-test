CREATE UNIQUE INDEX "SKU_productId_value_unique"
ON "SKU" ("productId", "value")
WHERE "deletedAt" IS NULL;