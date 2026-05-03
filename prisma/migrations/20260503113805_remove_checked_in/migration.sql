/*
  Warnings:

  - The values [CHECKED_IN] on the enum `ShiftStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ShiftStatus_new" AS ENUM ('ASSIGNED', 'ABSENT');
ALTER TABLE "public"."ShiftAssignment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ShiftAssignment" ALTER COLUMN "status" TYPE "ShiftStatus_new" USING ("status"::text::"ShiftStatus_new");
ALTER TYPE "ShiftStatus" RENAME TO "ShiftStatus_old";
ALTER TYPE "ShiftStatus_new" RENAME TO "ShiftStatus";
DROP TYPE "public"."ShiftStatus_old";
ALTER TABLE "ShiftAssignment" ALTER COLUMN "status" SET DEFAULT 'ASSIGNED';
COMMIT;
