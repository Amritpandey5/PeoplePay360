import mongoose from "mongoose";

export const ObjectId = mongoose.Schema.Types.ObjectId;

// =========================
// EMPLOYEE
// =========================

export enum EmployeeRole {
  DEVELOPER = "DEVELOPER",
  DESIGNER = "DESIGNER",
  STAFF = "STAFF",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHERS = "OTHERS",
}

export enum EmployeeStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  TERMINATED = "TERMINATED",
  RESIGNED = "RESIGNED",
  ONBOARDING = "ONBOARDING",
}

// =========================
// ATTENDANCE
// =========================

export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  LATE = "LATE",
  HALF_DAY = "HALF_DAY",
  HOLIDAY = "HOLIDAY",
  WEEKEND = "WEEKEND",
}

// =========================
// CONTRACT
// =========================

export enum ContractStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  TERMINATED = "TERMINATED",
}

// =========================
// PAYRUN
// =========================

export enum PayrunStatus {
  DRAFT = "DRAFT",
  COMPUTED = "COMPUTED",
  VALIDATED = "VALIDATED",
  PAID = "PAID",
}

// =========================
// LEAVE
// =========================

export enum LeaveStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

// =========================
// MANAGER
// =========================

export enum ManagerRole {
  HR = "HR",
  HR_PAYROLL = "HR_PAYROLL",
  HR_PAYROLL_MANAGER = "HR_PAYROLL_MANAGER",
}

// =========================
// DEPARTMENT
// =========================

export enum Department {
  SALES = "SALES",
  DEVELOPMENT = "DEVELOPMENT",
  PRODUCT = "PRODUCT",
}