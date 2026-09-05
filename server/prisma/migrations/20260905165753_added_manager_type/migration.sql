/*
  Warnings:

  - Added the required column `type` to the `Manager` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ManagerType" AS ENUM ('Hr_Manager', 'Hr_Payroll', 'Hr_Payroll_Manager');

-- AlterTable
ALTER TABLE "Manager" ADD COLUMN     "type" "ManagerType" NOT NULL;
