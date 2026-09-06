import type {
  AuditLog,
  AuditLogAction,
  AuditLogEntity,
} from "@/types/audit-log";

const STORAGE_KEY = "peoplepay360_audit_logs";

function isBrowser() {
  return typeof window !== "undefined";
}

function readLogs(): AuditLog[] {
  if (!isBrowser()) return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return [];

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLogs(logs: AuditLog[]) {
  if (!isBrowser()) return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));

  window.dispatchEvent(
    new CustomEvent("peoplepay360:audit-log-change")
  );
}

export function getAuditLogs(): AuditLog[] {
  return readLogs().sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );
}

export function saveAuditLogs(logs: AuditLog[]) {
  writeLogs(logs);
}

export function getAuditLogById(id: string): AuditLog | undefined {
  return readLogs().find((log) => log.id === id);
}

export function getAuditLogsByAction(
  action: AuditLogAction
): AuditLog[] {
  return getAuditLogs().filter((log) => log.action === action);
}

export function getAuditLogsByEntity(
  entity: AuditLogEntity
): AuditLog[] {
  return getAuditLogs().filter((log) => log.entity === entity);
}

export function getAuditLogsByActor(
  actorId: string
): AuditLog[] {
  return getAuditLogs().filter((log) => log.actorId === actorId);
}

export function createAuditLog(
  data: Omit<AuditLog, "id" | "createdAt">
): AuditLog {
  const logs = readLogs();

  const log: AuditLog = {
    ...data,
    id: `AUD-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };

  writeLogs([log, ...logs]);

  return log;
}

export function deleteAuditLog(id: string): boolean {
  const logs = readLogs();

  const nextLogs = logs.filter((log) => log.id !== id);

  if (nextLogs.length === logs.length) {
    return false;
  }

  writeLogs(nextLogs);

  return true;
}

export function clearAuditLogs() {
  writeLogs([]);
}

export function subscribeToAuditLogChanges(
  callback: (logs: AuditLog[]) => void
) {
  if (!isBrowser()) {
    return () => {};
  }

  const handler = () => {
    callback(getAuditLogs());
  };

  window.addEventListener(
    "peoplepay360:audit-log-change",
    handler
  );

  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(
      "peoplepay360:audit-log-change",
      handler
    );

    window.removeEventListener("storage", handler);
  };
}