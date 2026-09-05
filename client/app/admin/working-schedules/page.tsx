"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
    CalendarClock,
    Clock3,
    MoreVertical,
    Plus,
    Search,
    Trash2,
    Users,
    X,
} from "lucide-react";
import {
    deleteWorkingSchedule,
    getWorkingSchedules,
    subscribeToWorkingScheduleChanges,
} from "@/lib/working-schedule-storage";
import type { WorkingSchedule } from "@/types/working-schedule";

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

function formatDay(day: string) {
    return day.charAt(0).toUpperCase() + day.slice(1, 3);
}

function formatType(type: WorkingSchedule["type"]) {
    if (type === "fixed") {
        return "Fixed";
    }

    if (type === "shift") {
        return "Shift";
    }

    return "Flexible";
}

function getWorkingDays(schedule: WorkingSchedule) {
    return schedule.days.filter(
        (day) => day.enabled
    );
}

export default function WorkingSchedulesPage() {
    const [schedules, setSchedules] = useState<
        WorkingSchedule[]
    >([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [selectedSchedule, setSelectedSchedule] =
        useState<WorkingSchedule | null>(null);
    const [menuOpen, setMenuOpen] = useState<string | null>(
        null
    );

    useEffect(() => {
        const loadSchedules = () => {
            setSchedules(getWorkingSchedules());
        };

        loadSchedules();

        return subscribeToWorkingScheduleChanges(
            loadSchedules
        );
    }, []);

    const filteredSchedules = useMemo(() => {
        return schedules.filter((schedule) => {
            const matchesSearch =
                schedule.name
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                schedule.id
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const matchesStatus =
                status === "all" ||
                (status === "active" &&
                    schedule.isActive) ||
                (status === "inactive" &&
                    !schedule.isActive);

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [schedules, search, status]);

    const activeSchedules = schedules.filter(
        (schedule) => schedule.isActive
    ).length;

    const totalAssignedEmployees =
        schedules.reduce(
            (total, schedule) =>
                total +
                schedule.employeeIds.length,
            0
        );

    function handleDelete(id: string) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this working schedule?"
        );

        if (!confirmed) {
            return;
        }

        deleteWorkingSchedule(id);
        setMenuOpen(null);
        setSelectedSchedule(null);
        setSchedules(getWorkingSchedules());
    }

    return (
        <main className="min-h-screen bg-[#f7f9f8] px-6 py-7 lg:px-8">
            <div className="mx-auto max-w-[1500px]">
                <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                            <CalendarClock
                                size={16}
                                className="text-emerald-600"
                            />
                            <span>Workforce</span>
                            <span>/</span>
                            <span className="text-slate-700">
                                Working Schedules
                            </span>
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Working Schedules
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Define working hours, breaks and weekly schedules for your workforce.
                        </p>
                    </div>

                    <Link
                        href="/admin/working-schedules/new"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#063d2f] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#07513e]"
                    >
                        <Plus size={18} />
                        Create Work Schedule
                    </Link>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <CalendarClock size={20} />
                        </div>

                        <p className="text-sm text-slate-500">
                            Total Schedules
                        </p>

                        <p className="mt-1 text-2xl font-bold text-slate-900">
                            {schedules.length}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                            <Clock3 size={20} />
                        </div>

                        <p className="text-sm text-slate-500">
                            Active Schedules
                        </p>

                        <p className="mt-1 text-2xl font-bold text-slate-900">
                            {activeSchedules}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Users size={20} />
                        </div>

                        <p className="text-sm text-slate-500">
                            Assigned Employees
                        </p>

                        <p className="mt-1 text-2xl font-bold text-slate-900">
                            {totalAssignedEmployees}
                        </p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                All Working Schedules
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Manage your organization's working time policies.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative">
                                <Search
                                    size={17}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Search schedules..."
                                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 sm:w-64"
                                />
                            </div>

                            <select
                                value={status}
                                onChange={(event) =>
                                    setStatus(
                                        event.target.value
                                    )
                                }
                                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                            >
                                <option value="all">
                                    All Status
                                </option>
                                <option value="active">
                                    Active
                                </option>
                                <option value="inactive">
                                    Inactive
                                </option>
                            </select>
                        </div>
                    </div>

                    {filteredSchedules.length === 0 ? (
                        <div className="flex min-h-[430px] flex-col items-center justify-center px-6 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <CalendarClock size={28} />
                            </div>

                            <h3 className="mt-5 text-base font-bold text-slate-900">
                                No working schedules found
                            </h3>

                            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                                Create your first working schedule to define working days, office hours and break durations.
                            </p>

                            <Link
                                href="/admin/working-schedules/new"
                                className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#063d2f] px-4 text-sm font-semibold text-white transition hover:bg-[#07513e]"
                            >
                                <Plus size={17} />
                                Create Work Schedule
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[950px]">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/70">
                                        <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                            Schedule
                                        </th>

                                        <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                            Type
                                        </th>

                                        <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                            Working Days
                                        </th>

                                        <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                            Hours / Week
                                        </th>

                                        <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                            Employees
                                        </th>

                                        <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                            Status
                                        </th>

                                        <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredSchedules.map(
                                        (schedule) => (
                                            <tr
                                                key={
                                                    schedule.id
                                                }
                                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                                            <CalendarClock
                                                                size={
                                                                    18
                                                                }
                                                            />
                                                        </div>

                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-900">
                                                                {
                                                                    schedule.name
                                                                }
                                                            </p>

                                                            <p className="mt-0.5 text-xs text-slate-400">
                                                                {
                                                                    schedule.id
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                                        {formatType(
                                                            schedule.type
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex gap-1.5">
                                                        {getWorkingDays(
                                                            schedule
                                                        ).map(
                                                            (
                                                                day
                                                            ) => (
                                                                <span
                                                                    key={
                                                                        day.day
                                                                    }
                                                                    className="flex h-7 w-8 items-center justify-center rounded-md bg-emerald-50 text-[10px] font-semibold text-emerald-700"
                                                                >
                                                                    {formatDay(
                                                                        day.day
                                                                    )}
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                        <Clock3
                                                            size={
                                                                15
                                                            }
                                                            className="text-slate-400"
                                                        />
                                                        {formatHours(
                                                            schedule.weeklyHours
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="text-sm font-medium text-slate-700">
                                                        {
                                                            schedule
                                                                .employeeIds
                                                                .length
                                                        }
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                            schedule.isActive
                                                                ? "bg-emerald-50 text-emerald-700"
                                                                : "bg-slate-100 text-slate-500"
                                                        }`}
                                                    >
                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${
                                                                schedule.isActive
                                                                    ? "bg-emerald-500"
                                                                    : "bg-slate-400"
                                                            }`}
                                                        />
                                                        {schedule.isActive
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="relative flex justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setMenuOpen(
                                                                    menuOpen ===
                                                                        schedule.id
                                                                        ? null
                                                                        : schedule.id
                                                                )
                                                            }
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                                        >
                                                            <MoreVertical
                                                                size={
                                                                    18
                                                                }
                                                            />
                                                        </button>

                                                        {menuOpen ===
                                                            schedule.id && (
                                                            <div className="absolute right-0 top-10 z-20 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedSchedule(
                                                                            schedule
                                                                        );
                                                                        setMenuOpen(
                                                                            null
                                                                        );
                                                                    }}
                                                                    className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                                                                >
                                                                    View Details
                                                                </button>

                                                                <Link
                                                                    href={`/admin/working-schedules/new?edit=${schedule.id}`}
                                                                    className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                                                                >
                                                                    Edit Schedule
                                                                </Link>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            schedule.id
                                                                        )
                                                                    }
                                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-red-600 hover:bg-red-50"
                                                                >
                                                                    <Trash2
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
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

            {selectedSchedule && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-5 backdrop-blur-sm">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                                    {selectedSchedule.id}
                                </p>

                                <h2 className="mt-1 text-lg font-bold text-slate-900">
                                    {
                                        selectedSchedule.name
                                    }
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedSchedule(
                                        null
                                    )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-6 p-6">
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs text-slate-500">
                                        Type
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        {formatType(
                                            selectedSchedule.type
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs text-slate-500">
                                        Weekly Hours
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        {formatHours(
                                            selectedSchedule.weeklyHours
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs text-slate-500">
                                        Employees
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        {
                                            selectedSchedule
                                                .employeeIds
                                                .length
                                        }
                                    </p>
                                </div>

                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs text-slate-500">
                                        Status
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        {selectedSchedule.isActive
                                            ? "Active"
                                            : "Inactive"}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-3 text-sm font-bold text-slate-900">
                                    Weekly Schedule
                                </h3>

                                <div className="space-y-2">
                                    {selectedSchedule.days.map(
                                        (day) => (
                                            <div
                                                key={
                                                    day.day
                                                }
                                                className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"
                                            >
                                                <div>
                                                    <p className="text-sm font-semibold capitalize text-slate-800">
                                                        {
                                                            day.day
                                                        }
                                                    </p>
                                                </div>

                                                {day.enabled ? (
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium text-slate-700">
                                                            {
                                                                day.startTime
                                                            }{" "}
                                                            –{" "}
                                                            {
                                                                day.endTime
                                                            }
                                                        </p>

                                                        <p className="mt-0.5 text-xs text-slate-400">
                                                            {
                                                                day.breakMinutes
                                                            }{" "}
                                                            min break
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-medium text-slate-400">
                                                        Day Off
                                                    </span>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}