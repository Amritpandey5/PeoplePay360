export type HRRole =
  | "HR_MANAGER"
  | "HR_PAYROLL_USER"
  | "HR_PAYROLL_MANAGER";

export type HRModule =
  | "employees"
  | "attendance"
  | "contracts"
  | "workingSchedules"
  | "timeOff"
  | "payruns"
  | "payslips"
  | "salaryStructures"
  | "salaryRules"
  | "reports"
  | "auditLogs";

export type PermissionAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "approve"
  | "refuse";

type PermissionMap = Record<
  HRModule,
  Partial<Record<PermissionAction, boolean>>
>;

/* =========================================================
   HR MANAGER
   =========================================================
   HR Manager handles:
   - Employees
   - Attendance
   - Contracts
   - Working Schedules
   - Time Off
   - Reports

   HR Manager does NOT handle:
   - PayRuns
   - Payslips
   - Salary Structures
   - Salary Rules
========================================================= */

const managerHR: PermissionMap = {
  employees: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },

  attendance: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },

  contracts: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },

  workingSchedules: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },

  timeOff: {
    create: true,
    read: true,
    update: true,
    delete: true,
    approve: true,
    refuse: true,
  },

  payruns: {},

  payslips: {},

  salaryStructures: {},

  salaryRules: {},

  reports: {
    read: true,
  },
  auditLogs: { read: true },
};

/* =========================================================
   HR PAYROLL USER
   =========================================================
   HR Payroll User handles:
   - HR operations
   - PayRuns
   - Read-only Payslips
   - Read-only Salary Structures
   - Read-only Salary Rules
   - Reports

   IMPORTANT:
   Payslips are READ ONLY for Payroll User.
   They CANNOT:
   - Create
   - Edit
   - Delete
   - Finalize Payslips
========================================================= */

const payrollUser: PermissionMap = {
  ...managerHR,

  payruns: {
    create: true,
    read: true,
    update: true,
  },

  payslips: {
    read: true,
  },

  salaryStructures: {
    read: true,
  },

  salaryRules: {
    read: true,
  },

  reports: {
    read: true,
  },

  auditLogs: { read: true },
};

/* =========================================================
   HR PAYROLL MANAGER
   =========================================================
   HR Payroll Manager has complete payroll control.

   Handles:
   - HR operations
   - PayRuns CRUD
   - Payslips CRUD
   - Salary Structures CRUD
   - Salary Rules CRUD
   - Reports
========================================================= */

const payrollManager: PermissionMap = {
  ...managerHR,

  payruns: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },

  payslips: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },

  salaryStructures: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },

  salaryRules: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },

  reports: {
    read: true,
  },
  auditLogs: { read: true },
};

/* =========================================================
   COMPLETE PERMISSION MATRIX
========================================================= */

export const HR_PERMISSIONS: Record<
  HRRole,
  PermissionMap
> = {
  HR_MANAGER: managerHR,

  HR_PAYROLL_USER: payrollUser,

  HR_PAYROLL_MANAGER: payrollManager,
};

/* =========================================================
   GENERIC PERMISSION CHECK
========================================================= */

export function hasPermission(
  role: HRRole,
  module: HRModule,
  action: PermissionAction
): boolean {
  return Boolean(
    HR_PERMISSIONS[role]?.[module]?.[action]
  );
}

/* =========================================================
   READ
========================================================= */

export function canRead(
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
   CREATE
========================================================= */

export function canCreate(
  role: HRRole,
  module: HRModule
): boolean {
  return hasPermission(
    role,
    module,
    "create"
  );
}

/* =========================================================
   UPDATE
========================================================= */

export function canUpdate(
  role: HRRole,
  module: HRModule
): boolean {
  return hasPermission(
    role,
    module,
    "update"
  );
}

/* =========================================================
   DELETE
========================================================= */

export function canDelete(
  role: HRRole,
  module: HRModule
): boolean {
  return hasPermission(
    role,
    module,
    "delete"
  );
}

/* =========================================================
   APPROVE
========================================================= */

export function canApprove(
  role: HRRole,
  module: HRModule
): boolean {
  return hasPermission(
    role,
    module,
    "approve"
  );
}

/* =========================================================
   REFUSE
========================================================= */

export function canRefuse(
  role: HRRole,
  module: HRModule
): boolean {
  return hasPermission(
    role,
    module,
    "refuse"
  );
}

/* =========================================================
   ROLE HELPERS
========================================================= */

export function isHRManager(
  role: HRRole
): boolean {
  return role === "HR_MANAGER";
}

export function isPayrollUser(
  role: HRRole
): boolean {
  return role === "HR_PAYROLL_USER";
}

export function isPayrollManager(
  role: HRRole
): boolean {
  return role === "HR_PAYROLL_MANAGER";
}

/* =========================================================
   PAYROLL ROLE CHECK
========================================================= */

export function isPayrollRole(
  role: HRRole
): boolean {
  return (
    role === "HR_PAYROLL_USER" ||
    role === "HR_PAYROLL_MANAGER"
  );
}

/* =========================================================
   MODULE ACCESS
========================================================= */

export function canAccessModule(
  role: HRRole,
  module: HRModule
): boolean {
  return canRead(role, module);
}

/* =========================================================
   MODULE MANAGEMENT
========================================================= */

export function canManageModule(
  role: HRRole,
  module: HRModule
): boolean {
  return (
    canCreate(role, module) ||
    canUpdate(role, module) ||
    canDelete(role, module)
  );
}

/* =========================================================
   READ-ONLY MODULE
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
