/*
  Warnings:

  - Added the required column `ip` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ip` to the `Manager` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "ip" VARCHAR(45) NOT NULL;

-- AlterTable
ALTER TABLE "Manager" ADD COLUMN     "ip" VARCHAR(45) NOT NULL;
