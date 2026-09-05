"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    CalendarDays,
    Check,
    ChevronRight,
    Clock3,
    FileText,
    Plus,
    Search,
    Users,
    X,
} from "lucide-react";
import {
    getLeaveRequests,
    getLeaveTypes,
    updateLeaveRequest,
} from "@/lib/time-off-storage";
import { getEmployees } from "@/lib/employee-storage";
import type {
    LeaveRequest,
    LeaveType,
} from "@/types/time-off";
import type { Employee } from "@/types/employee";

export default function TimeOffPage() {
    const [requests, setRequests] = useState<
        LeaveRequest[]
    >([]);
    const [leaveTypes, setLeaveTypes] = useState<
        LeaveType[]
    >([]);
    const [employees, setEmployees] = useState<
        Employee[]
    >([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] =
        useState("all");
    const [typeFilter, setTypeFilter] =
        useState("all");
    const [selectedRequest, setSelectedRequest] =
        useState<LeaveRequest | null>(null);
    const [rejectionReason, setRejectionReason] =
        useState("");

    const loadData = () => {
        setRequests(getLeaveRequests());
        setLeaveTypes(getLeaveTypes());
        setEmployees(getEmployees());
    };

    useEffect(() => {
        loadData();
    }, []);

    const getEmployeeName = (
        employeeId: string
    ) => {
        return (
            employees.find(
                (employee) =>
                    employee.id === employeeId
            )?.name || "Unknown Employee"
        );
    };

    const getLeaveType = (
        leaveTypeId: string
    ) => {
        return leaveTypes.find(
            (leaveType) =>
                leaveType.id === leaveTypeId
        );
    };

    const filteredRequests = useMemo(() => {
        return requests.filter((request) => {
            const employeeName =
                getEmployeeName(
                    request.employeeId
                ).toLowerCase();

            const leaveType =
                getLeaveType(
                    request.leaveTypeId
                );

            const matchesSearch =
                employeeName.includes(
                    search.toLowerCase()
                ) ||
                leaveType?.name
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    );

            const matchesStatus =
                statusFilter === "all" ||
                request.status === statusFilter;

            const matchesType =
                typeFilter === "all" ||
                request.leaveTypeId === typeFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesType
            );
        });
    }, [
        requests,
        employees,
        leaveTypes,
        search,
        statusFilter,
        typeFilter,
    ]);

    const pendingCount = requests.filter(
        (request) =>
            request.status === "pending"
    ).length;

    const approvedCount = requests.filter(
        (request) =>
            request.status === "approved"
    ).length;

    const rejectedCount = requests.filter(
        (request) =>
            request.status === "rejected"
    ).length;

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    const onLeaveToday = requests.filter(
        (request) =>
            request.status === "approved" &&
            request.fromDate <= today &&
            request.toDate >= today
    ).length;

    const handleApprove = (
        request: LeaveRequest
    ) => {
        updateLeaveRequest(request.id, {
            status: "approved",
            reviewedAt:
                new Date().toISOString(),
            reviewedBy: "Admin",
        });

        loadData();
        setSelectedRequest(null);
    };

    const handleReject = (
        request: LeaveRequest
    ) => {
        if (!rejectionReason.trim()) {
            return;
        }

        updateLeaveRequest(request.id, {
            status: "rejected",
            reviewedAt:
                new Date().toISOString(),
            reviewedBy: "Admin",
            rejectionReason:
                rejectionReason.trim(),
        });

        setRejectionReason("");
        loadData();
        setSelectedRequest(null);
    };

    const formatDate = (
        date: string
    ) => {
        if (!date) {
            return "-";
        }

        return new Date(
            `${date}T00:00:00`
        ).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getStatusStyle = (
        status: LeaveRequest["status"]
    ) => {
        if (status === "approved") {
            return "bg-emerald-50 text-emerald-700 border-emerald-100";
        }

        if (status === "rejected") {
            return "bg-red-50 text-red-700 border-red-100";
        }

        if (status === "cancelled") {
            return "bg-slate-100 text-slate-600 border-slate-200";
        }

        return "bg-amber-50 text-amber-700 border-amber-100";
    };

    return (
        <div className="min-h-screen bg-[#f7f9f8] p-6 lg:p-8">
            <div className="mx-auto max-w-[1500px]">
                <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                <CalendarDays
                                    size={18}
                                />
                            </div>

                            <span className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                                Workforce
                            </span>
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Time Off
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage employee leave requests,
                            balances and time-off policies.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Link
                            href="/admin/time-off/leave-types"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                            <FileText
                                size={17}
                            />
                            Leave Types
                        </Link>

                        <Link
                            href="/admin/time-off/leave-types/new"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                        >
                            <Plus
                                size={17}
                            />
                            Add Leave Type
                        </Link>
                    </div>
                </div>

                <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                        <div className="mb-5 flex items-center justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                                <FileText
                                    size={19}
                                />
                            </div>

                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                                Requests
                            </span>
                        </div>

                        <p className="text-3xl font-bold text-slate-900">
                            {requests.length}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            Total leave requests
                        </p>
                    </div>

                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                        <div className="mb-5 flex items-center justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
                                <Clock3
                                    size={19}
                                />
                            </div>

                            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                                Pending
                            </span>
                        </div>

                        <p className="text-3xl font-bold text-slate-900">
                            {pendingCount}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            Awaiting approval
                        </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                        <div className="mb-5 flex items-center justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                                <Check
                                    size={19}
                                />
                            </div>

                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                                Approved
                            </span>
                        </div>

                        <p className="text-3xl font-bold text-slate-900">
                            {approvedCount}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            Approved requests
                        </p>
                    </div>

                    <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
                        <div className="mb-5 flex items-center justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                                <Users
                                    size={19}
                                />
                            </div>

                            <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
                                Today
                            </span>
                        </div>

                        <p className="text-3xl font-bold text-slate-900">
                            {onLeaveToday}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            Employees on leave today
                        </p>
                    </div>
                </div>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 p-5">
                        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Leave Requests
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Review and manage employee
                                    time-off requests.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <div className="relative">
                                    <Search
                                        size={17}
                                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Search employee or leave..."
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 sm:w-64"
                                    />
                                </div>

                                <select
                                    value={statusFilter}
                                    onChange={(event) =>
                                        setStatusFilter(
                                            event.target.value
                                        )
                                    }
                                    className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500"
                                >
                                    <option value="all">
                                        All Status
                                    </option>
                                    <option value="pending">
                                        Pending
                                    </option>
                                    <option value="approved">
                                        Approved
                                    </option>
                                    <option value="rejected">
                                        Rejected
                                    </option>
                                    <option value="cancelled">
                                        Cancelled
                                    </option>
                                </select>

                                <select
                                    value={typeFilter}
                                    onChange={(event) =>
                                        setTypeFilter(
                                            event.target.value
                                        )
                                    }
                                    className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500"
                                >
                                    <option value="all">
                                        All Leave Types
                                    </option>

                                    {leaveTypes.map(
                                        (leaveType) => (
                                            <option
                                                key={
                                                    leaveType.id
                                                }
                                                value={
                                                    leaveType.id
                                                }
                                            >
                                                {
                                                    leaveType.name
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>

                    {filteredRequests.length === 0 ? (
                        <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <CalendarDays
                                    size={28}
                                />
                            </div>

                            <h3 className="text-lg font-bold text-slate-900">
                                No leave requests yet
                            </h3>

                            <p className="mt-1 max-w-md text-sm text-slate-500">
                                Employee leave requests will
                                appear here once they submit
                                time off.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px]">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Employee
                                        </th>

                                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Leave Type
                                        </th>

                                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            From
                                        </th>

                                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            To
                                        </th>

                                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Days
                                        </th>

                                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Status
                                        </th>

                                        <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredRequests.map(
                                        (request) => {
                                            const leaveType =
                                                getLeaveType(
                                                    request.leaveTypeId
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        request.id
                                                    }
                                                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700">
                                                                {getEmployeeName(
                                                                    request.employeeId
                                                                )
                                                                    .charAt(
                                                                        0
                                                                    )
                                                                    .toUpperCase()}
                                                            </div>

                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-900">
                                                                    {getEmployeeName(
                                                                        request.employeeId
                                                                    )}
                                                                </p>

                                                                <p className="text-xs text-slate-400">
                                                                    {
                                                                        request.id
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="text-sm font-semibold text-slate-700">
                                                            {leaveType?.name ||
                                                                "Unknown"}
                                                        </p>

                                                        <p className="text-xs text-slate-400">
                                                            {leaveType?.isPaid
                                                                ? "Paid Leave"
                                                                : "Unpaid Leave"}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-slate-600">
                                                        {formatDate(
                                                            request.fromDate
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-slate-600">
                                                        {formatDate(
                                                            request.toDate
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span className="text-sm font-bold text-slate-900">
                                                            {
                                                                request.totalDays
                                                            }
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${getStatusStyle(
                                                                request.status
                                                            )}`}
                                                        >
                                                            {
                                                                request.status
                                                            }
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedRequest(
                                                                    request
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50"
                                                        >
                                                            Review
                                                            <ChevronRight
                                                                size={
                                                                    15
                                                                }
                                                            />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>

            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Leave Request
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                    {selectedRequest.id}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedRequest(
                                        null
                                    )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X
                                    size={18}
                                />
                            </button>
                        </div>

                        <div className="space-y-5 p-6">
                            <div className="rounded-xl bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Employee
                                </p>

                                <p className="mt-1 text-sm font-bold text-slate-900">
                                    {getEmployeeName(
                                        selectedRequest.employeeId
                                    )}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold text-slate-400">
                                        Leave Type
                                    </p>

                                    <p className="mt-1 text-sm font-bold text-slate-800">
                                        {getLeaveType(
                                            selectedRequest.leaveTypeId
                                        )?.name ||
                                            "Unknown"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-slate-400">
                                        Total Days
                                    </p>

                                    <p className="mt-1 text-sm font-bold text-slate-800">
                                        {
                                            selectedRequest.totalDays
                                        }{" "}
                                        days
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-slate-400">
                                        From
                                    </p>

                                    <p className="mt-1 text-sm font-bold text-slate-800">
                                        {formatDate(
                                            selectedRequest.fromDate
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-slate-400">
                                        To
                                    </p>

                                    <p className="mt-1 text-sm font-bold text-slate-800">
                                        {formatDate(
                                            selectedRequest.toDate
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-slate-400">
                                    Reason
                                </p>

                                <p className="mt-2 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                                    {selectedRequest.reason ||
                                        "No reason provided."}
                                </p>
                            </div>

                            {selectedRequest.status ===
                                "pending" && (
                                <>
                                    <textarea
                                        value={
                                            rejectionReason
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setRejectionReason(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Reason for rejection (required only when rejecting)"
                                        className="min-h-24 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10"
                                    />

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleReject(
                                                    selectedRequest
                                                )
                                            }
                                            disabled={
                                                !rejectionReason.trim()
                                            }
                                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <X
                                                size={17}
                                            />
                                            Reject
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleApprove(
                                                    selectedRequest
                                                )
                                            }
                                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                                        >
                                            <Check
                                                size={17}
                                            />
                                            Approve
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}