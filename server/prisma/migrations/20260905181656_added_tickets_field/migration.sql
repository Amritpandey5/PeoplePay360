/*
  Warnings:

  - The values [halftime] on the enum `AttendenceStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AttendenceStatus_new" AS ENUM ('present', 'absent', 'halfday', 'late', 'leave', 'wfh');
ALTER TABLE "public"."Attendence" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Attendence" ALTER COLUMN "status" TYPE "AttendenceStatus_new" USING ("status"::text::"AttendenceStatus_new");
ALTER TYPE "AttendenceStatus" RENAME TO "AttendenceStatus_old";
ALTER TYPE "AttendenceStatus_new" RENAME TO "AttendenceStatus";
DROP TYPE "public"."AttendenceStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Attendence" ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "duration" DROP DEFAULT;

-- AlterTable
ALTER TABLE "EmployeeWorkTiming" ALTER COLUMN "working" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Tickets" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Tickets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Tickets" ADD CONSTRAINT "Tickets_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
