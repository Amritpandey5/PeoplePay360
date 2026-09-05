"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    CalendarClock,
    Check,
    Clock3,
    Users,
} from "lucide-react";
import {
    calculateWeeklyHours,
    createWorkingSchedule,
    getWorkingSchedules,
    updateWorkingSchedule,
} from "@/lib/working-schedule-storage";
import { getEmployees } from "@/lib/employee-storage";
import type {
    ScheduleDay,
    ScheduleType,
    WeekDay,
} from "@/types/working-schedule";
import type { Employee } from "@/types/employee";

const weekDays: {
    key: WeekDay;
    label: string;
}[] = [
    {
        key: "monday",
        label: "Monday",
    },
    {
        key: "tuesday",
        label: "Tuesday",
    },
    {
        key: "wednesday",
        label: "Wednesday",
    },
    {
        key: "thursday",
        label: "Thursday",
    },
    {
        key: "friday",
        label: "Friday",
    },
    {
        key: "saturday",
        label: "Saturday",
    },
    {
        key: "sunday",
        label: "Sunday",
    },
];

function getDefaultDays(): ScheduleDay[] {
    return weekDays.map((item) => ({
        day: item.key,
        enabled:
            item.key !== "saturday" &&
            item.key !== "sunday",
        startTime: "09:00",
        endTime: "18:00",
        breakMinutes: 60,
    }));
}

function calculateSingleDayHours(
    day: ScheduleDay
) {
    if (
        !day.enabled ||
        !day.startTime ||
        !day.endTime
    ) {
        return 0;
    }

    const startParts =
        day.startTime.split(":").map(Number);

    const endParts =
        day.endTime.split(":").map(Number);

    const start =
        startParts[0] * 60 +
        startParts[1];

    let end =
        endParts[0] * 60 +
        endParts[1];

    if (end <= start) {
        end += 1440;
    }

    const minutes =
        end -
        start -
        Number(day.breakMinutes || 0);

    if (minutes <= 0) {
        return 0;
    }

    return minutes / 60;
}

function formatHours(hours: number) {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round(
        (hours - wholeHours) * 60
    );

    if (minutes === 0) {
        return `${wholeHours}h`;
    }

    return `${wholeHours}h ${minutes}m`;
}

export default function CreateWorkingSchedulePage() {
    const router = useRouter();

    const [employees, setEmployees] = useState<Employee[]>(
        []
    );

    const [name, setName] = useState("");
    const [type, setType] =
        useState<ScheduleType>("fixed");

    const [days, setDays] = useState<ScheduleDay[]>(
        getDefaultDays()
    );

    const [employeeIds, setEmployeeIds] = useState<string[]>(
        []
    );

    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [editId, setEditId] = useState<string | null>(
        null
    );

    useEffect(() => {
        const loadPage = () => {
            const params =
                new URLSearchParams(
                    window.location.search
                );

            const currentEditId =
                params.get("edit");

            setEditId(currentEditId);

            const activeEmployees =
                getEmployees().filter(
                    (employee) =>
                        employee.status ===
                        "active"
                );

            setEmployees(
                activeEmployees
            );

            if (!currentEditId) {
                return;
            }

            const schedules =
                getWorkingSchedules();

            const schedule =
                schedules.find(
                    (item) =>
                        item.id ===
                        currentEditId
                );

            if (!schedule) {
                return;
            }

            setName(schedule.name);
            setType(schedule.type);
            setDays(schedule.days);
            setEmployeeIds(
                schedule.employeeIds
            );
            setIsActive(
                schedule.isActive
            );
        };

        loadPage();
    }, []);

    const weeklyHours = useMemo(() => {
        return calculateWeeklyHours(days);
    }, [days]);

    function updateDay(
        day: WeekDay,
        changes: Partial<ScheduleDay>
    ) {
        setDays((current) =>
            current.map((item) =>
                item.day === day
                    ? {
                          ...item,
                          ...changes,
                      }
                    : item
            )
        );
    }

    function toggleEmployee(
        employeeId: string
    ) {
        setEmployeeIds((current) => {
            if (
                current.includes(
                    employeeId
                )
            ) {
                return current.filter(
                    (id) =>
                        id !==
                        employeeId
                );
            }

            return [
                ...current,
                employeeId,
            ];
        });
    }

    function selectAllEmployees() {
        if (
            employees.length > 0 &&
            employeeIds.length ===
                employees.length
        ) {
            setEmployeeIds([]);
            return;
        }

        setEmployeeIds(
            employees.map(
                (employee) =>
                    employee.id
            )
        );
    }

    function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (saving) {
            return;
        }

        setError("");

        const trimmedName =
            name.trim();

        if (!trimmedName) {
            setError(
                "Please enter a schedule name."
            );
            return;
        }

        const activeDays =
            days.filter(
                (day) => day.enabled
            );

        if (
            activeDays.length === 0
        ) {
            setError(
                "Please select at least one working day."
            );
            return;
        }

        const invalidDay =
            activeDays.find(
                (day) =>
                    calculateSingleDayHours(
                        day
                    ) <= 0
            );

        if (invalidDay) {
            setError(
                `Invalid working hours for ${invalidDay.day}. Please check start time, end time and break duration.`
            );
            return;
        }

        setSaving(true);

        try {
            const data = {
                name: trimmedName,
                type,
                days,
                employeeIds,
                contractIds: [],
                isActive,
            };

            if (editId) {
                const updated =
                    updateWorkingSchedule(
                        editId,
                        data
                    );

                if (!updated) {
                    setError(
                        "The working schedule could not be found."
                    );
                    setSaving(false);
                    return;
                }
            } else {
                createWorkingSchedule(
                    data
                );
            }

            router.push(
                "/admin/working-schedules"
            );
            router.refresh();
        } catch {
            setError(
                "Unable to save the working schedule. Please try again."
            );
            setSaving(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#f7f9f8] px-6 py-7 lg:px-8">
            <div className="mx-auto max-w-[1200px]">
                <div className="mb-7">
                    <Link
                        href="/admin/working-schedules"
                        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-700"
                    >
                        <ArrowLeft size={16} />
                        Back to Working Schedules
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <CalendarClock
                                size={24}
                            />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                {editId
                                    ? "Edit Work Schedule"
                                    : "Create Work Schedule"}
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Configure working days, hours, breaks and employees.
                            </p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={
                        handleSubmit
                    }
                    className="space-y-6"
                >
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-6">
                            <h2 className="text-base font-bold text-slate-900">
                                Basic Information
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Set the basic details of this working schedule.
                            </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Schedule Name
                                </label>

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(
                                        event
                                    ) =>
                                        setName(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="e.g. Standard Office Hours"
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Schedule Type
                                </label>

                                <select
                                    value={type}
                                    onChange={(
                                        event
                                    ) =>
                                        setType(
                                            event
                                                .target
                                                .value as ScheduleType
                                        )
                                    }
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                >
                                    <option value="fixed">
                                        Fixed Schedule
                                    </option>

                                    <option value="shift">
                                        Shift Schedule
                                    </option>

                                    <option value="flexible">
                                        Flexible Schedule
                                    </option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-base font-bold text-slate-900">
                                    Working Days & Hours
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    Configure the working hours for each day.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3">
                                <Clock3
                                    size={18}
                                    className="text-emerald-600"
                                />

                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                                        Weekly Hours
                                    </p>

                                    <p className="text-sm font-bold text-emerald-800">
                                        {formatHours(
                                            weeklyHours
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {days.map(
                                (day) => {
                                    const dayLabel =
                                        weekDays.find(
                                            (
                                                item
                                            ) =>
                                                item.key ===
                                                day.day
                                        )
                                            ?.label ??
                                        day.day;

                                    return (
                                        <div
                                            key={
                                                day.day
                                            }
                                            className={`grid gap-5 p-5 lg:grid-cols-[190px_1fr_1fr_170px] lg:items-end ${
                                                day.enabled
                                                    ? "bg-white"
                                                    : "bg-slate-50/70"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateDay(
                                                            day.day,
                                                            {
                                                                enabled:
                                                                    !day.enabled,
                                                            }
                                                        )
                                                    }
                                                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${
                                                        day.enabled
                                                            ? "border-emerald-600 bg-emerald-600 text-white"
                                                            : "border-slate-300 bg-white text-transparent"
                                                    }`}
                                                >
                                                    <Check
                                                        size={
                                                            14
                                                        }
                                                        strokeWidth={
                                                            3
                                                        }
                                                    />
                                                </button>

                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {
                                                            dayLabel
                                                        }
                                                    </p>

                                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                                        {day.enabled
                                                            ? "Working day"
                                                            : "Day off"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                    Start Time
                                                </label>

                                                <input
                                                    type="time"
                                                    disabled={
                                                        !day.enabled
                                                    }
                                                    value={
                                                        day.startTime
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        updateDay(
                                                            day.day,
                                                            {
                                                                startTime:
                                                                    event
                                                                        .target
                                                                        .value,
                                                            }
                                                        )
                                                    }
                                                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                    End Time
                                                </label>

                                                <input
                                                    type="time"
                                                    disabled={
                                                        !day.enabled
                                                    }
                                                    value={
                                                        day.endTime
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        updateDay(
                                                            day.day,
                                                            {
                                                                endTime:
                                                                    event
                                                                        .target
                                                                        .value,
                                                            }
                                                        )
                                                    }
                                                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                    Break Duration
                                                </label>

                                                <select
                                                    disabled={
                                                        !day.enabled
                                                    }
                                                    value={
                                                        day.breakMinutes
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        updateDay(
                                                            day.day,
                                                            {
                                                                breakMinutes:
                                                                    Number(
                                                                        event
                                                                            .target
                                                                            .value
                                                                    ),
                                                            }
                                                        )
                                                    }
                                                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                                                >
                                                    <option value="0">
                                                        No break
                                                    </option>
                                                    <option value="15">
                                                        15 minutes
                                                    </option>
                                                    <option value="30">
                                                        30 minutes
                                                    </option>
                                                    <option value="45">
                                                        45 minutes
                                                    </option>
                                                    <option value="60">
                                                        1 hour
                                                    </option>
                                                    <option value="90">
                                                        1.5 hours
                                                    </option>
                                                    <option value="120">
                                                        2 hours
                                                    </option>
                                                </select>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <Users
                                        size={19}
                                    />
                                </div>

                                <div>
                                    <h2 className="text-base font-bold text-slate-900">
                                        Assign Employees
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Choose which employees will use this schedule.
                                    </p>
                                </div>
                            </div>

                            {employees.length >
                                0 && (
                                <button
                                    type="button"
                                    onClick={
                                        selectAllEmployees
                                    }
                                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                                >
                                    {employeeIds.length ===
                                    employees.length
                                        ? "Clear All"
                                        : "Select All"}
                                </button>
                            )}
                        </div>

                        {employees.length ===
                        0 ? (
                            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                                <Users
                                    size={25}
                                    className="mx-auto text-slate-300"
                                />

                                <p className="mt-3 text-sm font-semibold text-slate-700">
                                    No active employees found
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    You can still create the schedule and assign employees later.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {employees.map(
                                    (
                                        employee
                                    ) => {
                                        const selected =
                                            employeeIds.includes(
                                                employee.id
                                            );

                                        return (
                                            <button
                                                type="button"
                                                key={
                                                    employee.id
                                                }
                                                onClick={() =>
                                                    toggleEmployee(
                                                        employee.id
                                                    )
                                                }
                                                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                                                    selected
                                                        ? "border-emerald-300 bg-emerald-50"
                                                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                                }`}
                                            >
                                                <div
                                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                                        selected
                                                            ? "bg-emerald-600 text-white"
                                                            : "bg-slate-100 text-slate-500"
                                                    }`}
                                                >
                                                    {employee.name
                                                        .split(
                                                            " "
                                                        )
                                                        .map(
                                                            (
                                                                item
                                                            ) =>
                                                                item[0]
                                                        )
                                                        .join(
                                                            ""
                                                        )
                                                        .slice(
                                                            0,
                                                            2
                                                        )
                                                        .toUpperCase()}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-slate-800">
                                                        {
                                                            employee.name
                                                        }
                                                    </p>

                                                    <p className="truncate text-xs text-slate-400">
                                                        {
                                                            employee.email
                                                        }
                                                    </p>
                                                </div>

                                                <div
                                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                                        selected
                                                            ? "border-emerald-600 bg-emerald-600 text-white"
                                                            : "border-slate-300 bg-white"
                                                    }`}
                                                >
                                                    {selected && (
                                                        <Check
                                                            size={
                                                                13
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    }
                                )}
                            </div>
                        )}

                        {employeeIds.length >
                            0 && (
                            <p className="mt-4 text-xs font-semibold text-emerald-700">
                                {
                                    employeeIds.length
                                }{" "}
                                employee
                                {employeeIds.length !==
                                1
                                    ? "s"
                                    : ""}{" "}
                                selected
                            </p>
                        )}
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between gap-5">
                            <div>
                                <h2 className="text-base font-bold text-slate-900">
                                    Schedule Status
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    Only active schedules should be used for attendance calculations.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setIsActive(
                                        (value) =>
                                            !value
                                    )
                                }
                                className={`relative h-7 w-12 rounded-full transition ${
                                    isActive
                                        ? "bg-emerald-600"
                                        : "bg-slate-300"
                                }`}
                            >
                                <span
                                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                                        isActive
                                            ? "left-6"
                                            : "left-1"
                                    }`}
                                />
                            </button>
                        </div>
                    </section>

                    <div className="flex flex-col-reverse gap-3 pb-10 sm:flex-row sm:justify-end">
                        <Link
                            href="/admin/working-schedules"
                            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#063d2f] px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-[#07513e] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Check
                                size={17}
                            />

                            {saving
                                ? "Saving..."
                                : editId
                                ? "Update Schedule"
                                : "Create Work Schedule"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}