CREATE UNIQUE INDEX permission_path_method_unique
ON "Permission" (path, method)
WHERE "deletedAt" IS NULL;-- This is an empty migration.-- This is an empty migration.