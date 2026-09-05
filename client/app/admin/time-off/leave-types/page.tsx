"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Edit3,
    FileText,
    Plus,
    Power,
    Trash2,
    XCircle,
} from "lucide-react";
import {
    deleteLeaveType,
    getLeaveTypes,
    updateLeaveType,
} from "@/lib/time-off-storage";
import type { LeaveType } from "@/types/time-off";

export default function LeaveTypesPage() {
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [editingType, setEditingType] =
        useState<LeaveType | null>(null);

    const [editForm, setEditForm] = useState({
        name: "",
        code: "",
        description: "",
        isPaid: true,
        annualAllocation: "",
        carryForward: false,
        maxConsecutiveDays: "",
    });

    const loadData = () => {
        setLeaveTypes(getLeaveTypes());
    };

    useEffect(() => {
        loadData();
    }, []);

    const openEdit = (leaveType: LeaveType) => {
        setEditingType(leaveType);

        setEditForm({
            name: leaveType.name,
            code: leaveType.code,
            description: leaveType.description,
            isPaid: leaveType.isPaid,
            annualAllocation:
                String(leaveType.annualAllocation),
            carryForward: leaveType.carryForward,
            maxConsecutiveDays:
                leaveType.maxConsecutiveDays === null
                    ? ""
                    : String(
                          leaveType.maxConsecutiveDays
                      ),
        });
    };

    const handleUpdate = () => {
        if (
            !editingType ||
            !editForm.name.trim() ||
            !editForm.code.trim() ||
            !editForm.annualAllocation
        ) {
            return;
        }

        const allocation = Number(
            editForm.annualAllocation
        );

        const maxDays =
            editForm.maxConsecutiveDays
                ? Number(
                      editForm.maxConsecutiveDays
                  )
                : null;

        if (allocation < 0) {
            return;
        }

        if (
            maxDays !== null &&
            maxDays <= 0
        ) {
            return;
        }

        updateLeaveType(editingType.id, {
            name: editForm.name.trim(),
            code: editForm.code
                .trim()
                .toUpperCase(),
            description:
                editForm.description.trim(),
            isPaid: editForm.isPaid,
            annualAllocation: allocation,
            carryForward:
                editForm.carryForward,
            maxConsecutiveDays: maxDays,
        });

        setEditingType(null);
        loadData();
    };

    const toggleStatus = (
        leaveType: LeaveType
    ) => {
        updateLeaveType(leaveType.id, {
            status:
                leaveType.status === "active"
                    ? "inactive"
                    : "active",
        });

        loadData();
    };

    const handleDelete = (
        leaveType: LeaveType
    ) => {
        const confirmed = window.confirm(
            `Delete ${leaveType.name}?`
        );

        if (!confirmed) {
            return;
        }

        deleteLeaveType(leaveType.id);
        loadData();
    };

    const activeCount = leaveTypes.filter(
        (item) => item.status === "active"
    ).length;

    const paidCount = leaveTypes.filter(
        (item) => item.isPaid
    ).length;

    const unpaidCount = leaveTypes.filter(
        (item) => !item.isPaid
    ).length;

    return (
        <div className="min-h-screen bg-[#f7f9f8] p-6 lg:p-8">
            <div className="mx-auto max-w-[1400px]">
                <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/time-off"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                            <ArrowLeft
                                size={18}
                            />
                        </Link>

                        <div>
                            <div className="flex items-center gap-2">
                                <CalendarDays
                                    size={19}
                                    className="text-emerald-600"
                                />

                                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                    Leave Types
                                </h1>
                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                                Configure the leave policies
                                available to employees.
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/admin/time-off/leave-types/new"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                        <Plus size={17} />
                        Add Leave Type
                    </Link>
                </div>

                <div className="mb-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                                <FileText
                                    size={19}
                                />
                            </div>

                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                                Total
                            </span>
                        </div>

                        <p className="text-3xl font-bold text-slate-900">
                            {leaveTypes.length}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            Configured leave types
                        </p>
                    </div>

                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                                <CheckCircle2
                                    size={19}
                                />
                            </div>

                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                                Active
                            </span>
                        </div>

                        <p className="text-3xl font-bold text-slate-900">
                            {activeCount}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            Currently available
                        </p>
                    </div>

                    <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                                <CalendarDays
                                    size={19}
                                />
                            </div>

                            <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
                                Paid / Unpaid
                            </span>
                        </div>

                        <p className="text-3xl font-bold text-slate-900">
                            {paidCount}
                            <span className="mx-1 text-lg font-medium text-slate-400">
                                /
                            </span>
                            {unpaidCount}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            Paid vs unpaid policies
                        </p>
                    </div>
                </div>

                {leaveTypes.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                            <CalendarDays
                                size={28}
                            />
                        </div>

                        <h2 className="text-lg font-bold text-slate-900">
                            No Leave Types
                        </h2>

                        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                            Create your first leave type
                            such as Casual Leave, Sick Leave
                            or Earned Leave.
                        </p>

                        <Link
                            href="/admin/time-off/leave-types/new"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                        >
                            <Plus size={17} />
                            Create Leave Type
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {leaveTypes.map(
                            (leaveType) => (
                                <div
                                    key={
                                        leaveType.id
                                    }
                                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                                >
                                    <div className="mb-5 flex items-start justify-between">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                            <CalendarDays
                                                size={
                                                    20
                                                }
                                            />
                                        </div>

                                        <span
                                            className={`rounded-full border px-2.5 py-1 text-xs font-bold ${
                                                leaveType.status ===
                                                "active"
                                                    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                                                    : "border-slate-200 bg-slate-100 text-slate-500"
                                            }`}
                                        >
                                            {
                                                leaveType.status
                                            }
                                        </span>
                                    </div>

                                    <div className="mb-5">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-slate-900">
                                                {
                                                    leaveType.name
                                                }
                                            </h3>

                                            <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold tracking-wider text-slate-500">
                                                {
                                                    leaveType.code
                                                }
                                            </span>
                                        </div>

                                        <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">
                                            {leaveType.description ||
                                                "No description provided."}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-xl bg-slate-50 p-3">
                                            <p className="text-xs font-semibold text-slate-400">
                                                Annual
                                            </p>

                                            <p className="mt-1 text-lg font-bold text-slate-900">
                                                {
                                                    leaveType.annualAllocation
                                                }
                                            </p>

                                            <p className="text-[11px] text-slate-400">
                                                days
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-slate-50 p-3">
                                            <p className="text-xs font-semibold text-slate-400">
                                                Type
                                            </p>

                                            <p className="mt-1 text-sm font-bold text-slate-900">
                                                {leaveType.isPaid
                                                    ? "Paid"
                                                    : "Unpaid"}
                                            </p>

                                            <p className="text-[11px] text-slate-400">
                                                leave
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                                        <div className="flex gap-2">
                                            <span
                                                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                                                    leaveType.carryForward
                                                        ? "bg-blue-50 text-blue-700"
                                                        : "bg-slate-100 text-slate-500"
                                                }`}
                                            >
                                                {leaveType.carryForward
                                                    ? "Carry Forward"
                                                    : "No Carry Forward"}
                                            </span>
                                        </div>

                                        <div className="flex gap-1">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openEdit(
                                                        leaveType
                                                    )
                                                }
                                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700"
                                                title="Edit"
                                            >
                                                <Edit3
                                                    size={
                                                        16
                                                    }
                                                />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleStatus(
                                                        leaveType
                                                    )
                                                }
                                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-amber-50 hover:text-amber-700"
                                                title={
                                                    leaveType.status ===
                                                    "active"
                                                        ? "Deactivate"
                                                        : "Activate"
                                                }
                                            >
                                                <Power
                                                    size={
                                                        16
                                                    }
                                                />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(
                                                        leaveType
                                                    )
                                                }
                                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-700"
                                                title="Delete"
                                            >
                                                <Trash2
                                                    size={
                                                        16
                                                    }
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>

            {editingType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Edit Leave Type
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    Update leave policy settings.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setEditingType(
                                        null
                                    )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <XCircle
                                    size={19}
                                />
                            </button>
                        </div>

                        <div className="grid gap-5 p-6 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Leave Name
                                </label>

                                <input
                                    value={
                                        editForm.name
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setEditForm(
                                            (
                                                current
                                            ) => ({
                                                ...current,
                                                name: event
                                                    .target
                                                    .value,
                                            })
                                        )
                                    }
                                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Code
                                </label>

                                <input
                                    value={
                                        editForm.code
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setEditForm(
                                            (
                                                current
                                            ) => ({
                                                ...current,
                                                code: event
                                                    .target
                                                    .value
                                                    .toUpperCase(),
                                            })
                                        )
                                    }
                                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm uppercase outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Description
                                </label>

                                <textarea
                                    value={
                                        editForm.description
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setEditForm(
                                            (
                                                current
                                            ) => ({
                                                ...current,
                                                description:
                                                    event
                                                        .target
                                                        .value,
                                            })
                                        )
                                    }
                                    className="min-h-24 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Annual Allocation
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={
                                        editForm.annualAllocation
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setEditForm(
                                            (
                                                current
                                            ) => ({
                                                ...current,
                                                annualAllocation:
                                                    event
                                                        .target
                                                        .value,
                                            })
                                        )
                                    }
                                    className="h-12 w-full appearance-none rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Max Consecutive Days
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    value={
                                        editForm.maxConsecutiveDays
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setEditForm(
                                            (
                                                current
                                            ) => ({
                                                ...current,
                                                maxConsecutiveDays:
                                                    event
                                                        .target
                                                        .value,
                                            })
                                        )
                                    }
                                    placeholder="No limit"
                                    className="h-12 w-full appearance-none rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                            </div>

                            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4">
                                <input
                                    type="checkbox"
                                    checked={
                                        editForm.isPaid
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setEditForm(
                                            (
                                                current
                                            ) => ({
                                                ...current,
                                                isPaid: event
                                                    .target
                                                    .checked,
                                            })
                                        )
                                    }
                                    className="h-4 w-4 accent-emerald-600"
                                />

                                <div>
                                    <p className="text-sm font-bold text-slate-800">
                                        Paid Leave
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        Salary remains unaffected.
                                    </p>
                                </div>
                            </label>

                            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4">
                                <input
                                    type="checkbox"
                                    checked={
                                        editForm.carryForward
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setEditForm(
                                            (
                                                current
                                            ) => ({
                                                ...current,
                                                carryForward:
                                                    event
                                                        .target
                                                        .checked,
                                            })
                                        )
                                    }
                                    className="h-4 w-4 accent-emerald-600"
                                />

                                <div>
                                    <p className="text-sm font-bold text-slate-800">
                                        Carry Forward
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        Allow unused leave to carry over.
                                    </p>
                                </div>
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-5">
                            <button
                                type="button"
                                onClick={() =>
                                    setEditingType(
                                        null
                                    )
                                }
                                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleUpdate
                                }
                                className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}