-- AlterEnum
ALTER TYPE "AttendenceStatus" ADD VALUE IF NOT EXISTS 'halfday';

-- AlterTable
ALTER TABLE "Attendence" ADD COLUMN "status" "AttendenceStatus" NOT NULL DEFAULT 'absent';

-- AlterTable
ALTER TABLE "EmployeeWorkTiming" ADD COLUMN "working" BOOLEAN NOT NULL DEFAULT false;
