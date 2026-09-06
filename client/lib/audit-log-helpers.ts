import type { 
    AuditLogAction,
    AuditLogEntity
} from "@/types/audit-log"
import type { HRRole } from "@/lib/hr-permissions"
import { createAuditLog } from "@/lib/audit-log-storage";

type RecordAuditLogInput = {
    actorId?: string;
    actorName: string;
    actorRole?: HRRole;
    action: AuditLogAction;
    entity: AuditLogEntity;
    entityId?: string;
    description: string;
    metadata?: Record<string, unknown>;
};

export function recordAuditLog(input: RecordAuditLogInput) {
    return createAuditLog(input);
}
