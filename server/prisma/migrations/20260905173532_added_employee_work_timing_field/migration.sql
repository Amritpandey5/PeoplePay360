-- CreateEnum
CREATE TYPE "AttendenceStatus" AS ENUM ('present', 'absent', 'halftime', 'late', 'leave', 'wfh');

-- CreateTable
CREATE TABLE "Attendence" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "Attendence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeWorkTiming" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeWorkTiming_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeWorkTiming_employeeId_key" ON "EmployeeWorkTiming"("employeeId");

-- AddForeignKey
ALTER TABLE "Attendence" ADD CONSTRAINT "Attendence_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeWorkTiming" ADD CONSTRAINT "EmployeeWorkTiming_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
