"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    BriefcaseBusiness,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Edit3,
    FileText,
    Plus,
    Search,
    Trash2,
    UserRound,
    X,
    AlertTriangle,
} from "lucide-react";

import type { Contract } from "@/types/contract";
import type { Employee } from "@/types/employee";
import type { HRRole } from "@/lib/hr-permissions";

import {
    createContract,
    deleteContract,
    getContractStatus,
    getContracts,
    subscribeToContractChanges,
    updateContract,
} from "@/lib/contract-storage";

import {
    canCreate,
    canDelete,
    canUpdate,
} from "@/lib/hr-permissions";

import {
    getEmployees,
    subscribeToDataChanges,
} from "@/lib/employee-storage";

import HRPageHeader from "@/components/hr/HRPageHeader";
import HREmptyState from "@/components/hr/HREmptyState";

const CONTRACT_TYPE_LABELS = {
    permanent: "Permanent",
    fixed_term: "Fixed Term",
    probation: "Probation",
    internship: "Internship",
    part_time: "Part Time",
} as const;

const STATUS_LABELS = {
    active: "Active",
    upcoming: "Upcoming",
    expired: "Expired",
} as const;

type ContractStatus =
    | "active"
    | "upcoming"
    | "expired";

type FormState = {
    employeeId: string;
    contractType: Contract["contractType"];
    jobTitle: string;
    startDate: string;
    endDate: string;
    salary: string;
    notes: string;
};

const EMPTY_FORM: FormState = {
    employeeId: "",
    contractType: "permanent",
    jobTitle: "",
    startDate: "",
    endDate: "",
    salary: "",
    notes: "",
};

export default function HRContractsPage() {
    // Temporary until authenticated session is connected.
    const role: HRRole = "HR_MANAGER";

    const [contracts, setContracts] =
        useState<Contract[]>([]);

    const [employees, setEmployees] =
        useState<Employee[]>([]);

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState<"all" | ContractStatus>(
            "all"
        );

    const [typeFilter, setTypeFilter] =
        useState<
            "all" | Contract["contractType"]
        >("all");

    const [isModalOpen, setIsModalOpen] =
        useState(false);

    const [editingContract, setEditingContract] =
        useState<Contract | null>(null);

    const [form, setForm] =
        useState<FormState>(EMPTY_FORM);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [deleteTarget, setDeleteTarget] =
        useState<Contract | null>(null);

    const [isDeleting, setIsDeleting] =
        useState(false);

    useEffect(() => {
        const loadData = () => {
            setContracts(getContracts());
            setEmployees(getEmployees());
        };

        loadData();

        const unsubscribeContracts =
            subscribeToContractChanges(
                () => {
                    setContracts(
                        getContracts()
                    );
                }
            );

        const unsubscribeEmployees =
            subscribeToDataChanges(
                () => {
                    setEmployees(
                        getEmployees()
                    );
                }
            );

        return () => {
            unsubscribeContracts();
            unsubscribeEmployees();
        };
    }, []);

    const employeeMap = useMemo(() => {
        return new Map(
            employees.map(
                (employee) => [
                    employee.id,
                    employee,
                ]
            )
        );
    }, [employees]);

    const filteredContracts =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            return contracts.filter(
                (contract) => {
                    const employee =
                        employeeMap.get(
                            contract.employeeId
                        );

                    const employeeName =
                        employee?.name || "";

                    const status =
                        getContractStatus(
                            contract
                        );

                    const matchesSearch =
                        !query ||
                        contract.id
                            .toLowerCase()
                            .includes(query) ||
                        employeeName
                            .toLowerCase()
                            .includes(query) ||
                        contract.jobTitle
                            .toLowerCase()
                            .includes(query);

                    const matchesStatus =
                        statusFilter ===
                            "all" ||
                        status ===
                            statusFilter;

                    const matchesType =
                        typeFilter ===
                            "all" ||
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
            contracts,
            employeeMap,
            search,
            statusFilter,
            typeFilter,
        ]);

    const stats = useMemo(() => {
        let active = 0;
        let upcoming = 0;
        let expired = 0;

        contracts.forEach(
            (contract) => {
                const status =
                    getContractStatus(
                        contract
                    );

                if (status === "active") {
                    active++;
                }

                if (
                    status ===
                    "upcoming"
                ) {
                    upcoming++;
                }

                if (
                    status ===
                    "expired"
                ) {
                    expired++;
                }
            }
        );

        return {
            total: contracts.length,
            active,
            upcoming,
            expired,
        };
    }, [contracts]);

    function openCreateModal() {
        setEditingContract(null);
        setForm({
            ...EMPTY_FORM,
            employeeId:
                employees[0]?.id || "",
        });
        setIsModalOpen(true);
    }

    function openEditModal(
        contract: Contract
    ) {
        setEditingContract(contract);

        setForm({
            employeeId:
                contract.employeeId,
            contractType:
                contract.contractType,
            jobTitle:
                contract.jobTitle,
            startDate:
                contract.startDate,
            endDate:
                contract.endDate,
            salary:
                String(contract.salary),
            notes:
                contract.notes,
        });

        setIsModalOpen(true);
    }

    function closeModal() {
        if (isSubmitting) {
            return;
        }

        setIsModalOpen(false);
        setEditingContract(null);
        setForm(EMPTY_FORM);
    }

    function updateForm(
        field: keyof FormState,
        value: string
    ) {
        setForm(
            (previous) => ({
                ...previous,
                [field]: value,
            })
        );
    }

    function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!form.employeeId) {
            return;
        }

        if (!form.jobTitle.trim()) {
            return;
        }

        if (!form.startDate) {
            return;
        }

        if (!form.endDate) {
            return;
        }

        if (
            form.endDate <
            form.startDate
        ) {
            return;
        }

        const salary =
            Number(form.salary);

        if (
            !Number.isFinite(salary) ||
            salary < 0
        ) {
            return;
        }

        setIsSubmitting(true);

        const contractData = {
            employeeId:
                form.employeeId,
            contractType:
                form.contractType,
            jobTitle:
                form.jobTitle.trim(),
            startDate:
                form.startDate,
            endDate:
                form.endDate,
            salary,
            notes:
                form.notes.trim(),
        };

        if (editingContract) {
            updateContract(
                editingContract.id,
                contractData
            );
        } else {
            createContract(
                contractData
            );
        }

        setIsSubmitting(false);
        closeModal();
    }

    function handleDelete() {
        if (!deleteTarget) {
            return;
        }

        setIsDeleting(true);

        deleteContract(
            deleteTarget.id
        );

        setIsDeleting(false);
        setDeleteTarget(null);
    }

    function formatDate(
        value: string
    ) {
        if (!value) {
            return "—";
        }

        const date =
            new Date(
                `${value}T00:00:00`
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return value;
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    }

    function formatSalary(
        value: number
    ) {
        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
            }
        ).format(value);
    }

    return (
        <>
            <div className="px-4 pb-10 pt-5 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-[1600px]">
                    <HRPageHeader
                        title="Contracts"
                        description="Manage employee contracts, employment terms and contract status."
                        action={
                            canCreate(
                                role,
                                "contracts"
                            )
                                ? {
                                      label:
                                          "Add Contract",
                                      onClick:
                                          openCreateModal,
                                      icon: Plus,
                                  }
                                : undefined
                        }
                    />

                    {/* Stats */}
                    <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            title="Total Contracts"
                            value={
                                stats.total
                            }
                            description="All employee contracts"
                            icon={
                                FileText
                            }
                        />

                        <StatCard
                            title="Active"
                            value={
                                stats.active
                            }
                            description="Currently active"
                            icon={
                                CheckCircle2
                            }
                        />

                        <StatCard
                            title="Upcoming"
                            value={
                                stats.upcoming
                            }
                            description="Starting in the future"
                            icon={
                                Clock3
                            }
                        />

                        <StatCard
                            title="Expired"
                            value={
                                stats.expired
                            }
                            description="Past contract end date"
                            icon={
                                CalendarDays
                            }
                        />
                    </section>

                    {/* Filters */}
                    <section className="mt-6 rounded-2xl border border-black/[0.06] bg-white/65 p-4 shadow-[0_10px_40px_rgba(20,25,10,0.05)] backdrop-blur-xl">
                        <div className="flex flex-col gap-3 lg:flex-row">
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#68705D]" />

                                <input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="Search contracts, employees or job titles..."
                                    className="h-11 w-full rounded-xl border border-black/[0.06] bg-white/80 pl-10 pr-4 text-sm text-[#10130B] outline-none transition placeholder:text-[#8A9183] focus:border-[#DFFF00] focus:ring-4 focus:ring-[#DFFF00]/20"
                                />
                            </div>

                            <select
                                value={
                                    statusFilter
                                }
                                onChange={(event) =>
                                    setStatusFilter(
                                        event
                                            .target
                                            .value as
                                            | "all"
                                            | ContractStatus
                                    )
                                }
                                className="h-11 rounded-xl border border-black/[0.06] bg-white/80 px-4 text-sm text-[#10130B] outline-none focus:border-[#DFFF00] focus:ring-4 focus:ring-[#DFFF00]/20"
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

                            <select
                                value={
                                    typeFilter
                                }
                                onChange={(event) =>
                                    setTypeFilter(
                                        event
                                            .target
                                            .value as
                                            | "all"
                                            | Contract["contractType"]
                                    )
                                }
                                className="h-11 rounded-xl border border-black/[0.06] bg-white/80 px-4 text-sm text-[#10130B] outline-none focus:border-[#DFFF00] focus:ring-4 focus:ring-[#DFFF00]/20"
                            >
                                <option value="all">
                                    All Types
                                </option>

                                {Object.entries(
                                    CONTRACT_TYPE_LABELS
                                ).map(
                                    ([
                                        value,
                                        label,
                                    ]) => (
                                        <option
                                            key={
                                                value
                                            }
                                            value={
                                                value
                                            }
                                        >
                                            {
                                                label
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </div>
                    </section>

                    {/* Contracts */}
                    <section className="mt-6 overflow-hidden rounded-2xl border border-black/[0.06] bg-white/65 shadow-[0_10px_40px_rgba(20,25,10,0.05)] backdrop-blur-xl">
                        {contracts.length ===
                        0 ? (
                            <HREmptyState
                                icon={
                                    BriefcaseBusiness
                                }
                                title="No contracts yet"
                                description="Create a contract for an employee to start managing employment terms."
                                action={
                                    canCreate(
                                        role,
                                        "contracts"
                                    )
                                        ? {
                                              label:
                                                  "Add Contract",
                                              onClick:
                                                  openCreateModal,
                                          }
                                        : undefined
                                }
                            />
                        ) : filteredContracts.length ===
                          0 ? (
                            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DFFF00]/20 text-[#10130B]">
                                    <Search className="h-6 w-6" />
                                </div>

                                <h3 className="mt-5 text-base font-bold text-[#10130B]">
                                    No contracts found
                                </h3>

                                <p className="mt-2 max-w-md text-sm leading-6 text-[#68705D]">
                                    Try changing your search or filters.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop */}
                                <div className="hidden overflow-x-auto lg:block">
                                    <table className="w-full min-w-[1050px]">
                                        <thead>
                                            <tr className="border-b border-black/[0.06] bg-white/40">
                                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#68705D]">
                                                    Contract
                                                </th>

                                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#68705D]">
                                                    Employee
                                                </th>

                                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#68705D]">
                                                    Type
                                                </th>

                                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#68705D]">
                                                    Duration
                                                </th>

                                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#68705D]">
                                                    Salary
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
                                            {filteredContracts.map(
                                                (
                                                    contract
                                                ) => {
                                                    const employee =
                                                        employeeMap.get(
                                                            contract.employeeId
                                                        );

                                                    const status =
                                                        getContractStatus(
                                                            contract
                                                        );

                                                    return (
                                                        <tr
                                                            key={
                                                                contract.id
                                                            }
                                                            className="border-b border-black/[0.04] transition hover:bg-[#DFFF00]/[0.04]"
                                                        >
                                                            <td className="px-5 py-4">
                                                                <div>
                                                                    <p className="font-bold text-[#10130B]">
                                                                        {
                                                                            contract.id
                                                                        }
                                                                    </p>

                                                                    <p className="mt-1 text-sm text-[#68705D]">
                                                                        {
                                                                            contract.jobTitle
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </td>

                                                            <td className="px-5 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar
                                                                        name={
                                                                            employee?.name ||
                                                                            "Unknown"
                                                                        }
                                                                    />

                                                                    <div>
                                                                        <p className="font-semibold text-[#10130B]">
                                                                            {
                                                                                employee?.name ||
                                                                                "Unknown employee"
                                                                            }
                                                                        </p>

                                                                        <p className="text-xs text-[#68705D]">
                                                                            {
                                                                                employee?.email ||
                                                                                "Employee record unavailable"
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            <td className="px-5 py-4 text-sm font-medium text-[#10130B]">
                                                                {
                                                                    CONTRACT_TYPE_LABELS[
                                                                        contract
                                                                            .contractType
                                                                    ]
                                                                }
                                                            </td>

                                                            <td className="px-5 py-4">
                                                                <p className="text-sm font-medium text-[#10130B]">
                                                                    {formatDate(
                                                                        contract.startDate
                                                                    )}
                                                                </p>

                                                                <p className="mt-1 text-xs text-[#68705D]">
                                                                    to{" "}
                                                                    {formatDate(
                                                                        contract.endDate
                                                                    )}
                                                                </p>
                                                            </td>

                                                            <td className="px-5 py-4 text-sm font-bold text-[#10130B]">
                                                                {formatSalary(
                                                                    contract.salary
                                                                )}
                                                            </td>

                                                            <td className="px-5 py-4">
                                                                <StatusBadge
                                                                    status={
                                                                        status
                                                                    }
                                                                />
                                                            </td>

                                                            <td className="px-5 py-4">
                                                                <div className="flex justify-end gap-2">
                                                                    {canUpdate(
                                                                        role,
                                                                        "contracts"
                                                                    ) && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                openEditModal(
                                                                                    contract
                                                                                )
                                                                            }
                                                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/[0.06] bg-white/70 text-[#68705D] transition hover:border-[#DFFF00] hover:bg-[#DFFF00]/20 hover:text-[#10130B]"
                                                                            aria-label={`Edit ${contract.id}`}
                                                                        >
                                                                            <Edit3 className="h-4 w-4" />
                                                                        </button>
                                                                    )}

                                                                    {canDelete(
                                                                        role,
                                                                        "contracts"
                                                                    ) && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                setDeleteTarget(
                                                                                    contract
                                                                                )
                                                                            }
                                                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/[0.06] bg-white/70 text-[#68705D] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                                                            aria-label={`Delete ${contract.id}`}
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
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

                                {/* Mobile */}
                                <div className="divide-y divide-black/[0.05] lg:hidden">
                                    {filteredContracts.map(
                                        (
                                            contract
                                        ) => {
                                            const employee =
                                                employeeMap.get(
                                                    contract.employeeId
                                                );

                                            const status =
                                                getContractStatus(
                                                    contract
                                                );

                                            return (
                                                <div
                                                    key={
                                                        contract.id
                                                    }
                                                    className="p-4 sm:p-5"
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            <Avatar
                                                                name={
                                                                    employee?.name ||
                                                                    "Unknown"
                                                                }
                                                            />

                                                            <div className="min-w-0">
                                                                <p className="font-bold text-[#10130B]">
                                                                    {
                                                                        contract.id
                                                                    }
                                                                </p>

                                                                <p className="truncate text-sm text-[#68705D]">
                                                                    {
                                                                        contract.jobTitle
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <StatusBadge
                                                            status={
                                                                status
                                                            }
                                                        />
                                                    </div>

                                                    <div className="mt-5 grid grid-cols-2 gap-4">
                                                        <InfoItem
                                                            label="Employee"
                                                            value={
                                                                employee?.name ||
                                                                "Unknown"
                                                            }
                                                        />

                                                        <InfoItem
                                                            label="Type"
                                                            value={
                                                                CONTRACT_TYPE_LABELS[
                                                                    contract
                                                                        .contractType
                                                                ]
                                                            }
                                                        />

                                                        <InfoItem
                                                            label="Start"
                                                            value={formatDate(
                                                                contract.startDate
                                                            )}
                                                        />

                                                        <InfoItem
                                                            label="End"
                                                            value={formatDate(
                                                                contract.endDate
                                                            )}
                                                        />

                                                        <InfoItem
                                                            label="Salary"
                                                            value={formatSalary(
                                                                contract.salary
                                                            )}
                                                        />
                                                    </div>

                                                    {(canUpdate(
                                                        role,
                                                        "contracts"
                                                    ) ||
                                                        canDelete(
                                                            role,
                                                            "contracts"
                                                        )) && (
                                                        <div className="mt-5 flex gap-2 border-t border-black/[0.05] pt-4">
                                                            {canUpdate(
                                                                role,
                                                                "contracts"
                                                            ) && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openEditModal(
                                                                            contract
                                                                        )
                                                                    }
                                                                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-black/[0.06] bg-white/70 text-sm font-semibold text-[#10130B]"
                                                                >
                                                                    <Edit3 className="h-4 w-4" />
                                                                    Edit
                                                                </button>
                                                            )}

                                                            {canDelete(
                                                                role,
                                                                "contracts"
                                                            ) && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setDeleteTarget(
                                                                            contract
                                                                        )
                                                                    }
                                                                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-sm font-semibold text-red-600"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    Delete
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
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

            {/* Create / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4 backdrop-blur-md">
                    <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-black/[0.06] bg-[#F7F7F2]/95 shadow-2xl">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/[0.06] bg-white/80 px-5 py-4 backdrop-blur-xl sm:px-6">
                            <div>
                                <h2 className="text-lg font-bold text-[#10130B]">
                                    {editingContract
                                        ? "Edit Contract"
                                        : "Add Contract"}
                                </h2>

                                <p className="mt-1 text-sm text-[#68705D]">
                                    {editingContract
                                        ? "Update employment contract details."
                                        : "Create a new employee contract."}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeModal
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/[0.06] bg-white text-[#68705D] transition hover:bg-[#DFFF00]/20 hover:text-[#10130B]"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="space-y-5 p-5 sm:p-6"
                        >
                            <div className="grid gap-5 sm:grid-cols-2">
                                <FormField label="Employee">
                                    <select
                                        required
                                        value={
                                            form.employeeId
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateForm(
                                                "employeeId",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="input"
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
                                                    (
                                                    {
                                                        employee.id
                                                    }
                                                    )
                                                </option>
                                            )
                                        )}
                                    </select>
                                </FormField>

                                <FormField label="Contract Type">
                                    <select
                                        value={
                                            form.contractType
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateForm(
                                                "contractType",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="input"
                                    >
                                        {Object.entries(
                                            CONTRACT_TYPE_LABELS
                                        ).map(
                                            ([
                                                value,
                                                label,
                                            ]) => (
                                                <option
                                                    key={
                                                        value
                                                    }
                                                    value={
                                                        value
                                                    }
                                                >
                                                    {
                                                        label
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </FormField>

                                <FormField label="Job Title">
                                    <input
                                        required
                                        value={
                                            form.jobTitle
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateForm(
                                                "jobTitle",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="e.g. Software Engineer"
                                        className="input"
                                    />
                                </FormField>

                                <FormField label="Salary">
                                    <input
                                        required
                                        min="0"
                                        type="number"
                                        value={
                                            form.salary
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateForm(
                                                "salary",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="e.g. 50000"
                                        className="input"
                                    />
                                </FormField>

                                <FormField label="Start Date">
                                    <input
                                        required
                                        type="date"
                                        value={
                                            form.startDate
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateForm(
                                                "startDate",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="input"
                                    />
                                </FormField>

                                <FormField label="End Date">
                                    <input
                                        required
                                        type="date"
                                        min={
                                            form.startDate ||
                                            undefined
                                        }
                                        value={
                                            form.endDate
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateForm(
                                                "endDate",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="input"
                                    />
                                </FormField>
                            </div>

                            <FormField label="Notes">
                                <textarea
                                    value={
                                        form.notes
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        updateForm(
                                            "notes",
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    rows={4}
                                    placeholder="Optional contract notes..."
                                    className="input min-h-[110px] resize-y py-3"
                                />
                            </FormField>

                            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={
                                        closeModal
                                    }
                                    className="h-11 rounded-xl border border-black/[0.06] bg-white px-5 text-sm font-semibold text-[#10130B]"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        isSubmitting ||
                                        employees.length ===
                                            0
                                    }
                                    className="h-11 rounded-xl bg-[#DFFF00] px-6 text-sm font-bold text-[#10130B] shadow-[0_8px_25px_rgba(223,255,0,0.25)] transition hover:bg-[#F4FF3F] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmitting
                                        ? "Saving..."
                                        : editingContract
                                          ? "Update Contract"
                                          : "Create Contract"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/30 p-4 backdrop-blur-md">
                    <div className="w-full max-w-md rounded-3xl border border-black/[0.06] bg-[#F7F7F2]/95 p-6 shadow-2xl">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                            <AlertTriangle className="h-6 w-6" />
                        </div>

                        <h2 className="mt-5 text-lg font-bold text-[#10130B]">
                            Delete contract?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-[#68705D]">
                            This will permanently
                            remove{" "}
                            <span className="font-semibold text-[#10130B]">
                                {
                                    deleteTarget.id
                                }
                            </span>{" "}
                            from the local contract
                            records.
                        </p>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() =>
                                    setDeleteTarget(
                                        null
                                    )
                                }
                                disabled={
                                    isDeleting
                                }
                                className="h-11 rounded-xl border border-black/[0.06] bg-white px-5 text-sm font-semibold text-[#10130B]"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleDelete
                                }
                                disabled={
                                    isDeleting
                                }
                                className="h-11 rounded-xl bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                            >
                                {isDeleting
                                    ? "Deleting..."
                                    : "Delete Contract"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function StatCard({
    title,
    value,
    description,
    icon: Icon,
}: {
    title: string;
    value: number;
    description: string;
    icon: typeof FileText;
}) {
    return (
        <div className="rounded-2xl border border-black/[0.06] bg-white/65 p-5 shadow-[0_10px_40px_rgba(20,25,10,0.05)] backdrop-blur-xl">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-semibold text-[#68705D]">
                        {title}
                    </p>

                    <p className="mt-2 text-3xl font-bold tracking-tight text-[#10130B]">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-[#68705D]">
                        {description}
                    </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DFFF00]/30 text-[#10130B]">
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}

function Avatar({
    name,
}: {
    name: string;
}) {
    const initial =
        name
            .trim()
            .charAt(0)
            .toUpperCase() || "?";

    return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DFFF00]/40 text-sm font-bold text-[#10130B]">
            {initial}
        </div>
    );
}

function StatusBadge({
    status,
}: {
    status: ContractStatus;
}) {
    const classes = {
        active:
            "bg-[#DFFF00]/30 text-[#405000]",
        upcoming:
            "bg-blue-50 text-blue-700",
        expired:
            "bg-red-50 text-red-700",
    };

    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${classes[status]}`}
        >
            {STATUS_LABELS[status]}
        </span>
    );
}

function InfoItem({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8A9183]">
                {label}
            </p>

            <p className="mt-1 text-sm font-semibold text-[#10130B]">
                {value}
            </p>
        </div>
    );
}

function FormField({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#10130B]">
                {label}
            </span>

            {children}
        </label>
    );
}