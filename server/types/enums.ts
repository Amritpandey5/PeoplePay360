import mongoose from "mongoose";

export const ObjectId = mongoose.Schema.Types.ObjectId;

export enum UserRole {
    ADMIN = "ADMIN",
    HR_MANAGER = "HR_MANAGER",
    HR_PAYROLL_USER = "HR_PAYROLL_USER",
    HR_PAYROLL_MANAGER = "HR_PAYROLL_MANAGER",
    EMPLOYEE = "EMPLOYEE",
}

export enum EmploymentStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    TERMINATED = "TERMINATED",
    RESIGNED = "RESIGNED",
    ONBODING="ONBORDING"
}

export enum AttendanceStatus {
    PRESENT = "PRESENT",
    ABSENT = "ABSENT",
    LATE = "LATE",
    HALF_DAY = "HALF_DAY",
    HOLIDAY = "HOLIDAY",
    WEEKEND = "WEEKEND",
}

export enum ContractStatus {
    ACTIVE = "ACTIVE",
    EXPIRED = "EXPIRED",
    TERMINATED = "TERMINATED",
}

export enum PayrunStatus {
    DRAFT = "DRAFT",
    COMPUTED = "COMPUTED",
    VALIDATED = "VALIDATED",
    PAID = "PAID",
}

export enum LeaveStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
}

