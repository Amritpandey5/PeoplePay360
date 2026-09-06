"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Edit3,
  Search,
  Trash2,
  UserCheck,
  UserX,
  Users,
  X,
  AlertCircle,
} from "lucide-react";

import type { Employee } from "@/types/employee";
import type {
  AttendanceRecord,
  AttendanceStatus,
} from "@/types/attendance";

import {
  getEmployees,
  subscribeToDataChanges,
} from "@/lib/employee-storage";

import {
  getAttendanceByDate,
  upsertAttendance,
  deleteAttendance,
  subscribeToAttendanceChanges,
} from "@/lib/attendance-storage";

import type { HRRole } from "@/lib/hr-permissions";

import {
  canCreate,
  canUpdate,
  canDelete,
} from "@/lib/hr-permissions";

import HRPageHeader from "@/components/hr/HRPageHeader";

/* =========================================================
   TYPES
========================================================= */

type AttendanceForm = {
  status: AttendanceStatus;
  checkIn: string;
  checkOut: string;
  notes: string;
};

/* =========================================================
   CONSTANTS
========================================================= */

const STATUS_OPTIONS: {
  value: AttendanceStatus;
  label: string;
}[] = [
  {
    value: "present",
    label: "Present",
  },
  {
    value: "absent",
    label: "Absent",
  },
  {
    value: "late",
    label: "Late",
  },
  {
    value: "half_day",
    label: "Half Day",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function getTodayString() {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(date: string) {
  if (!date) return "";

  const parsed = new Date(
    `${date}T00:00:00`
  );

  return parsed.toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

function getStatusLabel(
  status?: AttendanceStatus
) {
  if (!status) {
    return "Not Marked";
  }

  return (
    STATUS_OPTIONS.find(
      (item) =>
        item.value === status
    )?.label || status
  );
}

function getStatusClasses(
  status?: AttendanceStatus
) {
  switch (status) {
    case "present":
      return "bg-[#DFFF00]/45 text-[#354000] border-[#B7FF00]/50";

    case "absent":
      return "bg-red-50 text-red-600 border-red-100";

    case "late":
      return "bg-orange-50 text-orange-600 border-orange-100";

    case "half_day":
      return "bg-yellow-50 text-yellow-700 border-yellow-100";

    default:
      return "bg-black/[0.035] text-[#68705D] border-black/[0.06]";
  }
}

/* =========================================================
   PAGE
========================================================= */

export default function AttendancePage() {
  /*
   * Temporary role.
   * Authentication/session will replace this later.
   */
  const role: HRRole =
    "HR_MANAGER";

  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [attendance, setAttendance] =
    useState<AttendanceRecord[]>([]);

  const [selectedDate, setSelectedDate] =
    useState(getTodayString());

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<
      AttendanceStatus | "all" | "unmarked"
    >("all");

  const [loading, setLoading] =
    useState(true);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  const [editingRecord, setEditingRecord] =
    useState<AttendanceRecord | null>(
      null
    );

  const [deleteTarget, setDeleteTarget] =
    useState<AttendanceRecord | null>(
      null
    );

  const [form, setForm] =
    useState<AttendanceForm>({
      status: "present",
      checkIn: "",
      checkOut: "",
      notes: "",
    });

  /* =======================================================
     LOAD DATA
  ======================================================= */

  function loadData() {
    setEmployees(getEmployees());

    setAttendance(
      getAttendanceByDate(
        selectedDate
      )
    );

    setLoading(false);
  }

  useEffect(() => {
    loadData();

    const unsubscribeEmployees =
      subscribeToDataChanges(
        loadData
      );

    const unsubscribeAttendance =
      subscribeToAttendanceChanges(
        loadData
      );

    return () => {
      unsubscribeEmployees();
      unsubscribeAttendance();
    };
  }, [selectedDate]);

  /* =======================================================
     CURRENT DATE ATTENDANCE MAP
  ======================================================= */

  const attendanceMap = useMemo(() => {
    const map = new Map<
      string,
      AttendanceRecord
    >();

    attendance.forEach((record) => {
      map.set(
        record.employeeId,
        record
      );
    });

    return map;
  }, [attendance]);

  /* =======================================================
     FILTER EMPLOYEES
  ======================================================= */

  const filteredEmployees =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return employees.filter(
        (employee) => {
          const record =
            attendanceMap.get(
              employee.id
            );

          const matchesSearch =
            !query ||
            employee.name
              .toLowerCase()
              .includes(query) ||
            employee.email
              .toLowerCase()
              .includes(query) ||
            employee.role
              .toLowerCase()
              .includes(query) ||
            employee.id
              .toLowerCase()
              .includes(query);

          const matchesStatus =
            statusFilter === "all"
              ? true
              : statusFilter ===
                "unmarked"
              ? !record
              : record?.status ===
                statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      employees,
      attendanceMap,
      search,
      statusFilter,
    ]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    const present =
      attendance.filter(
        (record) =>
          record.status ===
          "present"
      ).length;

    const absent =
      attendance.filter(
        (record) =>
          record.status ===
          "absent"
      ).length;

    const late =
      attendance.filter(
        (record) =>
          record.status ===
          "late"
      ).length;

    const halfDay =
      attendance.filter(
        (record) =>
          record.status ===
          "half_day"
      ).length;

    return {
      totalEmployees:
        employees.length,

      marked:
        attendance.length,

      unmarked:
        Math.max(
          employees.length -
            attendance.length,
          0
        ),

      present,

      absent,

      late,

      halfDay,
    };
  }, [
    employees,
    attendance,
  ]);

  /* =======================================================
     DATE NAVIGATION
  ======================================================= */

  function changeDate(
    direction: number
  ) {
    const current =
      new Date(
        `${selectedDate}T00:00:00`
      );

    current.setDate(
      current.getDate() +
        direction
    );

    const year =
      current.getFullYear();

    const month =
      String(
        current.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        current.getDate()
      ).padStart(2, "0");

    setSelectedDate(
      `${year}-${month}-${day}`
    );
  }

  /* =======================================================
     OPEN MARK MODAL
  ======================================================= */

  function openMarkModal(
    employee: Employee
  ) {
    const existing =
      attendanceMap.get(
        employee.id
      );

    setSelectedEmployee(
      employee
    );

    setEditingRecord(
      existing || null
    );

    setForm({
      status:
        existing?.status ||
        "present",

      checkIn:
        existing?.checkIn ||
        "",

      checkOut:
        existing?.checkOut ||
        "",

      notes:
        existing?.notes ||
        "",
    });

    setModalOpen(true);
  }

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  function closeModal() {
    setModalOpen(false);

    setSelectedEmployee(
      null
    );

    setEditingRecord(null);

    setForm({
      status: "present",
      checkIn: "",
      checkOut: "",
      notes: "",
    });
  }

  /* =======================================================
     SAVE ATTENDANCE
  ======================================================= */

  function handleSave() {
    if (!selectedEmployee) {
      return;
    }

    if (
      editingRecord &&
      !canUpdate(
        role,
        "attendance"
      )
    ) {
      return;
    }

    if (
      !editingRecord &&
      !canCreate(
        role,
        "attendance"
      )
    ) {
      return;
    }

    upsertAttendance({
      employeeId:
        selectedEmployee.id,

      date: selectedDate,

      status: form.status,

      checkIn:
        form.checkIn ||
        "",

      checkOut:
        form.checkOut ||
        "",

      notes:
        form.notes.trim() ||
        undefined,
    });

    closeModal();
  }

  /* =======================================================
     DELETE ATTENDANCE
  ======================================================= */

  function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    if (
      !canDelete(
        role,
        "attendance"
      )
    ) {
      return;
    }

    deleteAttendance(
      deleteTarget.id
    );

    setDeleteTarget(null);
  }

  /* =======================================================
     TODAY
  ======================================================= */

  function goToToday() {
    setSelectedDate(
      getTodayString()
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="h-8 w-48 animate-pulse rounded-xl bg-black/[0.06]" />

          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-3xl bg-white/60"
              />
            ))}
          </div>

          <div className="mt-6 h-[500px] animate-pulse rounded-3xl bg-white/60" />
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <div className="min-h-screen px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
        <div className="mx-auto max-w-[1600px]">
          {/* =================================================
              HEADER
          ================================================= */}

          <HRPageHeader
            title="Attendance"
            description="Track and manage daily employee attendance."
          />

          {/* =================================================
              DATE CONTROL
          ================================================= */}

          <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div
              className="
                flex items-center gap-2
                rounded-2xl
                border border-black/[0.06]
                bg-white/65
                p-1.5
                shadow-[0_10px_35px_rgba(20,25,10,0.04)]
                backdrop-blur-xl
              "
            >
              <button
                type="button"
                onClick={() =>
                  changeDate(-1)
                }
                className="
                  flex h-9 w-9 items-center
                  justify-center rounded-xl
                  text-[#68705D]
                  transition
                  hover:bg-[#DFFF00]
                  hover:text-[#10130B]
                "
              >
                <ChevronLeft
                  size={17}
                />
              </button>

              <div className="flex min-w-0 items-center gap-2 px-2">
                <CalendarDays
                  size={17}
                  className="shrink-0 text-[#68705D]"
                />

                <input
                  type="date"
                  value={
                    selectedDate
                  }
                  onChange={(event) =>
                    setSelectedDate(
                      event.target.value
                    )
                  }
                  className="
                    min-w-0
                    bg-transparent
                    text-sm font-bold
                    text-[#10130B]
                    outline-none
                  "
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  changeDate(1)
                }
                className="
                  flex h-9 w-9 items-center
                  justify-center rounded-xl
                  text-[#68705D]
                  transition
                  hover:bg-[#DFFF00]
                  hover:text-[#10130B]
                "
              >
                <ChevronRight
                  size={17}
                />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <p className="hidden text-sm font-medium text-[#68705D] sm:block">
                {formatDate(
                  selectedDate
                )}
              </p>

              {selectedDate !==
                getTodayString() && (
                <button
                  type="button"
                  onClick={
                    goToToday
                  }
                  className="
                    rounded-xl
                    border border-black/[0.06]
                    bg-white/70
                    px-3 py-2
                    text-xs font-bold
                    text-[#10130B]
                    transition
                    hover:bg-[#DFFF00]
                  "
                >
                  Today
                </button>
              )}
            </div>
          </div>

          {/* =================================================
              STATS
          ================================================= */}

          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
            <StatCard
              icon={
                <Users size={18} />
              }
              label="Employees"
              value={
                stats.totalEmployees
              }
            />

            <StatCard
              icon={
                <UserCheck
                  size={18}
                />
              }
              label="Present"
              value={
                stats.present
              }
              accent
            />

            <StatCard
              icon={
                <UserX size={18} />
              }
              label="Absent"
              value={
                stats.absent
              }
            />

            <StatCard
              icon={
                <Clock3 size={18} />
              }
              label="Late"
              value={
                stats.late
              }
            />

            <StatCard
              icon={
                <AlertCircle
                  size={18}
                />
              }
              label="Unmarked"
              value={
                stats.unmarked
              }
            />
          </div>

          {/* =================================================
              MAIN CARD
          ================================================= */}

          <section
            className="
              mt-6 overflow-hidden
              rounded-[28px]
              border border-black/[0.06]
              bg-white/65
              shadow-[0_20px_60px_rgba(20,25,10,0.06)]
              backdrop-blur-2xl
            "
          >
            {/* Toolbar */}

            <div className="border-b border-black/[0.06] p-4 sm:p-5">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                {/* Search */}

                <div
                  className="
                    flex h-11
                    w-full
                    items-center gap-2
                    rounded-2xl
                    border border-black/[0.06]
                    bg-white/70
                    px-3
                    xl:max-w-md
                  "
                >
                  <Search
                    size={17}
                    className="shrink-0 text-[#68705D]"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search employee..."
                    className="
                      min-w-0 flex-1
                      bg-transparent
                      text-sm
                      text-[#10130B]
                      outline-none
                      placeholder:text-[#9A9F94]
                    "
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearch("")
                      }
                      className="text-[#68705D]"
                    >
                      <X
                        size={15}
                      />
                    </button>
                  )}
                </div>

                {/* Filters */}

                <div className="flex gap-2 overflow-x-auto pb-1">
                  {[
                    {
                      value:
                        "all" as const,
                      label: "All",
                    },
                    {
                      value:
                        "present" as const,
                      label: "Present",
                    },
                    {
                      value:
                        "absent" as const,
                      label: "Absent",
                    },
                    {
                      value:
                        "late" as const,
                      label: "Late",
                    },
                    {
                      value:
                        "half_day" as const,
                      label: "Half Day",
                    },
                    {
                      value:
                        "unmarked" as const,
                      label: "Unmarked",
                    },
                  ].map(
                    (filter) => (
                      <button
                        key={
                          filter.value
                        }
                        type="button"
                        onClick={() =>
                          setStatusFilter(
                            filter.value
                          )
                        }
                        className={`
                          shrink-0
                          rounded-xl
                          px-3 py-2
                          text-xs font-bold
                          transition
                          ${
                            statusFilter ===
                            filter.value
                              ? "bg-[#DFFF00] text-[#10130B] shadow-[0_6px_20px_rgba(223,255,0,0.2)]"
                              : "bg-black/[0.035] text-[#68705D] hover:bg-black/[0.06]"
                          }
                        `}
                      >
                        {
                          filter.label
                        }
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* =================================================
                NO EMPLOYEES
            ================================================= */}

            {employees.length ===
              0 && (
              <div className="px-6 py-20 text-center">
                <div
                  className="
                    mx-auto flex h-14 w-14
                    items-center justify-center
                    rounded-2xl
                    bg-[#DFFF00]/40
                  "
                >
                  <Users
                    size={24}
                  />
                </div>

                <h3 className="mt-4 text-base font-black">
                  No employees found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-[#68705D]">
                  Add employees first before
                  managing attendance.
                </p>
              </div>
            )}

            {/* =================================================
                NO FILTER RESULTS
            ================================================= */}

            {employees.length >
              0 &&
              filteredEmployees.length ===
                0 && (
                <div className="px-6 py-20 text-center">
                  <div
                    className="
                      mx-auto flex h-14 w-14
                      items-center justify-center
                      rounded-2xl
                      bg-black/[0.04]
                    "
                  >
                    <Search
                      size={23}
                      className="text-[#68705D]"
                    />
                  </div>

                  <h3 className="mt-4 text-base font-black">
                    No employees match
                  </h3>

                  <p className="mt-2 text-sm text-[#68705D]">
                    Try another search or filter.
                  </p>
                </div>
              )}

            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            {filteredEmployees.length >
              0 && (
              <>
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="border-b border-black/[0.06] text-left">
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#8B9182]">
                          Employee
                        </th>

                        <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#8B9182]">
                          Status
                        </th>

                        <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#8B9182]">
                          Check In
                        </th>

                        <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#8B9182]">
                          Check Out
                        </th>

                        <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#8B9182]">
                          Notes
                        </th>

                        <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.16em] text-[#8B9182]">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredEmployees.map(
                        (employee) => {
                          const record =
                            attendanceMap.get(
                              employee.id
                            );

                          return (
                            <tr
                              key={
                                employee.id
                              }
                              className="
                                border-b
                                border-black/[0.045]
                                transition
                                hover:bg-white/60
                              "
                            >
                              {/* Employee */}

                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <Avatar
                                    name={
                                      employee.name
                                    }
                                  />

                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-[#10130B]">
                                      {
                                        employee.name
                                      }
                                    </p>

                                    <p className="truncate text-[11px] text-[#8B9182]">
                                      {
                                        employee.id
                                      }{" "}
                                      ·{" "}
                                      {
                                        employee.role
                                      }
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Status */}

                              <td className="px-4 py-4">
                                <span
                                  className={`
                                    inline-flex
                                    rounded-full
                                    border
                                    px-2.5 py-1
                                    text-[10px]
                                    font-black
                                    ${getStatusClasses(
                                      record?.status
                                    )}
                                  `}
                                >
                                  {getStatusLabel(
                                    record?.status
                                  )}
                                </span>
                              </td>

                              {/* Check In */}

                              <td className="px-4 py-4 text-sm font-medium text-[#68705D]">
                                {record?.checkIn ||
                                  "—"}
                              </td>

                              {/* Check Out */}

                              <td className="px-4 py-4 text-sm font-medium text-[#68705D]">
                                {record?.checkOut ||
                                  "—"}
                              </td>

                              {/* Notes */}

                              <td className="max-w-[180px] px-4 py-4">
                                <p className="truncate text-xs text-[#68705D]">
                                  {record?.notes ||
                                    "—"}
                                </p>
                              </td>

                              {/* Action */}

                              <td className="px-6 py-4">
                                <div className="flex justify-end gap-2">
                                  {canCreate(
                                    role,
                                    "attendance"
                                  ) ||
                                  canUpdate(
                                    role,
                                    "attendance"
                                  ) ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        openMarkModal(
                                          employee
                                        )
                                      }
                                      className="
                                        flex h-9
                                        items-center
                                        gap-1.5
                                        rounded-xl
                                        bg-[#DFFF00]
                                        px-3
                                        text-xs
                                        font-black
                                        text-[#10130B]
                                        transition
                                        hover:scale-[1.02]
                                      "
                                    >
                                      {record ? (
                                        <Edit3
                                          size={
                                            14
                                          }
                                        />
                                      ) : (
                                        <Check
                                          size={
                                            14
                                          }
                                        />
                                      )}

                                      {record
                                        ? "Edit"
                                        : "Mark"}
                                    </button>
                                  ) : null}

                                  {record &&
                                    canDelete(
                                      role,
                                      "attendance"
                                    ) && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setDeleteTarget(
                                            record
                                          )
                                        }
                                        className="
                                          flex h-9 w-9
                                          items-center
                                          justify-center
                                          rounded-xl
                                          bg-red-50
                                          text-red-500
                                          transition
                                          hover:bg-red-100
                                        "
                                      >
                                        <Trash2
                                          size={
                                            14
                                          }
                                        />
                                      </button>
                                    )}
                                </div>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>

                {/* =================================================
                    MOBILE CARDS
                ================================================= */}

                <div className="space-y-3 p-4 lg:hidden">
                  {filteredEmployees.map(
                    (employee) => {
                      const record =
                        attendanceMap.get(
                          employee.id
                        );

                      return (
                        <div
                          key={
                            employee.id
                          }
                          className="
                            rounded-2xl
                            border
                            border-black/[0.06]
                            bg-white/65
                            p-4
                          "
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <Avatar
                                name={
                                  employee.name
                                }
                              />

                              <div className="min-w-0">
                                <p className="truncate text-sm font-black">
                                  {
                                    employee.name
                                  }
                                </p>

                                <p className="truncate text-[10px] text-[#8B9182]">
                                  {
                                    employee.id
                                  }{" "}
                                  ·{" "}
                                  {
                                    employee.role
                                  }
                                </p>
                              </div>
                            </div>

                            <span
                              className={`
                                shrink-0
                                rounded-full
                                border
                                px-2.5 py-1
                                text-[9px]
                                font-black
                                ${getStatusClasses(
                                  record?.status
                                )}
                              `}
                            >
                              {getStatusLabel(
                                record?.status
                              )}
                            </span>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <MiniInfo
                              label="Check In"
                              value={
                                record?.checkIn ||
                                "—"
                              }
                            />

                            <MiniInfo
                              label="Check Out"
                              value={
                                record?.checkOut ||
                                "—"
                              }
                            />
                          </div>

                          {record?.notes && (
                            <div className="mt-2 rounded-xl bg-black/[0.025] p-3">
                              <p className="text-[9px] font-black uppercase tracking-wider text-[#8B9182]">
                                Notes
                              </p>

                              <p className="mt-1 text-xs text-[#68705D]">
                                {
                                  record.notes
                                }
                              </p>
                            </div>
                          )}

                          <div className="mt-3 flex gap-2">
                            {(canCreate(
                              role,
                              "attendance"
                            ) ||
                              canUpdate(
                                role,
                                "attendance"
                              )) && (
                              <button
                                type="button"
                                onClick={() =>
                                  openMarkModal(
                                    employee
                                  )
                                }
                                className="
                                  flex h-10
                                  flex-1
                                  items-center
                                  justify-center
                                  gap-2
                                  rounded-xl
                                  bg-[#DFFF00]
                                  text-xs
                                  font-black
                                "
                              >
                                {record ? (
                                  <Edit3
                                    size={14}
                                  />
                                ) : (
                                  <Check
                                    size={14}
                                  />
                                )}

                                {record
                                  ? "Edit Attendance"
                                  : "Mark Attendance"}
                              </button>
                            )}

                            {record &&
                              canDelete(
                                role,
                                "attendance"
                              ) && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteTarget(
                                      record
                                    )
                                  }
                                  className="
                                    flex h-10 w-10
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-red-50
                                    text-red-500
                                  "
                                >
                                  <Trash2
                                    size={
                                      15
                                    }
                                  />
                                </button>
                              )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      {/* =======================================================
          ATTENDANCE MODAL
      ======================================================= */}

      {modalOpen &&
        selectedEmployee && (
          <div
            className="
              fixed inset-0 z-[100]
              flex items-center justify-center
              bg-[#10130B]/25
              p-4
              backdrop-blur-md
            "
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeModal();
              }
            }}
          >
            <div
              className="
                w-full max-w-lg
                overflow-hidden
                rounded-[28px]
                border border-black/[0.06]
                bg-[#F7F7F2]/95
                shadow-[0_30px_100px_rgba(20,25,10,0.18)]
                backdrop-blur-2xl
              "
            >
              {/* Modal header */}

              <div className="flex items-start justify-between border-b border-black/[0.06] p-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8B9182]">
                    {editingRecord
                      ? "Edit Attendance"
                      : "Mark Attendance"}
                  </p>

                  <h2 className="mt-1 text-lg font-black">
                    {
                      selectedEmployee.name
                    }
                  </h2>

                  <p className="mt-1 text-xs text-[#68705D]">
                    {formatDate(
                      selectedDate
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  className="
                    flex h-9 w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-black/[0.04]
                    text-[#68705D]
                    transition
                    hover:bg-black/[0.08]
                  "
                >
                  <X
                    size={17}
                  />
                </button>
              </div>

              {/* Form */}

              <div className="space-y-5 p-5">
                {/* Status */}

                <div>
                  <label className="mb-2 block text-xs font-black text-[#10130B]">
                    Attendance Status
                  </label>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {STATUS_OPTIONS.map(
                      (option) => (
                        <button
                          key={
                            option.value
                          }
                          type="button"
                          onClick={() =>
                            setForm(
                              (
                                previous
                              ) => ({
                                ...previous,
                                status:
                                  option.value,
                              })
                            )
                          }
                          className={`
                            rounded-xl
                            border
                            px-2 py-3
                            text-[11px]
                            font-black
                            transition
                            ${
                              form.status ===
                              option.value
                                ? "border-[#B7FF00] bg-[#DFFF00]/55 text-[#10130B]"
                                : "border-black/[0.06] bg-white/70 text-[#68705D] hover:bg-white"
                            }
                          `}
                        >
                          {
                            option.label
                          }
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Time */}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-2 block text-xs font-black">
                      Check In
                    </label>

                    <input
                      type="time"
                      value={
                        form.checkIn
                      }
                      onChange={(event) =>
                        setForm(
                          (
                            previous
                          ) => ({
                            ...previous,
                            checkIn:
                              event.target
                                .value,
                          })
                        )
                      }
                      className="
                        h-11 w-full
                        rounded-xl
                        border
                        border-black/[0.06]
                        bg-white/75
                        px-3
                        text-sm
                        outline-none
                        focus:border-[#B7FF00]
                      "
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-black">
                      Check Out
                    </label>

                    <input
                      type="time"
                      value={
                        form.checkOut
                      }
                      onChange={(event) =>
                        setForm(
                          (
                            previous
                          ) => ({
                            ...previous,
                            checkOut:
                              event.target
                                .value,
                          })
                        )
                      }
                      className="
                        h-11 w-full
                        rounded-xl
                        border
                        border-black/[0.06]
                        bg-white/75
                        px-3
                        text-sm
                        outline-none
                        focus:border-[#B7FF00]
                      "
                    />
                  </div>
                </div>

                {/* Notes */}

                <div>
                  <label className="mb-2 block text-xs font-black">
                    Notes
                  </label>

                  <textarea
                    value={
                      form.notes
                    }
                    onChange={(event) =>
                      setForm(
                        (
                          previous
                        ) => ({
                          ...previous,
                          notes:
                            event.target
                              .value,
                        })
                      )
                    }
                    rows={3}
                    placeholder="Optional attendance note..."
                    className="
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-black/[0.06]
                      bg-white/75
                      p-3
                      text-sm
                      outline-none
                      placeholder:text-[#A0A59B]
                      focus:border-[#B7FF00]
                    "
                  />
                </div>

                {/* Actions */}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={
                      closeModal
                    }
                    className="
                      h-11 flex-1
                      rounded-xl
                      bg-black/[0.05]
                      text-xs
                      font-black
                      text-[#68705D]
                      transition
                      hover:bg-black/[0.08]
                    "
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleSave
                    }
                    className="
                      h-11 flex-1
                      rounded-xl
                      bg-[#DFFF00]
                      text-xs
                      font-black
                      text-[#10130B]
                      shadow-[0_8px_25px_rgba(223,255,0,0.25)]
                      transition
                      hover:scale-[1.01]
                    "
                  >
                    {editingRecord
                      ? "Update Attendance"
                      : "Save Attendance"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* =======================================================
          DELETE MODAL
      ======================================================= */}

      {deleteTarget && (
        <div
          className="
            fixed inset-0 z-[110]
            flex items-center justify-center
            bg-[#10130B]/25
            p-4
            backdrop-blur-md
          "
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setDeleteTarget(null);
            }
          }}
        >
          <div
            className="
              w-full max-w-sm
              rounded-[26px]
              border border-black/[0.06]
              bg-[#F7F7F2]/95
              p-6
              shadow-[0_30px_100px_rgba(20,25,10,0.18)]
            "
          >
            <div
              className="
                flex h-12 w-12
                items-center justify-center
                rounded-2xl
                bg-red-50
                text-red-500
              "
            >
              <Trash2
                size={21}
              />
            </div>

            <h3 className="mt-5 text-lg font-black">
              Delete attendance?
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-[#68705D]">
              This will remove the attendance
              record for this employee on{" "}
              {formatDate(
                deleteTarget.date
              )}
              .
            </p>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(
                    null
                  )
                }
                className="
                  h-11 flex-1
                  rounded-xl
                  bg-black/[0.05]
                  text-xs
                  font-black
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleDelete
                }
                className="
                  h-11 flex-1
                  rounded-xl
                  bg-red-500
                  text-xs
                  font-black
                  text-white
                "
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className="
        rounded-3xl
        border border-black/[0.06]
        bg-white/65
        p-4
        shadow-[0_10px_35px_rgba(20,25,10,0.04)]
        backdrop-blur-xl
      "
    >
      <div className="flex items-center justify-between">
        <div
          className={`
            flex h-9 w-9
            items-center justify-center
            rounded-xl
            ${
              accent
                ? "bg-[#DFFF00]"
                : "bg-black/[0.04]"
            }
          `}
        >
          {icon}
        </div>

        <span className="text-2xl font-black tracking-tight">
          {value}
        </span>
      </div>

      <p className="mt-3 text-[10px] font-black uppercase tracking-[0.14em] text-[#8B9182]">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   AVATAR
========================================================= */

function Avatar({
  name,
}: {
  name: string;
}) {
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part[0]
      )
      .join("")
      .toUpperCase();

  return (
    <div
      className="
        flex h-10 w-10
        shrink-0
        items-center justify-center
        rounded-xl
        bg-[#DFFF00]/55
        text-xs
        font-black
        text-[#354000]
      "
    >
      {initials || "U"}
    </div>
  );
}

/* =========================================================
   MOBILE INFO
========================================================= */

function MiniInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-black/[0.025] p-3">
      <p className="text-[9px] font-black uppercase tracking-wider text-[#8B9182]">
        {label}
      </p>

      <p className="mt-1 text-xs font-bold text-[#10130B]">
        {value}
      </p>
    </div>
  );
}
