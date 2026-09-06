"use client"

import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Check,
  Clock3,
  Edit3,
  Loader2,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

import HRPageHeader from "@/components/hr/HRPageHeader";
import HRGlassCard from "@/components/hr/HRGlassCard";
import HREmptyState from "@/components/hr/HREmptyState";

import type {
  ScheduleDay,
  ScheduleType,
  WeekDay,
  WorkingSchedule,
} from "@/types/working-schedule";
import type { Employee } from "@/types/employee";
import type { Contract } from "@/types/contract";

import {
  calculateDayHours,
  calculateWeeklyHours,
  createWorkingSchedule,
  deleteWorkingSchedule,
  getWorkingSchedules,
  subscribeToWorkingScheduleChanges,
  updateWorkingSchedule,
} from "@/lib/working-schedule-storage";

import { getEmployees } from "@/lib/employee-storage";
import {
  canCreate,
  canDelete,
  canUpdate,
} from "@/lib/hr-permissions";
import type { HRRole } from "@/lib/hr-permissions";

import {
  getContracts,
  subscribeToContractChanges,
} from "@/lib/contract-storage";

const role: HRRole = "HR_MANAGER";

const WEEK_DAYS: {
  key: WeekDay;
  label: string;
  short: string;
}[] = [
  { key: "monday", label: "Monday", short: "Mon" },
  { key: "tuesday", label: "Tuesday", short: "Tue" },
  { key: "wednesday", label: "Wednesday", short: "Wed" },
  { key: "thursday", label: "Thursday", short: "Thu" },
  { key: "friday", label: "Friday", short: "Fri" },
  { key: "saturday", label: "Saturday", short: "Sat" },
  { key: "sunday", label: "Sunday", short: "Sun" },
];

const TYPE_LABELS: Record<ScheduleType, string> = {
  fixed: "Fixed",
  shift: "Shift",
  flexible: "Flexible",
};

function createDefaultDays(): ScheduleDay[] {
  return WEEK_DAYS.map(({ key }) => ({
    day: key,
    enabled: ["monday", "tuesday", "wednesday", "thursday", "friday"].includes(
      key
    ),
    startTime: "09:00",
    endTime: "18:00",
    breakMinutes: 60,
  }));
}

function emptyForm() {
  return {
    name: "",
    type: "fixed" as ScheduleType,
    days: createDefaultDays(),
    employeeIds: [] as string[],
    contractIds: [] as string[],
    isActive: true,
  };
}

function formatHours(hours: number) {
  return Number.isInteger(hours)
    ? `${hours}h`
    : `${hours.toFixed(1)}h`;
}

function getEmployeeName(
  employeeId: string,
  employees: Employee[]
) {
  return (
    employees.find((employee) => employee.id === employeeId)?.name ||
    "Unknown employee"
  );
}

export default function WorkingSchedulesPage() {
  const [schedules, setSchedules] = useState<WorkingSchedule[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ScheduleType>("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] =
    useState<WorkingSchedule | null>(null);

  const [form, setForm] = useState(emptyForm());

  const canCreateSchedule = canCreate(role, "workingSchedules");
  const canUpdateSchedule = canUpdate(role, "workingSchedules");
  const canDeleteSchedule = canDelete(role, "workingSchedules");

  useEffect(() => {
    const load = () => {
      setSchedules(getWorkingSchedules());
      setEmployees(getEmployees());
      setContracts(getContracts());
      setLoading(false);
    };

    load();

    const unsubscribeSchedules =
      subscribeToWorkingScheduleChanges(load);

    const unsubscribeContracts =
      subscribeToContractChanges(load);

    return () => {
      unsubscribeSchedules();
      unsubscribeContracts();
    };
  }, []);

  const filteredSchedules = useMemo(() => {
    const query = search.trim().toLowerCase();

    return schedules.filter((schedule) => {
      const matchesSearch =
        !query ||
        schedule.name.toLowerCase().includes(query) ||
        schedule.id.toLowerCase().includes(query);

      const matchesType =
        typeFilter === "all" ||
        schedule.type === typeFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && schedule.isActive) ||
        (statusFilter === "inactive" && !schedule.isActive);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [schedules, search, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    const active = schedules.filter(
      (schedule) => schedule.isActive
    ).length;

    const assignedEmployees = new Set(
      schedules.flatMap((schedule) => schedule.employeeIds)
    ).size;

    const totalWeeklyHours = schedules.reduce(
      (total, schedule) => total + schedule.weeklyHours,
      0
    );

    return {
      total: schedules.length,
      active,
      assignedEmployees,
      totalWeeklyHours,
    };
  }, [schedules]);

  const formWeeklyHours = useMemo(
    () => calculateWeeklyHours(form.days),
    [form.days]
  );

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm());
    setModalOpen(true);
  }

  function openEditModal(schedule: WorkingSchedule) {
    setEditingId(schedule.id);

    setForm({
      name: schedule.name,
      type: schedule.type,
      days: schedule.days.map((day) => ({
        ...day,
      })),
      employeeIds: [...schedule.employeeIds],
      contractIds: [...schedule.contractIds],
      isActive: schedule.isActive,
    });

    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm());
  }

  function updateDay(
    index: number,
    updates: Partial<ScheduleDay>
  ) {
    setForm((current) => ({
      ...current,
      days: current.days.map((day, dayIndex) =>
        dayIndex === index
          ? {
              ...day,
              ...updates,
            }
          : day
      ),
    }));
  }

  function toggleEmployee(employeeId: string) {
    setForm((current) => {
      const exists = current.employeeIds.includes(employeeId);

      return {
        ...current,
        employeeIds: exists
          ? current.employeeIds.filter(
              (id) => id !== employeeId
            )
          : [...current.employeeIds, employeeId],
      };
    });
  }

  function toggleContract(contractId: string) {
    setForm((current) => {
      const exists = current.contractIds.includes(contractId);

      return {
        ...current,
        contractIds: exists
          ? current.contractIds.filter(
              (id) => id !== contractId
            )
          : [...current.contractIds, contractId],
      };
    });
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.name.trim()) return;

    if (editingId && !canUpdateSchedule) return;
    if (!editingId && !canCreateSchedule) return;

    setSaving(true);

    try {
      if (editingId) {
        updateWorkingSchedule(editingId, {
          name: form.name.trim(),
          type: form.type,
          days: form.days,
          employeeIds: form.employeeIds,
          contractIds: form.contractIds,
          isActive: form.isActive,
        });
      } else {
        createWorkingSchedule({
          name: form.name.trim(),
          type: form.type,
          days: form.days,
          employeeIds: form.employeeIds,
          contractIds: form.contractIds,
          isActive: form.isActive,
        });
      }

      setModalOpen(false);
      setEditingId(null);
      setForm(emptyForm());
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!deleteTarget || !canDeleteSchedule) return;

    deleteWorkingSchedule(deleteTarget.id);
    setDeleteTarget(null);
  }

  function toggleActive(schedule: WorkingSchedule) {
    if (!canUpdateSchedule) return;

    updateWorkingSchedule(schedule.id, {
      isActive: !schedule.isActive,
    });
  }

  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <div className="mx-auto max-w-[1600px]">
        <HRPageHeader
          title="Working Schedules"
          description="Create and manage employee working schedules, working hours and assignments."
          action={
            canCreateSchedule
              ? {
                  label: "Add Schedule",
                  onClick: openCreateModal,
                  icon: Plus,
                }
              : undefined
          }
        />

        {/* Stats */}
        <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={CalendarClock}
            label="Total Schedules"
            value={stats.total}
          />

          <StatCard
            icon={Check}
            label="Active"
            value={stats.active}
          />

          <StatCard
            icon={Users}
            label="Assigned Employees"
            value={stats.assignedEmployees}
          />

          <StatCard
            icon={Clock3}
            label="Weekly Hours"
            value={formatHours(stats.totalWeeklyHours)}
          />
        </div>

        {/* Filters */}
        <HRGlassCard className="mt-6 p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#68705D]" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search schedules..."
                className="h-11 w-full rounded-xl border border-black/[0.06] bg-white/70 pl-10 pr-4 text-sm outline-none transition placeholder:text-[#8A9182] focus:border-[#DFFF00] focus:ring-4 focus:ring-[#DFFF00]/15"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value as
                    | "all"
                    | ScheduleType
                )
              }
              className="h-11 rounded-xl border border-black/[0.06] bg-white/70 px-4 text-sm font-medium outline-none focus:border-[#DFFF00] focus:ring-4 focus:ring-[#DFFF00]/15"
            >
              <option value="all">All Types</option>
              <option value="fixed">Fixed</option>
              <option value="shift">Shift</option>
              <option value="flexible">Flexible</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "all"
                    | "active"
                    | "inactive"
                )
              }
              className="h-11 rounded-xl border border-black/[0.06] bg-white/70 px-4 text-sm font-medium outline-none focus:border-[#DFFF00] focus:ring-4 focus:ring-[#DFFF00]/15"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </HRGlassCard>

        {/* Content */}
        <div className="mt-6">
          {loading ? (
            <HRGlassCard className="flex min-h-[320px] items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-[#68705D]" />
            </HRGlassCard>
          ) : filteredSchedules.length === 0 ? (
            <HRGlassCard>
              <HREmptyState
                icon={CalendarClock}
                title={
                  schedules.length === 0
                    ? "No working schedules yet"
                    : "No schedules found"
                }
                description={
                  schedules.length === 0
                    ? "Create your first working schedule to start assigning working hours."
                    : "Try changing your search or filters."
                }
                action={
                  schedules.length === 0 &&
                  canCreateSchedule
                    ? {
                        label: "Create Schedule",
                        onClick: openCreateModal,
                      }
                    : undefined
                }
              />
            </HRGlassCard>
          ) : (
            <>
              {/* Desktop */}
              <HRGlassCard className="hidden overflow-hidden lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="border-b border-black/[0.06] bg-white/35">
                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#68705D]">
                          Schedule
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#68705D]">
                          Type
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#68705D]">
                          Working Days
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#68705D]">
                          Weekly Hours
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#68705D]">
                          Employees
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#68705D]">
                          Status
                        </th>
                        <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#68705D]">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredSchedules.map((schedule) => {
                        const enabledDays =
                          schedule.days.filter(
                            (day) => day.enabled
                          );

                        return (
                          <tr
                            key={schedule.id}
                            className="border-b border-black/[0.05] last:border-0 hover:bg-white/40"
                          >
                            <td className="px-5 py-5">
                              <div>
                                <p className="font-bold text-[#10130B]">
                                  {schedule.name}
                                </p>
                                <p className="mt-1 text-xs text-[#8A9182]">
                                  {schedule.id}
                                </p>
                              </div>
                            </td>

                            <td className="px-5 py-5">
                              <span className="inline-flex rounded-full border border-black/[0.06] bg-white/70 px-3 py-1 text-xs font-semibold text-[#10130B]">
                                {TYPE_LABELS[schedule.type]}
                              </span>
                            </td>

                            <td className="px-5 py-5">
                              <div className="flex max-w-[180px] flex-wrap gap-1.5">
                                {enabledDays.map((day) => (
                                  <span
                                    key={day.day}
                                    className="rounded-lg bg-[#DFFF00]/25 px-2 py-1 text-[11px] font-bold text-[#10130B]"
                                  >
                                    {
                                      WEEK_DAYS.find(
                                        (item) =>
                                          item.key ===
                                          day.day
                                      )?.short
                                    }
                                  </span>
                                ))}
                              </div>
                            </td>

                            <td className="px-5 py-5">
                              <span className="font-bold text-[#10130B]">
                                {formatHours(
                                  schedule.weeklyHours
                                )}
                              </span>
                            </td>

                            <td className="px-5 py-5">
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10130B] text-[#DFFF00]">
                                  <Users className="h-4 w-4" />
                                </div>

                                <span className="text-sm font-semibold">
                                  {
                                    schedule.employeeIds
                                      .length
                                  }
                                </span>
                              </div>
                            </td>

                            <td className="px-5 py-5">
                              <button
                                type="button"
                                disabled={!canUpdateSchedule}
                                onClick={() =>
                                  toggleActive(schedule)
                                }
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                                  schedule.isActive
                                    ? "bg-[#DFFF00]/30 text-[#10130B]"
                                    : "bg-black/[0.05] text-[#68705D]"
                                } ${
                                  canUpdateSchedule
                                    ? "hover:bg-[#DFFF00]/50"
                                    : "cursor-default"
                                }`}
                              >
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    schedule.isActive
                                      ? "bg-[#10130B]"
                                      : "bg-[#8A9182]"
                                  }`}
                                />
                                {schedule.isActive
                                  ? "Active"
                                  : "Inactive"}
                              </button>
                            </td>

                            <td className="px-5 py-5">
                              <div className="flex justify-end gap-2">
                                {canUpdateSchedule && (
                                  <IconButton
                                    label="Edit"
                                    onClick={() =>
                                      openEditModal(
                                        schedule
                                      )
                                    }
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </IconButton>
                                )}

                                {canDeleteSchedule && (
                                  <IconButton
                                    label="Delete"
                                    danger
                                    onClick={() =>
                                      setDeleteTarget(
                                        schedule
                                      )
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </IconButton>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </HRGlassCard>

              {/* Mobile / Tablet */}
              <div className="grid gap-4 lg:hidden">
                {filteredSchedules.map((schedule) => (
                  <HRGlassCard
                    key={schedule.id}
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-[#10130B]">
                          {schedule.name}
                        </h3>

                        <p className="mt-1 text-xs text-[#8A9182]">
                          {schedule.id}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${
                          schedule.isActive
                            ? "bg-[#DFFF00]/30 text-[#10130B]"
                            : "bg-black/[0.05] text-[#68705D]"
                        }`}
                      >
                        {schedule.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <InfoBox
                        label="Type"
                        value={
                          TYPE_LABELS[schedule.type]
                        }
                      />

                      <InfoBox
                        label="Weekly Hours"
                        value={formatHours(
                          schedule.weeklyHours
                        )}
                      />

                      <InfoBox
                        label="Employees"
                        value={`${schedule.employeeIds.length}`}
                      />

                      <InfoBox
                        label="Contracts"
                        value={`${schedule.contractIds.length}`}
                      />
                    </div>

                    <div className="mt-4">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#68705D]">
                        Working Days
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {schedule.days
                          .filter((day) => day.enabled)
                          .map((day) => (
                            <span
                              key={day.day}
                              className="rounded-lg bg-[#DFFF00]/25 px-2.5 py-1.5 text-xs font-bold"
                            >
                              {
                                WEEK_DAYS.find(
                                  (item) =>
                                    item.key ===
                                    day.day
                                )?.short
                              }
                            </span>
                          ))}
                      </div>
                    </div>

                    {schedule.employeeIds.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#68705D]">
                          Assigned Employees
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {schedule.employeeIds
                            .slice(0, 5)
                            .map((employeeId) => (
                              <span
                                key={employeeId}
                                className="rounded-lg border border-black/[0.06] bg-white/70 px-2.5 py-1.5 text-xs font-medium"
                              >
                                {getEmployeeName(
                                  employeeId,
                                  employees
                                )}
                              </span>
                            ))}

                          {schedule.employeeIds.length >
                            5 && (
                            <span className="rounded-lg bg-black/[0.04] px-2.5 py-1.5 text-xs font-bold text-[#68705D]">
                              +
                              {schedule.employeeIds.length -
                                5}{" "}
                              more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-5 flex gap-2 border-t border-black/[0.06] pt-4">
                      {canUpdateSchedule && (
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(schedule)
                          }
                          className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-black/[0.07] bg-white/70 text-sm font-bold transition hover:bg-white"
                        >
                          <Edit3 className="h-4 w-4" />
                          Edit
                        </button>
                      )}

                      {canDeleteSchedule && (
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget(schedule)
                          }
                          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200/70 bg-red-50/60 px-4 text-sm font-bold text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </HRGlassCard>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4 backdrop-blur-md">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/70 bg-[#F7F7F2]/95 shadow-[0_30px_100px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4 sm:px-7">
              <div>
                <h2 className="text-lg font-bold text-[#10130B] sm:text-xl">
                  {editingId
                    ? "Edit Working Schedule"
                    : "Create Working Schedule"}
                </h2>

                <p className="mt-1 text-xs text-[#68705D] sm:text-sm">
                  Configure working days, hours and assignments.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/[0.06] bg-white/70 text-[#68705D] transition hover:bg-white hover:text-[#10130B]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6"
            >
              <div className="grid gap-5 md:grid-cols-2">
                {/* Name */}
                <div className="md:col-span-2">
                  <FieldLabel>
                    Schedule Name
                  </FieldLabel>

                  <input
                    required
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="e.g. General Office Shift"
                    className={inputClass}
                  />
                </div>

                {/* Type */}
                <div>
                  <FieldLabel>
                    Schedule Type
                  </FieldLabel>

                  <select
                    value={form.type}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        type: event.target.value as ScheduleType,
                      }))
                    }
                    className={inputClass}
                  >
                    <option value="fixed">Fixed</option>
                    <option value="shift">Shift</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <FieldLabel>Status</FieldLabel>

                  <button
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        isActive: !current.isActive,
                      }))
                    }
                    className={`flex h-11 w-full items-center justify-between rounded-xl border px-4 text-sm font-bold transition ${
                      form.isActive
                        ? "border-[#DFFF00]/50 bg-[#DFFF00]/20"
                        : "border-black/[0.06] bg-white/70"
                    }`}
                  >
                    <span>
                      {form.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>

                    <span
                      className={`h-5 w-9 rounded-full p-0.5 transition ${
                        form.isActive
                          ? "bg-[#10130B]"
                          : "bg-[#BFC4B8]"
                      }`}
                    >
                      <span
                        className={`block h-4 w-4 rounded-full bg-white transition ${
                          form.isActive
                            ? "translate-x-4"
                            : "translate-x-0"
                        }`}
                      />
                    </span>
                  </button>
                </div>
              </div>

              {/* Days */}
              <div className="mt-7">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div>
                    <h3 className="text-sm font-bold text-[#10130B]">
                      Weekly Working Hours
                    </h3>
                    <p className="mt-1 text-xs text-[#68705D]">
                      Enable days and define start, end and break time.
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#10130B] px-4 py-2 text-sm font-bold text-[#DFFF00]">
                    {formatHours(formWeeklyHours)} / week
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {form.days.map((day, index) => (
                    <div
                      key={day.day}
                      className={`rounded-2xl border p-3 transition sm:p-4 ${
                        day.enabled
                          ? "border-[#DFFF00]/30 bg-white/70"
                          : "border-black/[0.05] bg-white/40"
                      }`}
                    >
                      <div className="grid gap-3 sm:grid-cols-[150px_1fr_1fr_120px] sm:items-center">
                        <button
                          type="button"
                          onClick={() =>
                            updateDay(index, {
                              enabled: !day.enabled,
                            })
                          }
                          className="flex items-center gap-3 text-left"
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                              day.enabled
                                ? "bg-[#DFFF00] text-[#10130B]"
                                : "bg-black/[0.05] text-[#68705D]"
                            }`}
                          >
                            {WEEK_DAYS[index].short}
                          </span>

                          <span className="text-sm font-bold">
                            {WEEK_DAYS[index].label}
                          </span>
                        </button>

                        <div>
                          <label className={smallLabel}>
                            Start
                          </label>

                          <input
                            type="time"
                            disabled={!day.enabled}
                            value={day.startTime}
                            onChange={(event) =>
                              updateDay(index, {
                                startTime:
                                  event.target.value,
                              })
                            }
                            className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-40`}
                          />
                        </div>

                        <div>
                          <label className={smallLabel}>
                            End
                          </label>

                          <input
                            type="time"
                            disabled={!day.enabled}
                            value={day.endTime}
                            onChange={(event) =>
                              updateDay(index, {
                                endTime:
                                  event.target.value,
                              })
                            }
                            className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-40`}
                          />
                        </div>

                        <div>
                          <label className={smallLabel}>
                            Break (min)
                          </label>

                          <input
                            type="number"
                            min={0}
                            disabled={!day.enabled}
                            value={day.breakMinutes}
                            onChange={(event) =>
                              updateDay(index, {
                                breakMinutes:
                                  Number(
                                    event.target.value
                                  ) || 0,
                              })
                            }
                            className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-40`}
                          />
                        </div>
                      </div>

                      {day.enabled && (
                        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#68705D]">
                          <Clock3 className="h-3.5 w-3.5" />

                          {formatHours(
                            calculateDayHours(day)
                          )}{" "}
                          working hours
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Employees */}
              <div className="mt-7">
                <div>
                  <h3 className="text-sm font-bold text-[#10130B]">
                    Assign Employees
                  </h3>

                  <p className="mt-1 text-xs text-[#68705D]">
                    Select employees who should follow this schedule.
                  </p>
                </div>

                <div className="mt-3 max-h-52 overflow-y-auto rounded-2xl border border-black/[0.06] bg-white/50 p-2">
                  {employees.length === 0 ? (
                    <p className="px-3 py-5 text-center text-sm text-[#68705D]">
                      No employees available.
                    </p>
                  ) : (
                    employees.map((employee) => {
                      const selected =
                        form.employeeIds.includes(
                          employee.id
                        );

                      return (
                        <button
                          key={employee.id}
                          type="button"
                          onClick={() =>
                            toggleEmployee(
                              employee.id
                            )
                          }
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${
                            selected
                              ? "bg-[#DFFF00]/25"
                              : "hover:bg-white/80"
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold">
                              {employee.name}
                            </p>
                            <p className="truncate text-xs text-[#68705D]">
                              {employee.email}
                            </p>
                          </div>

                          <span
                            className={`ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${
                              selected
                                ? "border-[#10130B] bg-[#10130B] text-[#DFFF00]"
                                : "border-black/[0.10] bg-white"
                            }`}
                          >
                            {selected && (
                              <Check className="h-3.5 w-3.5" />
                            )}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>

                <p className="mt-2 text-xs font-medium text-[#68705D]">
                  {form.employeeIds.length} employee
                  {form.employeeIds.length !== 1
                    ? "s"
                    : ""}{" "}
                  selected
                </p>
              </div>

              {/* Contracts */}
              <div className="mt-7">
                <div>
                  <h3 className="text-sm font-bold text-[#10130B]">
                    Assign Contracts
                  </h3>

                  <p className="mt-1 text-xs text-[#68705D]">
                    Optionally associate contracts with this schedule.
                  </p>
                </div>

                <div className="mt-3 max-h-52 overflow-y-auto rounded-2xl border border-black/[0.06] bg-white/50 p-2">
                  {contracts.length === 0 ? (
                    <p className="px-3 py-5 text-center text-sm text-[#68705D]">
                      No contracts available.
                    </p>
                  ) : (
                    contracts.map((contract) => {
                      const selected =
                        form.contractIds.includes(
                          contract.id
                        );

                      return (
                        <button
                          key={contract.id}
                          type="button"
                          onClick={() =>
                            toggleContract(
                              contract.id
                            )
                          }
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${
                            selected
                              ? "bg-[#DFFF00]/25"
                              : "hover:bg-white/80"
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold">
                              {contract.jobTitle}
                            </p>

                            <p className="truncate text-xs text-[#68705D]">
                              {contract.id} ·{" "}
                              {getEmployeeName(
                                contract.employeeId,
                                employees
                              )}
                            </p>
                          </div>

                          <span
                            className={`ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${
                              selected
                                ? "border-[#10130B] bg-[#10130B] text-[#DFFF00]"
                                : "border-black/[0.10] bg-white"
                            }`}
                          >
                            {selected && (
                              <Check className="h-3.5 w-3.5" />
                            )}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>

                <p className="mt-2 text-xs font-medium text-[#68705D]">
                  {form.contractIds.length} contract
                  {form.contractIds.length !== 1
                    ? "s"
                    : ""}{" "}
                  selected
                </p>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-black/[0.06] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="h-11 rounded-xl border border-black/[0.07] bg-white/70 px-5 text-sm font-bold text-[#10130B] transition hover:bg-white disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    !form.name.trim()
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#DFFF00] px-6 text-sm font-bold text-[#10130B] shadow-[0_8px_30px_rgba(223,255,0,0.25)] transition hover:bg-[#F4FF3F] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {editingId
                    ? "Save Changes"
                    : "Create Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/30 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-white/70 bg-[#F7F7F2]/95 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.2)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Trash2 className="h-5 w-5" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#10130B]">
              Delete schedule?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#68705D]">
              This will permanently delete{" "}
              <span className="font-bold text-[#10130B]">
                {deleteTarget.name}
              </span>
              . This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="h-11 rounded-xl border border-black/[0.07] bg-white/70 px-5 text-sm font-bold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="h-11 rounded-xl bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-700"
              >
                Delete Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Components ---------------- */

const inputClass =
  "h-11 w-full rounded-xl border border-black/[0.06] bg-white/70 px-3 text-sm font-medium text-[#10130B] outline-none transition focus:border-[#DFFF00] focus:ring-4 focus:ring-[#DFFF00]/15";

const smallLabel =
  "mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#68705D]";

function FieldLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#68705D]">
      {children}
    </label>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarClock;
  label: string;
  value: string | number;
}) {
  return (
    <HRGlassCard className="p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DFFF00]/30 text-[#10130B]">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-[#68705D]">
            {label}
          </p>

          <p className="mt-1 text-xl font-black tracking-tight text-[#10130B] sm:text-2xl">
            {value}
          </p>
        </div>
      </div>
    </HRGlassCard>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-black/[0.05] bg-white/50 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#68705D]">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-[#10130B]">
        {value}
      </p>
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  danger = false,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
        danger
          ? "border-red-200/70 bg-red-50/60 text-red-600 hover:bg-red-100"
          : "border-black/[0.06] bg-white/70 text-[#68705D] hover:bg-[#DFFF00]/25 hover:text-[#10130B]"
      }`}
    >
      {children}
    </button>
  );
}