"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    CalendarDays,
    Check,
    ChevronRight,
    CircleDollarSign,
    FileText,
    Info,
    RotateCcw,
    Save,
    ShieldCheck,
} from "lucide-react";
import { createLeaveType } from "@/lib/time-off-storage";

export default function NewLeaveTypePage() {
    const router = useRouter();

    const [form, setForm] = useState({
        name: "",
        code: "",
        description: "",
        isPaid: true,
        annualAllocation: "",
        carryForward: false,
        maxConsecutiveDays: "",
        status: "active" as "active" | "inactive",
    });

    const [error, setError] = useState("");

    const updateField = (
        field: keyof typeof form,
        value: string | boolean
    ) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));

        setError("");
    };

    const handleSubmit = (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (
            !form.name.trim() ||
            !form.code.trim() ||
            !form.annualAllocation
        ) {
            setError(
                "Please complete all required fields."
            );
            return;
        }

        const annualAllocation = Number(
            form.annualAllocation
        );

        const maxConsecutiveDays =
            form.maxConsecutiveDays
                ? Number(form.maxConsecutiveDays)
                : null;

        if (
            Number.isNaN(annualAllocation) ||
            annualAllocation < 0
        ) {
            setError(
                "Annual allocation must be a valid positive number."
            );
            return;
        }

        if (
            maxConsecutiveDays !== null &&
            (Number.isNaN(maxConsecutiveDays) ||
                maxConsecutiveDays <= 0)
        ) {
            setError(
                "Maximum consecutive days must be greater than 0."
            );
            return;
        }

        createLeaveType({
            name: form.name.trim(),
            code: form.code
                .trim()
                .toUpperCase(),
            description:
                form.description.trim(),
            isPaid: form.isPaid,
            annualAllocation,
            carryForward:
                form.carryForward,
            maxConsecutiveDays,
            status: form.status,
        });

        router.push(
            "/admin/time-off/leave-types"
        );
    };

    const resetForm = () => {
        setForm({
            name: "",
            code: "",
            description: "",
            isPaid: true,
            annualAllocation: "",
            carryForward: false,
            maxConsecutiveDays: "",
            status: "active",
        });

        setError("");
    };

    return (
        <div className="min-h-screen bg-[#f7f9f8] p-6 lg:p-8">
            <div className="mx-auto max-w-[1400px]">
                <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/time-off/leave-types"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                            <ArrowLeft size={18} />
                        </Link>

                        <div>
                            <div className="flex items-center gap-2">
                                <CalendarDays
                                    size={19}
                                    className="text-emerald-600"
                                />

                                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                    Create Leave Type
                                </h1>
                            </div>

                            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                                <span>
                                    Time Off
                                </span>

                                <ChevronRight
                                    size={14}
                                />

                                <span>
                                    Leave Types
                                </span>

                                <ChevronRight
                                    size={14}
                                />

                                <span className="font-medium text-emerald-600">
                                    New
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]"
                >
                    <div className="space-y-6">
                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-white to-white px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                        <FileText
                                            size={20}
                                        />
                                    </div>

                                    <div>
                                        <h2 className="font-bold text-slate-900">
                                            Basic Information
                                        </h2>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Define the identity and purpose of this leave policy.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-5 p-6 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Leave Name
                                        <span className="ml-1 text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        value={form.name}
                                        onChange={(event) =>
                                            updateField(
                                                "name",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="e.g. Casual Leave"
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Leave Code
                                        <span className="ml-1 text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        value={form.code}
                                        onChange={(event) =>
                                            updateField(
                                                "code",
                                                event
                                                    .target
                                                    .value
                                                    .replace(
                                                        /\s/g,
                                                        ""
                                                    )
                                                    .toUpperCase()
                                            )
                                        }
                                        placeholder="e.g. CL"
                                        maxLength={20}
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm uppercase text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                    />

                                    <p className="mt-2 text-xs text-slate-400">
                                        Use a short unique code.
                                    </p>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Description
                                    </label>

                                    <textarea
                                        value={
                                            form.description
                                        }
                                        onChange={(event) =>
                                            updateField(
                                                "description",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Describe when employees can use this leave..."
                                        className="min-h-28 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 via-white to-white px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                                        <CalendarDays
                                            size={20}
                                        />
                                    </div>

                                    <div>
                                        <h2 className="font-bold text-slate-900">
                                            Leave Allocation
                                        </h2>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Configure how much leave employees receive.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-5 p-6 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Annual Allocation
                                        <span className="ml-1 text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            value={
                                                form.annualAllocation
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateField(
                                                    "annualAllocation",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="e.g. 12"
                                            className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                        />

                                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                                            days
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Maximum Consecutive Days
                                    </label>

                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={
                                                form.maxConsecutiveDays
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateField(
                                                    "maxConsecutiveDays",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="No limit"
                                            className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                        />

                                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                                            days
                                        </span>
                                    </div>

                                    <p className="mt-2 text-xs text-slate-400">
                                        Leave empty for no restriction.
                                    </p>
                                </div>

                                <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40">
                                    <input
                                        type="checkbox"
                                        checked={
                                            form.isPaid
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateField(
                                                "isPaid",
                                                event
                                                    .target
                                                    .checked
                                            )
                                        }
                                        className="h-5 w-5 accent-emerald-600"
                                    />

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                                        <CircleDollarSign
                                            size={18}
                                        />
                                    </div>

                                    <div>
                                        <p className="text-sm font-bold text-slate-800">
                                            Paid Leave
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Employee salary remains unaffected.
                                        </p>
                                    </div>
                                </label>

                                <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/40">
                                    <input
                                        type="checkbox"
                                        checked={
                                            form.carryForward
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateField(
                                                "carryForward",
                                                event
                                                    .target
                                                    .checked
                                            )
                                        }
                                        className="h-5 w-5 accent-blue-600"
                                    />

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                                        <RotateCcw
                                            size={18}
                                        />
                                    </div>

                                    <div>
                                        <p className="text-sm font-bold text-slate-800">
                                            Carry Forward
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Allow unused days to move to the next year.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 bg-gradient-to-r from-violet-50 via-white to-white px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                                        <ShieldCheck
                                            size={20}
                                        />
                                    </div>

                                    <div>
                                        <h2 className="font-bold text-slate-900">
                                            Policy Status
                                        </h2>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Control whether employees can use this leave type.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 p-6 md:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        updateField(
                                            "status",
                                            "active"
                                        )
                                    }
                                    className={`rounded-xl border p-4 text-left transition ${
                                        form.status ===
                                        "active"
                                            ? "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-500/10"
                                            : "border-slate-200 bg-white hover:border-slate-300"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                                <Check
                                                    size={17}
                                                />
                                            </div>

                                            <div>
                                                <p className="text-sm font-bold text-slate-800">
                                                    Active
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    Available to employees
                                                </p>
                                            </div>
                                        </div>

                                        {form.status ===
                                            "active" && (
                                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                        )}
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        updateField(
                                            "status",
                                            "inactive"
                                        )
                                    }
                                    className={`rounded-xl border p-4 text-left transition ${
                                        form.status ===
                                        "inactive"
                                            ? "border-slate-300 bg-slate-100 ring-2 ring-slate-500/10"
                                            : "border-slate-200 bg-white hover:border-slate-300"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200 text-slate-600">
                                                <Info
                                                    size={17}
                                                />
                                            </div>

                                            <div>
                                                <p className="text-sm font-bold text-slate-800">
                                                    Inactive
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    Hidden from employees
                                                </p>
                                            </div>
                                        </div>

                                        {form.status ===
                                            "inactive" && (
                                            <div className="h-2.5 w-2.5 rounded-full bg-slate-500" />
                                        )}
                                    </div>
                                </button>
                            </div>
                        </section>

                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                            >
                                <RotateCcw
                                    size={16}
                                />
                                Reset
                            </button>

                            <button
                                type="submit"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
                            >
                                <Save size={17} />
                                Create Leave Type
                            </button>
                        </div>
                    </div>

                    <div className="xl:sticky xl:top-6 xl:self-start">
                        <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
                            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-6 text-white">
                                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />

                                <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/5" />

                                <div className="relative">
                                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                                        <CalendarDays
                                            size={23}
                                        />
                                    </div>

                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">
                                        Policy Preview
                                    </p>

                                    <h2 className="mt-2 text-2xl font-bold">
                                        {form.name ||
                                            "New Leave Type"}
                                    </h2>

                                    <p className="mt-1 text-sm text-emerald-100">
                                        {form.code ||
                                            "CODE"}
                                    </p>
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="mb-5 grid grid-cols-2 gap-3">
                                    <div className="rounded-xl bg-emerald-50 p-4">
                                        <p className="text-xs font-semibold text-emerald-600">
                                            Annual
                                        </p>

                                        <p className="mt-1 text-2xl font-bold text-slate-900">
                                            {form.annualAllocation ||
                                                "0"}
                                        </p>

                                        <p className="text-xs text-slate-400">
                                            days
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-blue-50 p-4">
                                        <p className="text-xs font-semibold text-blue-600">
                                            Status
                                        </p>

                                        <p className="mt-2 text-sm font-bold capitalize text-slate-900">
                                            {
                                                form.status
                                            }
                                        </p>

                                        <p className="text-xs text-slate-400">
                                            policy
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                                        <span className="text-sm text-slate-500">
                                            Leave Type
                                        </span>

                                        <span className="text-sm font-bold text-slate-900">
                                            {form.isPaid
                                                ? "Paid"
                                                : "Unpaid"}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                                        <span className="text-sm text-slate-500">
                                            Carry Forward
                                        </span>

                                        <span className="text-sm font-bold text-slate-900">
                                            {form.carryForward
                                                ? "Allowed"
                                                : "Not Allowed"}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                                        <span className="text-sm text-slate-500">
                                            Max Consecutive
                                        </span>

                                        <span className="text-sm font-bold text-slate-900">
                                            {form.maxConsecutiveDays
                                                ? `${form.maxConsecutiveDays} days`
                                                : "No Limit"}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-4">
                                    <div className="flex gap-3">
                                        <Info
                                            size={17}
                                            className="mt-0.5 shrink-0 text-amber-600"
                                        />

                                        <p className="text-xs leading-5 text-amber-800">
                                            Leave allocation and carry-forward
                                            rules will be used later when
                                            employee leave balances are
                                            calculated.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}