"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    FileText,
    Plus,
    Search,
    WalletCards,
} from "lucide-react";
import { getPayRuns } from "@/lib/payroll-calculator";
import type { PayRun, PayRunStatus } from "@/types/pay-run";

const statusStyles: Record<PayRunStatus, string> = {
    draft: "bg-slate-100 text-slate-700",
    processing: "bg-blue-50 text-blue-700",
    review: "bg-amber-50 text-amber-700",
    approved: "bg-emerald-50 text-emerald-700",
    locked: "bg-purple-50 text-purple-700",
};

const statusLabels: Record<PayRunStatus, string> = {
    draft: "Draft",
    processing: "Processing",
    review: "Under Review",
    approved: "Approved",
    locked: "Locked",
};

export default function PayRunsPage() {
    const [payRuns, setPayRuns] = useState<PayRun[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        setPayRuns(getPayRuns());
    }, []);

    const filteredPayRuns = useMemo(() => {
        return payRuns.filter((payRun) => {
            const matchesSearch =
                payRun.name
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                payRun.id
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "all" ||
                payRun.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [payRuns, search, statusFilter]);

    const totalPayroll = payRuns.reduce(
        (sum, payRun) => sum + payRun.totalNet,
        0
    );

    const pendingRuns = payRuns.filter(
        (payRun) =>
            payRun.status === "draft" ||
            payRun.status === "processing" ||
            payRun.status === "review"
    ).length;

    const approvedRuns = payRuns.filter(
        (payRun) =>
            payRun.status === "approved" ||
            payRun.status === "locked"
    ).length;

    return (
        <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
            <div className="mx-auto max-w-[1500px]">
                <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-600">
                            <WalletCards size={16} />
                            Payroll
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Pay Runs
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Create, calculate and manage employee payroll.
                        </p>
                    </div>

                    <Link
                        href="/admin/payruns/new"
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
                    >
                        <Plus size={18} />
                        Create Pay Run
                    </Link>
                </div>

                <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        icon={WalletCards}
                        label="Total Payroll"
                        value={`₹${totalPayroll.toLocaleString("en-IN")}`}
                        iconClass="bg-emerald-50 text-emerald-600"
                    />

                    <StatCard
                        icon={Clock3}
                        label="Pending Runs"
                        value={pendingRuns.toString()}
                        iconClass="bg-amber-50 text-amber-600"
                    />

                    <StatCard
                        icon={CheckCircle2}
                        label="Approved / Locked"
                        value={approvedRuns.toString()}
                        iconClass="bg-blue-50 text-blue-600"
                    />

                    <StatCard
                        icon={FileText}
                        label="Total Pay Runs"
                        value={payRuns.length.toString()}
                        iconClass="bg-purple-50 text-purple-600"
                    />
                </div>

                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full lg:max-w-md">
                            <Search
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search pay run..."
                                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value)
                            }
                            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500"
                        >
                            <option value="all">All Statuses</option>
                            <option value="draft">Draft</option>
                            <option value="processing">Processing</option>
                            <option value="review">Under Review</option>
                            <option value="approved">Approved</option>
                            <option value="locked">Locked</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px]">
                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Pay Run
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Period
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Employees
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Gross
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Net Payroll
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {filteredPayRuns.length > 0 ? (
                                    filteredPayRuns.map((payRun) => (
                                        <tr
                                            key={payRun.id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="px-6 py-5">
                                                <div>
                                                    <p className="font-semibold text-slate-900">
                                                        {payRun.name}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-400">
                                                        {payRun.id}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <CalendarDays
                                                        size={16}
                                                        className="text-slate-400"
                                                    />
                                                    {payRun.periodStart} →{" "}
                                                    {payRun.periodEnd}
                                                </div>
                                            </td>

                                            <td className="px-6 py-5 text-sm font-medium text-slate-700">
                                                {payRun.employeeIds.length}
                                            </td>

                                            <td className="px-6 py-5 text-sm font-semibold text-slate-800">
                                                ₹
                                                {payRun.totalGross.toLocaleString(
                                                    "en-IN"
                                                )}
                                            </td>

                                            <td className="px-6 py-5 text-sm font-bold text-emerald-700">
                                                ₹
                                                {payRun.totalNet.toLocaleString(
                                                    "en-IN"
                                                )}
                                            </td>

                                            <td className="px-6 py-5">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[payRun.status]}`}
                                                >
                                                    {statusLabels[payRun.status]}
                                                </span>
                                            </td>

                                            <td className="px-6 py-5 text-right">
                                                <Link
                                                    href={`/admin/payruns/${payRun.id}`}
                                                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50"
                                                >
                                                    View
                                                    <ArrowRight size={15} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-20 text-center"
                                        >
                                            <div className="mx-auto flex max-w-md flex-col items-center">
                                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                                    <WalletCards size={28} />
                                                </div>

                                                <h3 className="text-lg font-semibold text-slate-900">
                                                    No Pay Runs Yet
                                                </h3>

                                                <p className="mt-2 text-sm text-slate-500">
                                                    Create your first payroll run
                                                    to start calculating employee
                                                    salaries.
                                                </p>

                                                <Link
                                                    href="/admin/payruns/new"
                                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                                                >
                                                    <Plus size={17} />
                                                    Create Pay Run
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
    iconClass,
}: {
    icon: typeof WalletCards;
    label: string;
    value: string;
    iconClass: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {label}
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                        {value}
                    </p>
                </div>

                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
                >
                    <Icon size={21} />
                </div>
            </div>
        </div>
    );
}