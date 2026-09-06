import type { HRRole } from "@/lib/hr-permissions";

export type AuditLogAction =
  | "create"
  | "update"
  | "delete"
  | "approve"
  | "refuse"
  | "process"
  | "lock"
  | "finalize"
  | "generate"
  | "login"
  | "logout";

export type AuditLogEntity =
  | "employee"
  | "attendance"
  | "contract"
  | "working_schedule"
  | "time_off"
  | "payrun"
  | "payslip"
  | "salary_structure"
  | "salary_rule"
  | "report"
  | "system";

export type AuditLog = {
  id: string;

  actorId?: string;
  actorName: string;
  actorRole?: HRRole;

  action: AuditLogAction;
  entity: AuditLogEntity;

  entityId?: string;

  description: string;

  metadata?: Record<string, unknown>;

  createdAt: string;
};