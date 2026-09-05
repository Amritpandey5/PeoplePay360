"use client";

import { useEffect, useMemo, useState } from "react";
import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    Search,
    UserRound,
    Users,
    XCircle,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Mail,
    Timer,
    X,
} from "lucide-react";
import { getEmployees } from "@/lib/employee-storage";
import {
    getAttendanceForDate,
    subscribeToAttendanceChanges,
} from "@/lib/attendance-storage";
import type { Employee } from "@/types/employee";
import type {
    AttendanceRecord,
    AttendanceStatus,
} from "@/types/attendance";

function getToday() {
    return new Date().toISOString().split("T")[0];
}

function formatDate(date: string) {
    if (!date) {
        return "-";
    }

    return new Date(`${date}T00:00:00`).toLocaleDateString(
        "en-IN",
        {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
        }
    );
}

function formatShortDate(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}

function getPreviousDate(date: string) {
    const value = new Date(`${date}T00:00:00`);
    value.setDate(value.getDate() - 1);
    return value.toISOString().split("T")[0];
}

function getNextDate(date: string) {
    const value = new Date(`${date}T00:00:00`);
    value.setDate(value.getDate() + 1);
    return value.toISOString().split("T")[0];
}

function formatWorkingHours(hours: number) {
    if (!hours || hours <= 0) {
        return "-";
    }

    const wholeHours = Math.floor(hours);
    const minutes = Math.round(
        (hours - wholeHours) * 60
    );

    if (minutes === 60) {
        return `${wholeHours + 1}h`;
    }

    if (minutes === 0) {
        return `${wholeHours}h`;
    }

    return `${wholeHours}h ${minutes}m`;
}

function getStatusLabel(status: AttendanceStatus) {
    if (status === "present") {
        return "Present";
    }

    if (status === "late") {
        return "Late";
    }

    if (status === "working") {
        return "Working";
    }

    if (status === "absent") {
        return "Absent";
    }

    return "Not Checked In";
}

function StatusBadge({
    status,
}: {
    status: AttendanceStatus;
}) {
    if (status === "present") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Present
            </span>
        );
    }

    if (status === "working") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                Working
            </span>
        );
    }

    if (status === "late") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Late
            </span>
        );
    }

    if (status === "absent") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Absent
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Not Checked In
        </span>
    );
}

type EmployeeAttendance = {
    employee: Employee;
    attendance?: AttendanceRecord;
    status: AttendanceStatus;
};

export default function AttendancePage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [attendance, setAttendance] = useState<
        AttendanceRecord[]
    >([]);
    const [selectedDate, setSelectedDate] =
        useState(getToday());
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] =
        useState<"all" | AttendanceStatus>("all");
    const [selectedRecord, setSelectedRecord] =
        useState<EmployeeAttendance | null>(null);

    function loadData() {
        const activeEmployees = getEmployees().filter(
            (employee) => employee.status === "active"
        );

        setEmployees(activeEmployees);
        setAttendance(
            getAttendanceForDate(selectedDate)
        );
    }

    useEffect(() => {
        loadData();

        const unsubscribe =
            subscribeToAttendanceChanges(() => {
                loadData();
            });

        return unsubscribe;
    }, [selectedDate]);

    const attendanceMap = useMemo(() => {
        const map = new Map<string, AttendanceRecord>();

        attendance.forEach((record) => {
            map.set(record.employeeId, record);
        });

        return map;
    }, [attendance]);

    const employeeAttendance = useMemo(() => {
        return employees.map((employee) => {
            const record = attendanceMap.get(employee.id);

            let status: AttendanceStatus =
                record?.status || "not_marked";

            if (record?.checkIn && !record?.checkOut) {
                status = record.status === "late"
                    ? "late"
                    : "working";
            }

            return {
                employee,
                attendance: record,
                status,
            };
        });
    }, [employees, attendanceMap]);

    const filteredEmployees = useMemo(() => {
        const searchValue = search.toLowerCase().trim();

        return employeeAttendance.filter(
            ({ employee, status }) => {
                const matchesSearch =
                    !searchValue ||
                    employee.name
                        .toLowerCase()
                        .includes(searchValue) ||
                    employee.email
                        .toLowerCase()
                        .includes(searchValue) ||
                    employee.role
                        .toLowerCase()
                        .includes(searchValue) ||
                    employee.location
                        .toLowerCase()
                        .includes(searchValue);

                const matchesStatus =
                    statusFilter === "all" ||
                    status === statusFilter;

                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );
    }, [
        employeeAttendance,
        search,
        statusFilter,
    ]);

    const totalEmployees = employees.length;

    const presentCount = employeeAttendance.filter(
        ({ status }) => status === "present"
    ).length;

    const workingCount = employeeAttendance.filter(
        ({ status }) => status === "working"
    ).length;

    const lateCount = employeeAttendance.filter(
        ({ status }) => status === "late"
    ).length;

    const absentCount = employeeAttendance.filter(
        ({ status }) => status === "absent"
    ).length;

    const notMarkedCount =
        totalEmployees -
        presentCount -
        workingCount -
        lateCount -
        absentCount;

    function changeDate(date: string) {
        if (date > getToday()) {
            return;
        }

        setSelectedDate(date);
    }

    return (
        <div className="min-h-screen bg-[#f7f9f8]">
            <div className="mx-auto max-w-[1450px] px-6 py-7 lg:px-8">
                <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-emerald-700">
                            Workforce
                        </p>

                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                            Attendance
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Monitor employee check-ins,
                            check-outs and working hours.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
                        <button
                            type="button"
                            onClick={() =>
                                changeDate(
                                    getPreviousDate(
                                        selectedDate
                                    )
                                )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            aria-label="Previous date"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <div className="relative">
                            <CalendarDays
                                size={16}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600"
                            />

                            <input
                                type="date"
                                value={selectedDate}
                                max={getToday()}
                                onChange={(event) =>
                                    changeDate(
                                        event.target.value
                                    )
                                }
                                className="h-9 w-[155px] border-0 bg-transparent pl-9 pr-2 text-sm font-semibold text-slate-700 outline-none"
                            />
                        </div>

                        <button
                            type="button"
                            disabled={
                                selectedDate >=
                                getToday()
                            }
                            onClick={() =>
                                changeDate(
                                    getNextDate(
                                        selectedDate
                                    )
                                )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label="Next date"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500">
                                    Total Employees
                                </p>

                                <p className="mt-2 text-3xl font-bold text-slate-900">
                                    {totalEmployees}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                <Users size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500">
                                    Present
                                </p>

                                <p className="mt-2 text-3xl font-bold text-emerald-700">
                                    {presentCount}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <CheckCircle2 size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500">
                                    Working
                                </p>

                                <p className="mt-2 text-3xl font-bold text-blue-700">
                                    {workingCount}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <Timer size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500">
                                    Late
                                </p>

                                <p className="mt-2 text-3xl font-bold text-amber-600">
                                    {lateCount}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                <Clock3 size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500">
                                    Absent
                                </p>

                                <p className="mt-2 text-3xl font-bold text-red-600">
                                    {absentCount}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                                <XCircle size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                {selectedDate ===
                                getToday()
                                    ? "Today's Attendance"
                                    : `Attendance for ${formatShortDate(
                                          selectedDate
                                      )}`}
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                {formatDate(
                                    selectedDate
                                )}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative">
                                <Search
                                    size={17}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event.target
                                                .value
                                        )
                                    }
                                    placeholder="Search employee..."
                                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 sm:w-64"
                                />
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(
                                        event.target
                                            .value as
                                            | "all"
                                            | AttendanceStatus
                                    )
                                }
                                className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                            >
                                <option value="all">
                                    All Status
                                </option>
                                <option value="present">
                                    Present
                                </option>
                                <option value="working">
                                    Working
                                </option>
                                <option value="late">
                                    Late
                                </option>
                                <option value="absent">
                                    Absent
                                </option>
                                <option value="not_marked">
                                    Not Checked In
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {employees.length === 0 ? (
                        <div className="flex min-h-[430px] flex-col items-center justify-center px-6 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <Users size={28} />
                            </div>

                            <h3 className="mt-5 text-base font-bold text-slate-900">
                                No employees available
                            </h3>

                            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                                Active employees will
                                automatically appear here
                                after they are added.
                            </p>
                        </div>
                    ) : filteredEmployees.length ===
                      0 ? (
                        <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
                            <Search
                                size={30}
                                className="text-slate-300"
                            />

                            <h3 className="mt-4 text-base font-bold text-slate-900">
                                No attendance records
                                found
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Try changing the search,
                                date or status filter.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1100px]">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Employee
                                        </th>

                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Status
                                        </th>

                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Check In
                                        </th>

                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Check Out
                                        </th>

                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Working Hours
                                        </th>

                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Location
                                        </th>

                                        <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Details
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredEmployees.map(
                                        ({
                                            employee,
                                            attendance,
                                            status,
                                        }) => (
                                            <tr
                                                key={
                                                    employee.id
                                                }
                                                className="border-b border-slate-100 transition hover:bg-slate-50/60"
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700">
                                                            {employee.name
                                                                .charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-bold text-slate-900">
                                                                {
                                                                    employee.name
                                                                }
                                                            </p>

                                                            <p className="mt-1 truncate text-xs text-slate-500">
                                                                {
                                                                    employee.email
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <StatusBadge
                                                        status={
                                                            status
                                                        }
                                                    />
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                                        <Clock3
                                                            size={
                                                                15
                                                            }
                                                            className="text-slate-400"
                                                        />

                                                        {attendance
                                                            ?.checkIn ||
                                                            "-"}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                                        <Clock3
                                                            size={
                                                                15
                                                            }
                                                            className="text-slate-400"
                                                        />

                                                        {attendance
                                                            ?.checkOut ||
                                                            "-"}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <span className="text-sm font-semibold text-slate-700">
                                                        {formatWorkingHours(
                                                            attendance?.workingHours ||
                                                                0
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="max-w-[220px] px-6 py-5">
                                                    <div className="flex items-start gap-2 text-sm text-slate-600">
                                                        <MapPin
                                                            size={
                                                                15
                                                            }
                                                            className="mt-0.5 shrink-0 text-slate-400"
                                                        />

                                                        <span className="line-clamp-2">
                                                            {
                                                                employee.location
                                                            }
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedRecord(
                                                                {
                                                                    employee,
                                                                    attendance,
                                                                    status,
                                                                }
                                                            )
                                                        }
                                                        className="rounded-lg px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {selectedRecord && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-5 backdrop-blur-sm"
                    onClick={() =>
                        setSelectedRecord(null)
                    }
                >
                    <div
                        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700">
                                    {selectedRecord.employee.name
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        {
                                            selectedRecord
                                                .employee
                                                .name
                                        }
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        {
                                            selectedRecord
                                                .employee
                                                .id
                                        }
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedRecord(
                                        null
                                    )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-5 p-6">
                            <div className="rounded-xl bg-slate-50 p-4">
                                <p className="text-xs text-slate-500">
                                    Attendance Date
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-900">
                                    {formatDate(
                                        selectedDate
                                    )}
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-slate-100 bg-white p-4">
                                    <p className="text-xs text-slate-500">
                                        Status
                                    </p>

                                    <div className="mt-2">
                                        <StatusBadge
                                            status={
                                                selectedRecord.status
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="rounded-xl border border-slate-100 bg-white p-4">
                                    <p className="text-xs text-slate-500">
                                        Working Hours
                                    </p>

                                    <p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-900">
                                        <Timer
                                            size={16}
                                            className="text-emerald-600"
                                        />

                                        {formatWorkingHours(
                                            selectedRecord
                                                .attendance
                                                ?.workingHours ||
                                                0
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-100 bg-white p-4">
                                    <p className="text-xs text-slate-500">
                                        Check In
                                    </p>

                                    <p className="mt-2 text-sm font-bold text-slate-900">
                                        {selectedRecord
                                            .attendance
                                            ?.checkIn ||
                                            "Not checked in"}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-100 bg-white p-4">
                                    <p className="text-xs text-slate-500">
                                        Check Out
                                    </p>

                                    <p className="mt-2 text-sm font-bold text-slate-900">
                                        {selectedRecord
                                            .attendance
                                            ?.checkOut ||
                                            "Not checked out"}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600">
                                        <UserRound
                                            size={17}
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs text-slate-500">
                                            Employee
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {
                                                selectedRecord
                                                    .employee
                                                    .name
                                            }
                                        </p>

                                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                                            <Mail
                                                size={13}
                                            />

                                            {
                                                selectedRecord
                                                    .employee
                                                    .email
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-start gap-3 border-t border-slate-200 pt-4">
                                    <MapPin
                                        size={16}
                                        className="mt-0.5 shrink-0 text-slate-400"
                                    />

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Employee Location
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-slate-700">
                                            {
                                                selectedRecord
                                                    .employee
                                                    .location
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                                <p className="text-xs leading-5 text-blue-700">
                                    Attendance is recorded
                                    automatically when the
                                    employee checks in and
                                    checks out from their
                                    employee dashboard.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}