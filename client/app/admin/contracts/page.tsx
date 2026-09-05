"use client";

import { useEffect, useMemo, useState } from "react";
import {
    CalendarDays,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock3,
    FileText,
    Mail,
    Search,
    UserRound,
    X,
} from "lucide-react";
import { getEmployees } from "@/lib/employee-storage";
import {
    createContract,
    getContractStatus,
    getContracts,
    subscribeToContractChanges,
} from "@/lib/contract-storage";
import type { Employee } from "@/types/employee";
import type {
    Contract,
    ContractType,
} from "@/types/contract";

function getToday() {
    return new Date()
        .toISOString()
        .split("T")[0];
}

function formatDate(date: string) {
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
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value || 0);
}

function getContractTypeLabel(
    type: ContractType
) {
    if (type === "fixed_term") {
        return "Fixed Term";
    }

    if (type === "probation") {
        return "Probation";
    }

    if (type === "internship") {
        return "Internship";
    }

    if (type === "part_time") {
        return "Part Time";
    }

    return "Permanent";
}

function StatusBadge({
    status,
}: {
    status: "active" | "upcoming" | "expired";
}) {
    if (status === "active") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active
            </span>
        );
    }

    if (status === "upcoming") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Upcoming
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Expired
        </span>
    );
}

export default function ContractsPage() {
    const [employees, setEmployees] =
        useState<Employee[]>([]);

    const [contracts, setContracts] =
        useState<Contract[]>([]);

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] =
        useState<
            "all" | "active" | "upcoming" | "expired"
        >("all");

    const [typeFilter, setTypeFilter] =
        useState<"all" | ContractType>("all");

    const [selectedContract, setSelectedContract] =
        useState<Contract | null>(null);

    const [showAddModal, setShowAddModal] =
        useState(false);

    const [form, setForm] = useState({
        employeeId: "",
        contractType:
            "permanent" as ContractType,
        jobTitle: "",
        startDate: getToday(),
        endDate: "",
        salary: "",
        notes: "",
    });

    const [formError, setFormError] =
        useState("");

    function loadData() {
        setEmployees(
            getEmployees().filter(
                (employee) =>
                    employee.status === "active"
            )
        );

        setContracts(getContracts());
    }

    useEffect(() => {
        loadData();

        const unsubscribe =
            subscribeToContractChanges(
                loadData
            );

        return unsubscribe;
    }, []);

    const employeeMap = useMemo(() => {
        const map = new Map<
            string,
            Employee
        >();

        employees.forEach((employee) => {
            map.set(employee.id, employee);
        });

        getEmployees().forEach((employee) => {
            if (!map.has(employee.id)) {
                map.set(employee.id, employee);
            }
        });

        return map;
    }, [employees]);

    const contractRows = useMemo(() => {
        return contracts.map((contract) => ({
            contract,
            employee: employeeMap.get(
                contract.employeeId
            ),
            status: getContractStatus(contract),
        }));
    }, [contracts, employeeMap]);

    const filteredContracts = useMemo(() => {
        const value =
            search.toLowerCase().trim();

        return contractRows.filter(
            ({
                contract,
                employee,
                status,
            }) => {
                const matchesSearch =
                    !value ||
                    employee?.name
                        .toLowerCase()
                        .includes(value) ||
                    employee?.email
                        .toLowerCase()
                        .includes(value) ||
                    contract.jobTitle
                        .toLowerCase()
                        .includes(value) ||
                    contract.id
                        .toLowerCase()
                        .includes(value);

                const matchesStatus =
                    statusFilter === "all" ||
                    status === statusFilter;

                const matchesType =
                    typeFilter === "all" ||
                    contract.contractType ===
                        typeFilter;

                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesType
                );
            }
        );
    }, [
        contractRows,
        search,
        statusFilter,
        typeFilter,
    ]);

    const activeCount = contractRows.filter(
        (item) => item.status === "active"
    ).length;

    const upcomingCount = contractRows.filter(
        (item) => item.status === "upcoming"
    ).length;

    const expiredCount = contractRows.filter(
        (item) => item.status === "expired"
    ).length;

    function handleCreateContract(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setFormError("");

        if (!form.employeeId) {
            setFormError(
                "Please select an employee."
            );
            return;
        }

        if (!form.jobTitle.trim()) {
            setFormError(
                "Please enter the job title."
            );
            return;
        }

        if (!form.startDate) {
            setFormError(
                "Please select a start date."
            );
            return;
        }

        if (!form.endDate) {
            setFormError(
                "Please select an end date."
            );
            return;
        }

        if (
            form.endDate <
            form.startDate
        ) {
            setFormError(
                "End date cannot be before start date."
            );
            return;
        }

        if (
            !form.salary ||
            Number(form.salary) < 0
        ) {
            setFormError(
                "Please enter a valid salary."
            );
            return;
        }

        const contract = createContract({
            employeeId: form.employeeId,
            contractType:
                form.contractType,
            jobTitle:
                form.jobTitle.trim(),
            startDate: form.startDate,
            endDate: form.endDate,
            salary: Number(form.salary),
            notes: form.notes.trim(),
        });

        setContracts(getContracts());
        setShowAddModal(false);
        setSelectedContract(contract);

        setForm({
            employeeId: "",
            contractType:
                "permanent",
            jobTitle: "",
            startDate: getToday(),
            endDate: "",
            salary: "",
            notes: "",
        });
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
                            Contracts
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage employee contracts,
                            terms and employment periods.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setShowAddModal(true)
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                        <FileText size={17} />
                        Add Contract
                    </button>
                </div>

                <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500">
                                    Total Contracts
                                </p>

                                <p className="mt-2 text-3xl font-bold text-slate-900">
                                    {contracts.length}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                <FileText size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500">
                                    Active
                                </p>

                                <p className="mt-2 text-3xl font-bold text-emerald-700">
                                    {activeCount}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <Clock3 size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500">
                                    Upcoming
                                </p>

                                <p className="mt-2 text-3xl font-bold text-blue-700">
                                    {upcomingCount}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <CalendarDays size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500">
                                    Expired
                                </p>

                                <p className="mt-2 text-3xl font-bold text-red-600">
                                    {expiredCount}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                                <FileText size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                Employee Contracts
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Review and manage all
                                employment contracts.
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
                                            event.target.value
                                        )
                                    }
                                    placeholder="Search contracts..."
                                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 sm:w-64"
                                />
                            </div>

                            <div className="relative">
                                <select
                                    value={
                                        statusFilter
                                    }
                                    onChange={(event) =>
                                        setStatusFilter(
                                            event.target
                                                .value as
                                                | "all"
                                                | "active"
                                                | "upcoming"
                                                | "expired"
                                        )
                                    }
                                    className="h-10 appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                >
                                    <option value="all">
                                        All Status
                                    </option>
                                    <option value="active">
                                        Active
                                    </option>
                                    <option value="upcoming">
                                        Upcoming
                                    </option>
                                    <option value="expired">
                                        Expired
                                    </option>
                                </select>

                                <ChevronDown
                                    size={15}
                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                            </div>

                            <div className="relative">
                                <select
                                    value={
                                        typeFilter
                                    }
                                    onChange={(event) =>
                                        setTypeFilter(
                                            event.target
                                                .value as
                                                | "all"
                                                | ContractType
                                        )
                                    }
                                    className="h-10 appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                >
                                    <option value="all">
                                        All Types
                                    </option>
                                    <option value="permanent">
                                        Permanent
                                    </option>
                                    <option value="fixed_term">
                                        Fixed Term
                                    </option>
                                    <option value="probation">
                                        Probation
                                    </option>
                                    <option value="internship">
                                        Internship
                                    </option>
                                    <option value="part_time">
                                        Part Time
                                    </option>
                                </select>

                                <ChevronDown
                                    size={15}
                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {contracts.length === 0 ? (
                        <div className="flex min-h-[430px] flex-col items-center justify-center px-6 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <FileText size={28} />
                            </div>

                            <h3 className="mt-5 text-base font-bold text-slate-900">
                                No contracts yet
                            </h3>

                            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                                Create the first employee
                                contract to start managing
                                employment terms and
                                contract periods.
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowAddModal(
                                        true
                                    )
                                }
                                className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                            >
                                <FileText size={16} />
                                Add Contract
                            </button>
                        </div>
                    ) : filteredContracts.length ===
                      0 ? (
                        <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
                            <Search
                                size={30}
                                className="text-slate-300"
                            />

                            <h3 className="mt-4 text-base font-bold text-slate-900">
                                No contracts found
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Try changing your search
                                or filters.
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
                                            Contract
                                        </th>

                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Period
                                        </th>

                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Salary
                                        </th>

                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Status
                                        </th>

                                        <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredContracts.map(
                                        ({
                                            contract,
                                            employee,
                                            status,
                                        }) => (
                                            <tr
                                                key={
                                                    contract.id
                                                }
                                                className="border-b border-slate-100 transition hover:bg-slate-50/60"
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700">
                                                            {employee?.name
                                                                ?.charAt(
                                                                    0
                                                                )
                                                                .toUpperCase() ||
                                                                "?"}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-bold text-slate-900">
                                                                {employee?.name ||
                                                                    "Employee unavailable"}
                                                            </p>

                                                            <p className="mt-1 truncate text-xs text-slate-500">
                                                                {employee?.email ||
                                                                    "-"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {
                                                            contract.jobTitle
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {getContractTypeLabel(
                                                            contract.contractType
                                                        )}
                                                    </p>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <p className="text-sm font-medium text-slate-700">
                                                        {formatDate(
                                                            contract.startDate
                                                        )}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        to{" "}
                                                        {formatDate(
                                                            contract.endDate
                                                        )}
                                                    </p>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <span className="text-sm font-semibold text-slate-800">
                                                        {formatCurrency(
                                                            contract.salary
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <StatusBadge
                                                        status={
                                                            status
                                                        }
                                                    />
                                                </td>

                                                <td className="px-6 py-5 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedContract(
                                                                contract
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

            {selectedContract && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-5 backdrop-blur-sm"
                    onClick={() =>
                        setSelectedContract(null)
                    }
                >
                    <div
                        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <FileText size={20} />
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Contract Details
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        {
                                            selectedContract.id
                                        }
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedContract(
                                        null
                                    )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-5 p-6">
                            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-bold text-emerald-700 shadow-sm">
                                    {employeeMap
                                        .get(
                                            selectedContract.employeeId
                                        )
                                        ?.name?.charAt(
                                            0
                                        )
                                        .toUpperCase() ||
                                        "?"}
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-slate-900">
                                        {employeeMap.get(
                                            selectedContract.employeeId
                                        )?.name ||
                                            "Employee unavailable"}
                                    </p>

                                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                        <Mail
                                            size={13}
                                        />

                                        {employeeMap.get(
                                            selectedContract.employeeId
                                        )?.email ||
                                            "-"}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-slate-100 p-4">
                                    <p className="text-xs text-slate-500">
                                        Contract Type
                                    </p>

                                    <p className="mt-1 text-sm font-bold text-slate-900">
                                        {getContractTypeLabel(
                                            selectedContract.contractType
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-100 p-4">
                                    <p className="text-xs text-slate-500">
                                        Status
                                    </p>

                                    <div className="mt-2">
                                        <StatusBadge
                                            status={getContractStatus(
                                                selectedContract
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="rounded-xl border border-slate-100 p-4">
                                    <p className="text-xs text-slate-500">
                                        Job Title
                                    </p>

                                    <p className="mt-1 text-sm font-bold text-slate-900">
                                        {
                                            selectedContract.jobTitle
                                        }
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-100 p-4">
                                    <p className="text-xs text-slate-500">
                                        Salary
                                    </p>

                                    <p className="mt-1 text-sm font-bold text-slate-900">
                                        {formatCurrency(
                                            selectedContract.salary
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-slate-100 p-4">
                                    <p className="text-xs text-slate-500">
                                        Start Date
                                    </p>

                                    <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                                        <CalendarDays
                                            size={16}
                                            className="text-emerald-600"
                                        />

                                        {formatDate(
                                            selectedContract.startDate
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-100 p-4">
                                    <p className="text-xs text-slate-500">
                                        End Date
                                    </p>

                                    <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                                        <CalendarDays
                                            size={16}
                                            className="text-emerald-600"
                                        />

                                        {formatDate(
                                            selectedContract.endDate
                                        )}
                                    </p>
                                </div>
                            </div>

                            {selectedContract.notes && (
                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                    <p className="text-xs text-slate-500">
                                        Notes
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-slate-700">
                                        {
                                            selectedContract.notes
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showAddModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-5 backdrop-blur-sm"
                    onClick={() =>
                        setShowAddModal(false)
                    }
                >
                    <div
                        className="my-5 w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Add Contract
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    Create an employment contract
                                    for an existing employee.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowAddModal(
                                        false
                                    )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            onSubmit={
                                handleCreateContract
                            }
                            className="p-6"
                        >
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="mb-2 block text-xs font-semibold text-slate-700">
                                        Employee
                                    </label>

                                    <div className="relative">
                                        <UserRound
                                            size={16}
                                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <select
                                            value={
                                                form.employeeId
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setForm(
                                                    (
                                                        current
                                                    ) => ({
                                                        ...current,
                                                        employeeId:
                                                            event
                                                                .target
                                                                .value,
                                                    })
                                                )
                                            }
                                            className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                                        >
                                            <option value="">
                                                Select employee
                                            </option>

                                            {employees.map(
                                                (
                                                    employee
                                                ) => (
                                                    <option
                                                        key={
                                                            employee.id
                                                        }
                                                        value={
                                                            employee.id
                                                        }
                                                    >
                                                        {
                                                            employee.name
                                                        }{" "}
                                                        —{" "}
                                                        {
                                                            employee.id
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </select>

                                        <ChevronDown
                                            size={15}
                                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-semibold text-slate-700">
                                        Contract Type
                                    </label>

                                    <div className="relative">
                                        <select
                                            value={
                                                form.contractType
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setForm(
                                                    (
                                                        current
                                                    ) => ({
                                                        ...current,
                                                        contractType:
                                                            event
                                                                .target
                                                                .value as ContractType,
                                                    })
                                                )
                                            }
                                            className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                                        >
                                            <option value="permanent">
                                                Permanent
                                            </option>

                                            <option value="fixed_term">
                                                Fixed Term
                                            </option>

                                            <option value="probation">
                                                Probation
                                            </option>

                                            <option value="internship">
                                                Internship
                                            </option>

                                            <option value="part_time">
                                                Part Time
                                            </option>
                                        </select>

                                        <ChevronDown
                                            size={15}
                                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-semibold text-slate-700">
                                        Job Title
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            form.jobTitle
                                        }
                                        onChange={(event) =>
                                            setForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    jobTitle:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                        placeholder="e.g. Software Engineer"
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-semibold text-slate-700">
                                        Start Date
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            form.startDate
                                        }
                                        onChange={(event) =>
                                            setForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    startDate:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-semibold text-slate-700">
                                        End Date
                                    </label>

                                    <input
                                        type="date"
                                        min={
                                            form.startDate
                                        }
                                        value={
                                            form.endDate
                                        }
                                        onChange={(event) =>
                                            setForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    endDate:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-semibold text-slate-700">
                                        Contract Salary
                                    </label>

                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                                            ₹
                                        </span>

                                        <input
                                            type="number"
                                            min="0"
                                            value={
                                                form.salary
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setForm(
                                                    (
                                                        current
                                                    ) => ({
                                                        ...current,
                                                        salary:
                                                            event
                                                                .target
                                                                .value,
                                                    })
                                                )
                                            }
                                            placeholder="0"
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-2 block text-xs font-semibold text-slate-700">
                                        Notes
                                    </label>

                                    <textarea
                                        value={
                                            form.notes
                                        }
                                        onChange={(event) =>
                                            setForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    notes:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                        placeholder="Additional contract information..."
                                        rows={4}
                                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                                    />
                                </div>
                            </div>

                            {formError && (
                                <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                                    {formError}
                                </div>
                            )}

                            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowAddModal(
                                            false
                                        )
                                    }
                                    className="h-10 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="h-10 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                >
                                    Create Contract
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}