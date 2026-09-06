import type {
  HRModule,
  HRRole,
  PermissionAction,
} from "@/lib/hr-permissions";

import { hasPermission } from "@/lib/hr-permissions";

/* =========================================================
   ROLE LABELS
========================================================= */

export const HR_ROLE_LABELS: Record<HRRole, string> = {
  HR_MANAGER: "HR Manager",

  HR_PAYROLL_USER: "HR Payroll User",

  HR_PAYROLL_MANAGER: "HR Payroll Manager",
};

/* =========================================================
   ROLE DESCRIPTIONS
========================================================= */

export const HR_ROLE_DESCRIPTIONS: Record<HRRole, string> = {
  HR_MANAGER:
    "Manage employees, attendance, contracts, schedules and time off.",

  HR_PAYROLL_USER:
    "Manage HR operations and work with payroll records.",

  HR_PAYROLL_MANAGER:
    "Full control over HR, payroll and compensation configuration.",
};

/* =========================================================
   MODULE LABELS
========================================================= */

export const HR_MODULE_LABELS: Record<HRModule, string> = {
  employees: "Employees",

  attendance: "Attendance",

  contracts: "Contracts",

  workingSchedules: "Working Schedules",

  timeOff: "Time Off",

  payruns: "Payruns",

  payslips: "Payslips",

  salaryStructures: "Salary Structures",

  salaryRules: "Salary Rules",
  reports: "Reports",
  auditLogs: "Audit Logs",
};

/* =========================================================
   PERMISSION LABELS
========================================================= */

export const PERMISSION_LABELS: Record<
  PermissionAction,
  string
> = {
  create: "Create",

  read: "Read",

  update: "Update",

  delete: "Delete",

  approve: "Approve",

  refuse: "Refuse",
};

/* =========================================================
   ROLE HELPERS
========================================================= */

export function isPayrollRole(
  role: HRRole
): boolean {
  return (
    role === "HR_PAYROLL_USER" ||
    role === "HR_PAYROLL_MANAGER"
  );
}

export function isPayrollManager(
  role: HRRole
): boolean {
  return role === "HR_PAYROLL_MANAGER";
}

export function isHRManager(
  role: HRRole
): boolean {
  return role === "HR_MANAGER";
}

/* =========================================================
   MODULE ACCESS
========================================================= */

export function canAccessModule(
  role: HRRole,
  module: HRModule
): boolean {
  return hasPermission(
    role,
    module,
    "read"
  );
}

/* =========================================================
   MODULE MANAGEMENT
========================================================= */

export function canManageModule(
  role: HRRole,
  module: HRModule
): boolean {
  return (
    hasPermission(
      role,
      module,
      "create"
    ) ||
    hasPermission(
      role,
      module,
      "update"
    ) ||
    hasPermission(
      role,
      module,
      "delete"
    )
  );
}

/* =========================================================
   READ ONLY
========================================================= */

export function isReadOnlyModule(
  role: HRRole,
  module: HRModule
): boolean {
  return (
    canAccessModule(role, module) &&
    !canManageModule(role, module)
  );
}