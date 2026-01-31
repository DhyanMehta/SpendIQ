UPDATE "users" SET "organizationId" = id WHERE role = 'ADMIN' AND "organizationId" IS NULL;
