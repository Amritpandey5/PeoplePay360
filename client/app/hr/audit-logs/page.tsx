"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  CalendarDays,
  ChevronDown,
  Clock3,
  Eye,
  FileClock,
  Filter,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import type {
  AuditLog,
  AuditLogAction,
  AuditLogEntity,
} from "@/types/audit-log";

import type { HRRole } from "@/lib/hr-permissions";

import { canRead } from "@/lib/hr-permissions";
import { HR_ROLE_LABELS } from "@/lib/hr-helpers";

import {
  getAuditLogs,
  subscribeToAuditLogChanges,
} from "@/lib/audit-log-storage";

const role: HRRole = "HR_MANAGER";

const ACTIONS: AuditLogAction[] = [
  "create",
  "update",
  "delete",
  "approve",
  "refuse",
  "process",
  "lock",
  "finalize",
  "generate",
  "login",
  "logout",
];

const ENTITIES: AuditLogEntity[] = [
  "employee",
  "attendance",
  "contract",
  "working_schedule",
  "time_off",
  "payrun",
  "payslip",
  "salary_structure",
  "salary_rule",
  "report",
  "system",
];

const actionLabels: Record<AuditLogAction, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  approve: "Approved",
  refuse: "Refused",
  process: "Processed",
  lock: "Locked",
  finalize: "Finalized",
  generate: "Generated",
  login: "Logged In",
  logout: "Logged Out",
};

const entityLabels: Record<AuditLogEntity, string> = {
  employee: "Employee",
  attendance: "Attendance",
  contract: "Contract",
  working_schedule: "Working Schedule",
  time_off: "Time Off",
  payrun: "Payrun",
  payslip: "Payslip",
  salary_structure: "Salary Structure",
  salary_rule: "Salary Rule",
  report: "Report",
  system: "System",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return `${formatDate(value)} • ${formatTime(value)}`;
}

function actionStyle(action: AuditLogAction) {
  switch (action) {
    case "create":
    case "approve":
    case "generate":
      return "bg-[#DFFF00]/35 text-[#536600]";

    case "delete":
    case "refuse":
      return "bg-red-100 text-red-600";

    case "lock":
      return "bg-orange-100 text-orange-700";

    case "process":
      return "bg-blue-100 text-blue-700";

    case "finalize":
      return "bg-purple-100 text-purple-700";

    case "login":
      return "bg-emerald-100 text-emerald-700";

    case "logout":
      return "bg-gray-100 text-gray-600";

    default:
      return "bg-black/[0.05] text-[#596052]";
  }
}

function entityIcon(entity: AuditLogEntity) {
  switch (entity) {
    case "employee":
      return <UserRound size={15} />;

    case "payrun":
    case "payslip":
      return <FileClock size={15} />;

    default:
      return <Activity size={15} />;
  }
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<
    AuditLogAction | "all"
  >("all");

  const [entityFilter, setEntityFilter] = useState<
    AuditLogEntity | "all"
  >("all");

  const [dateFilter, setDateFilter] = useState<
    "all" | "today" | "7days" | "30days"
  >("all");

  const [selectedLog, setSelectedLog] =
    useState<AuditLog | null>(null);

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLogs(getAuditLogs());

    return subscribeToAuditLogChanges((nextLogs) => {
      setLogs(nextLogs);
    });
  }, []);

  const filteredLogs = useMemo(() => {
    const now = Date.now();

    return logs.filter((log) => {
      const normalizedSearch = search.trim().toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        log.description.toLowerCase().includes(normalizedSearch) ||
        log.actorName.toLowerCase().includes(normalizedSearch) ||
        log.id.toLowerCase().includes(normalizedSearch) ||
        log.entityId?.toLowerCase().includes(normalizedSearch);

      const matchesAction =
        actionFilter === "all" ||
        log.action === actionFilter;

      const matchesEntity =
        entityFilter === "all" ||
        log.entity === entityFilter;

      const logTime = new Date(log.createdAt).getTime();

      let matchesDate = true;

      if (dateFilter === "today") {
        const today = new Date();

        const start = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        ).getTime();

        matchesDate = logTime >= start;
      }

      if (dateFilter === "7days") {
        matchesDate =
          logTime >= now - 7 * 24 * 60 * 60 * 1000;
      }

      if (dateFilter === "30days") {
        matchesDate =
          logTime >= now - 30 * 24 * 60 * 60 * 1000;
      }

      return (
        matchesSearch &&
        matchesAction &&
        matchesEntity &&
        matchesDate
      );
    });
  }, [
    logs,
    search,
    actionFilter,
    entityFilter,
    dateFilter,
  ]);

  const stats = useMemo(() => {
    return {
      total: logs.length,
      today: logs.filter((log) => {
        const date = new Date(log.createdAt);
        const today = new Date();

        return (
          date.getFullYear() === today.getFullYear() &&
          date.getMonth() === today.getMonth() &&
          date.getDate() === today.getDate()
        );
      }).length,
      creates: logs.filter(
        (log) => log.action === "create"
      ).length,
      updates: logs.filter(
        (log) => log.action === "update"
      ).length,
      deletes: logs.filter(
        (log) => log.action === "delete"
      ).length,
    };
  }, [logs]);

  const clearFilters = () => {
    setSearch("");
    setActionFilter("all");
    setEntityFilter("all");
    setDateFilter("all");
  };

  const hasFilters =
    search ||
    actionFilter !== "all" ||
    entityFilter !== "all" ||
    dateFilter !== "all";

  if (!canRead(role, "auditLogs")) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md rounded-3xl border border-black/[0.06] bg-white/70 p-8 text-center shadow-xl backdrop-blur-xl">
          <ShieldCheck
            className="mx-auto mb-4 text-red-500"
            size={42}
          />

          <h1 className="text-xl font-bold">
            Access Restricted
          </h1>

          <p className="mt-2 text-sm text-[#68705D]">
            You do not have permission to view audit logs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white/60 px-3 py-1.5 text-xs font-semibold text-[#68705D] shadow-sm backdrop-blur-xl">
              <ShieldCheck size={14} />
              Security & Activity
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Audit Logs
            </h1>

            <p className="mt-1 text-sm text-[#68705D]">
              Track important actions performed across PeoplePay360.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-black/[0.06] bg-white/65 px-4 py-3 shadow-sm backdrop-blur-xl">
            <UserRound size={16} className="text-[#68705D]" />

            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#899080]">
                Current Role
              </p>

              <p className="text-sm font-semibold">
                {HR_ROLE_LABELS[role]}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatCard
            icon={<Activity size={18} />}
            label="Total Logs"
            value={stats.total}
          />

          <StatCard
            icon={<Clock3 size={18} />}
            label="Today"
            value={stats.today}
          />

          <StatCard
            icon={<ShieldCheck size={18} />}
            label="Created"
            value={stats.creates}
          />

          <StatCard
            icon={<FileClock size={18} />}
            label="Updated"
            value={stats.updates}
          />

          <StatCard
            icon={<X size={18} />}
            label="Deleted"
            value={stats.deletes}
          />
        </div>

        {/* Search + filters */}
        <div className="mb-5 rounded-3xl border border-black/[0.06] bg-white/65 p-3 shadow-sm backdrop-blur-xl">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#899080]"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by description, user, log ID..."
                className="h-12 w-full rounded-2xl border border-black/[0.06] bg-white/70 pl-11 pr-4 text-sm outline-none transition focus:border-[#DFFF00] focus:ring-4 focus:ring-[#DFFF00]/15"
              />
            </div>

            <button
              onClick={() => setShowFilters((value) => !value)}
              className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold transition ${
                showFilters || hasFilters
                  ? "bg-[#10130B] text-[#DFFF00]"
                  : "border border-black/[0.06] bg-white/70"
              }`}
            >
              <Filter size={17} />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-3 grid gap-3 border-t border-black/[0.06] pt-3 md:grid-cols-3">
              <FilterSelect
                label="Action"
                value={actionFilter}
                onChange={(value) =>
                  setActionFilter(
                    value as AuditLogAction | "all"
                  )
                }
                options={[
                  { value: "all", label: "All Actions" },
                  ...ACTIONS.map((action) => ({
                    value: action,
                    label: actionLabels[action],
                  })),
                ]}
              />

              <FilterSelect
                label="Entity"
                value={entityFilter}
                onChange={(value) =>
                  setEntityFilter(
                    value as AuditLogEntity | "all"
                  )
                }
                options={[
                  { value: "all", label: "All Entities" },
                  ...ENTITIES.map((entity) => ({
                    value: entity,
                    label: entityLabels[entity],
                  })),
                ]}
              />

              <FilterSelect
                label="Date"
                value={dateFilter}
                onChange={(value) =>
                  setDateFilter(
                    value as
                      | "all"
                      | "today"
                      | "7days"
                      | "30days"
                  )
                }
                options={[
                  { value: "all", label: "All Time" },
                  { value: "today", label: "Today" },
                  { value: "7days", label: "Last 7 Days" },
                  { value: "30days", label: "Last 30 Days" },
                ]}
              />
            </div>
          )}

          {hasFilters && (
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-black/[0.06] pt-3">
              <p className="text-xs text-[#68705D]">
                Showing {filteredLogs.length} of {logs.length} logs
              </p>

              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-[#596052] hover:text-black"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-3xl border border-black/[0.06] bg-white/65 shadow-sm backdrop-blur-xl lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-black/[0.06] bg-black/[0.02] text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#899080]">
                    Activity
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#899080]">
                    User
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#899080]">
                    Entity
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#899080]">
                    Time
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#899080]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-black/[0.05] last:border-0 hover:bg-[#DFFF00]/[0.04]"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#DFFF00]/25 text-[#596600]">
                          {entityIcon(log.entity)}
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[420px] truncate text-sm font-semibold">
                            {log.description}
                          </p>

                          <p className="mt-1 font-mono text-[10px] text-[#899080]">
                            {log.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-medium">
                        {log.actorName}
                      </p>

                      {log.actorRole && (
                        <p className="mt-1 text-xs text-[#899080]">
                          {HR_ROLE_LABELS[log.actorRole]}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-black/[0.04] px-2.5 py-1 text-xs font-medium">
                        {entityLabels[log.entity]}
                      </span>

                      {log.entityId && (
                        <p className="mt-1 font-mono text-[10px] text-[#899080]">
                          {log.entityId}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-medium">
                        {formatDate(log.createdAt)}
                      </p>

                      <p className="mt-1 text-xs text-[#899080]">
                        {formatTime(log.createdAt)}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${actionStyle(
                            log.action
                          )}`}
                        >
                          {actionLabels[log.action]}
                        </span>

                        <button
                          onClick={() => setSelectedLog(log)}
                          className="rounded-xl border border-black/[0.06] bg-white/70 p-2 transition hover:bg-[#DFFF00]"
                          aria-label="View audit log"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <EmptyState hasFilters={Boolean(hasFilters)} />
          )}
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 lg:hidden">
          {filteredLogs.map((log) => (
            <button
              key={log.id}
              onClick={() => setSelectedLog(log)}
              className="w-full rounded-3xl border border-black/[0.06] bg-white/65 p-4 text-left shadow-sm backdrop-blur-xl transition hover:border-[#DFFF00]/50"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DFFF00]/25 text-[#596600]">
                  {entityIcon(log.entity)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${actionStyle(
                        log.action
                      )}`}
                    >
                      {actionLabels[log.action]}
                    </span>

                    <span className="text-[10px] text-[#899080]">
                      {formatDateTime(log.createdAt)}
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-semibold">
                    {log.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-lg bg-black/[0.04] px-2 py-1 text-[10px] font-medium">
                      {entityLabels[log.entity]}
                    </span>

                    <span className="rounded-lg bg-black/[0.04] px-2 py-1 text-[10px] font-medium">
                      {log.actorName}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}

          {filteredLogs.length === 0 && (
            <div className="rounded-3xl border border-black/[0.06] bg-white/65 p-8 shadow-sm backdrop-blur-xl">
              <EmptyState hasFilters={Boolean(hasFilters)} />
            </div>
          )}
        </div>
      </div>

      {/* Details modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/60 bg-white/90 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#899080]">
                  Audit Event
                </p>

                <h2 className="mt-1 text-lg font-bold">
                  Activity Details
                </h2>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-xl p-2 transition hover:bg-black/[0.05]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="rounded-2xl bg-[#DFFF00]/15 p-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${actionStyle(
                      selectedLog.action
                    )}`}
                  >
                    {actionLabels[selectedLog.action]}
                  </span>

                  <span className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold">
                    {entityLabels[selectedLog.entity]}
                  </span>
                </div>

                <p className="mt-3 text-sm font-semibold">
                  {selectedLog.description}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Detail
                  label="Log ID"
                  value={selectedLog.id}
                  mono
                />

                <Detail
                  label="Date & Time"
                  value={formatDateTime(
                    selectedLog.createdAt
                  )}
                />

                <Detail
                  label="Performed By"
                  value={selectedLog.actorName}
                />

                <Detail
                  label="Role"
                  value={
                    selectedLog.actorRole
                      ? HR_ROLE_LABELS[
                          selectedLog.actorRole
                        ]
                      : "—"
                  }
                />

                <Detail
                  label="Entity"
                  value={entityLabels[selectedLog.entity]}
                />

                <Detail
                  label="Entity ID"
                  value={selectedLog.entityId || "—"}
                  mono
                />
              </div>

              {selectedLog.metadata &&
                Object.keys(selectedLog.metadata).length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#899080]">
                      Metadata
                    </p>

                    <pre className="max-h-64 overflow-auto rounded-2xl bg-[#10130B] p-4 text-xs leading-6 text-[#DFFF00]">
                      {JSON.stringify(
                        selectedLog.metadata,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl border border-black/[0.06] bg-white/65 p-4 shadow-sm backdrop-blur-xl">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#DFFF00]/25 text-[#596600]">
        {icon}
      </div>

      <p className="text-xs text-[#899080]">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold">
        {value}
      </p>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-[#68705D]">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full appearance-none rounded-xl border border-black/[0.06] bg-white/70 px-3 pr-10 text-sm outline-none focus:border-[#DFFF00] focus:ring-4 focus:ring-[#DFFF00]/15"
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#899080]"
        />
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.05] bg-black/[0.02] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#899080]">
        {label}
      </p>

      <p
        className={`mt-1.5 break-all text-sm font-medium ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyState({
  hasFilters,
}: {
  hasFilters: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DFFF00]/25 text-[#596600]">
        <FileClock size={25} />
      </div>

      <h3 className="text-base font-bold">
        {hasFilters
          ? "No matching audit logs"
          : "No audit activity yet"}
      </h3>

      <p className="mt-1 max-w-sm text-sm text-[#899080]">
        {hasFilters
          ? "Try changing your search or filters."
          : "Important system activities will appear here automatically."}
      </p>
    </div>
  );
}
