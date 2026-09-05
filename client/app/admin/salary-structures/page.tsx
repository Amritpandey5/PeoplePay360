"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
    ArrowUpRight,
    Check,
    ChevronDown,
    Clock3,
    Edit3,
    Layers3,
    Plus,
    Search,
    Users,
    X,
} from "lucide-react";
import type {
    SalaryComponent,
    SalaryComponentType,
    SalaryFrequency,
    SalaryStructure,
} from "@/types/salary-structure";
import {
    getSalaryStructures,
    updateSalaryStructure,
} from "@/lib/salary-structure-storage";

type FrequencyFilter =
    | "all"
    | SalaryFrequency;

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Math.max(0, value || 0));
}

function getFrequencyLabel(
    frequency: SalaryFrequency
) {
    if (frequency === "monthly") {
        return "Monthly";
    }

    if (frequency === "weekly") {
        return "Weekly";
    }

    if (frequency === "daily") {
        return "Daily";
    }

    return "Yearly";
}

function getPeriodAmount(
    annualCtc: number,
    frequency: SalaryFrequency
) {
    const amount = Number(annualCtc) || 0;

    if (frequency === "yearly") {
        return amount;
    }

    if (frequency === "monthly") {
        return amount / 12;
    }

    if (frequency === "weekly") {
        return amount / 52;
    }

    return amount / 260;
}

function getAnnualToPeriodFactor(
    frequency: SalaryFrequency
) {
    if (frequency === "yearly") {
        return 1;
    }

    if (frequency === "monthly") {
        return 12;
    }

    if (frequency === "weekly") {
        return 52;
    }

    return 260;
}

function getComponentAmount(
    component: SalaryComponent,
    structure: SalaryStructure
) {
    const periodCtc = getPeriodAmount(
        structure.annualCtc,
        structure.frequency
    );

    const basic =
        periodCtc * 0.5;

    if (
        component.calculationType ===
        "fixed"
    ) {
        return Number(component.value) || 0;
    }

    if (
        component.calculationType ===
        "percentage_basic"
    ) {
        return (
            basic *
            (Number(component.value) || 0) /
            100
        );
    }

    if (
        component.calculationType ===
        "percentage_ctc"
    ) {
        return (
            periodCtc *
            (Number(component.value) || 0) /
            100
        );
    }

    if (
        component.calculationType ===
        "percentage_gross"
    ) {
        const earnings = structure.components
            .filter(
                (item) =>
                    item.type === "earning"
            )
            .reduce(
                (total, item) => {
                    if (
                        item.id === component.id
                    ) {
                        return total;
                    }

                    return (
                        total +
                        getComponentAmount(
                            item,
                            structure
                        )
                    );
                },
                0
            );

        return (
            earnings *
            (Number(component.value) || 0) /
            100
        );
    }

    return 0;
}

function getComponentTotal(
    structure: SalaryStructure,
    type: SalaryComponentType
) {
    return structure.components
        .filter(
            (component) =>
                component.type === type
        )
        .reduce(
            (total, component) =>
                total +
                getComponentAmount(
                    component,
                    structure
                ),
            0
        );
}

function getStructureBreakdown(
    structure: SalaryStructure
) {
    const periodCtc = getPeriodAmount(
        structure.annualCtc,
        structure.frequency
    );

    const earnings = getComponentTotal(
        structure,
        "earning"
    );

    const deductions = getComponentTotal(
        structure,
        "deduction"
    );

    const employerContributions =
        getComponentTotal(
            structure,
            "employer_contribution"
        );

    const annualToPeriod =
        getAnnualToPeriodFactor(
            structure.frequency
        );

    return {
        periodCtc,
        earnings,
        deductions,
        employerContributions,
        net:
            earnings - deductions,
        totalEmployerCost:
            earnings +
            employerContributions,
        annualEarnings:
            earnings * annualToPeriod,
        annualDeductions:
            deductions * annualToPeriod,
    };
}

function getFrequencyAccent(
    frequency: SalaryFrequency
) {
    if (frequency === "monthly") {
        return {
            badge: "bg-blue-50 text-blue-700 border-blue-100",
            icon: "bg-blue-500",
            soft: "bg-blue-50",
        };
    }

    if (frequency === "weekly") {
        return {
            badge:
                "bg-emerald-50 text-emerald-700 border-emerald-100",
            icon: "bg-emerald-500",
            soft: "bg-emerald-50",
        };
    }

    if (frequency === "daily") {
        return {
            badge:
                "bg-orange-50 text-orange-700 border-orange-100",
            icon: "bg-orange-500",
            soft: "bg-orange-50",
        };
    }

    return {
        badge:
            "bg-purple-50 text-purple-700 border-purple-100",
        icon: "bg-purple-500",
        soft: "bg-purple-50",
    };
}

function ComponentBreakdown({
    structure,
}: {
    structure: SalaryStructure;
}) {
    const earnings =
        structure.components.filter(
            (component) =>
                component.type === "earning"
        );

    const deductions =
        structure.components.filter(
            (component) =>
                component.type === "deduction"
        );

    const employer =
        structure.components.filter(
            (component) =>
                component.type ===
                "employer_contribution"
        );

    const renderGroup = (
        title: string,
        components: SalaryComponent[],
        type: SalaryComponentType
    ) => {
        if (!components.length) {
            return null;
        }

        return (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-800">
                        {title}
                    </h4>
                    <span className="text-xs font-medium text-slate-400">
                        {components.length} components
                    </span>
                </div>

                <div className="space-y-2">
                    {components.map(
                        (component) => (
                            <div
                                key={
                                    component.id
                                }
                                className="flex items-center justify-between rounded-xl bg-white px-3 py-3"
                            >
                                <div>
                                    <p className="text-sm font-medium text-slate-700">
                                        {
                                            component.name
                                        }
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-400">
                                        {
                                            component.calculationType ===
                                            "fixed"
                                                ? "Fixed amount"
                                                : `${component.value}%`
                                        }
                                        {component.isStatutory
                                            ? " • Statutory"
                                            : ""}
                                    </p>
                                </div>

                                <p
                                    className={`text-sm font-bold ${
                                        type ===
                                        "deduction"
                                            ? "text-red-600"
                                            : type ===
                                                "employer_contribution"
                                              ? "text-blue-600"
                                              : "text-emerald-600"
                                    }`}
                                >
                                    {formatCurrency(
                                        getComponentAmount(
                                            component,
                                            structure
                                        )
                                    )}
                                </p>
                            </div>
                        )
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {renderGroup(
                "Earnings",
                earnings,
                "earning"
            )}

            {renderGroup(
                "Employee Deductions",
                deductions,
                "deduction"
            )}

            {renderGroup(
                "Employer Contributions",
                employer,
                "employer_contribution"
            )}
        </div>
    );
}

export default function SalaryStructuresPage() {
    const [structures, setStructures] =
        useState<SalaryStructure[]>([]);

    const [search, setSearch] =
        useState("");

    const [frequencyFilter, setFrequencyFilter] =
        useState<FrequencyFilter>("all");

    const [selectedStructure, setSelectedStructure] =
        useState<SalaryStructure | null>(null);

    const [editingStructure, setEditingStructure] =
        useState<SalaryStructure | null>(null);

    const [editName, setEditName] =
        useState("");

    const [editCode, setEditCode] =
        useState("");

    const [editDescription, setEditDescription] =
        useState("");

    const [editFrequency, setEditFrequency] =
        useState<SalaryFrequency>("monthly");

    const [editAnnualCtc, setEditAnnualCtc] =
        useState("");

    const [isEditSaving, setIsEditSaving] =
        useState(false);

    useEffect(() => {
        setStructures(
            getSalaryStructures()
        );
    }, []);

    const filteredStructures =
        useMemo(() => {
            return structures.filter(
                (structure) => {
                    const matchesSearch =
                        structure.name
                            .toLowerCase()
                            .includes(
                                search.toLowerCase()
                            ) ||
                        structure.code
                            .toLowerCase()
                            .includes(
                                search.toLowerCase()
                            ) ||
                        structure.description
                            .toLowerCase()
                            .includes(
                                search.toLowerCase()
                            );

                    const matchesFrequency =
                        frequencyFilter ===
                            "all" ||
                        structure.frequency ===
                            frequencyFilter;

                    return (
                        matchesSearch &&
                        matchesFrequency
                    );
                }
            );
        }, [
            structures,
            search,
            frequencyFilter,
        ]);

    const stats = useMemo(() => {
        const activeStructures =
            structures.filter(
                (structure) =>
                    structure.status ===
                    "active"
            );

        const assignedEmployees =
            new Set(
                structures.flatMap(
                    (structure) =>
                        structure.employeeIds ||
                        []
                )
            ).size;

        const averageAnnualCtc =
            structures.length
                ? structures.reduce(
                      (
                          total,
                          structure
                      ) =>
                          total +
                          Number(
                              structure.annualCtc
                          ),
                      0
                  ) /
                  structures.length
                : 0;

        return {
            total: structures.length,
            active: activeStructures.length,
            assigned: assignedEmployees,
            averageAnnualCtc,
        };
    }, [structures]);

    function openEdit(
        structure: SalaryStructure
    ) {
        setEditingStructure(
            structure
        );
        setEditName(
            structure.name
        );
        setEditCode(
            structure.code
        );
        setEditDescription(
            structure.description
        );
        setEditFrequency(
            structure.frequency
        );
        setEditAnnualCtc(
            String(
                structure.annualCtc
            )
        );
    }

    async function saveEdit() {
        if (!editingStructure) {
            return;
        }

        const annualCtc =
            Number(editAnnualCtc);

        if (
            !editName.trim() ||
            !editCode.trim() ||
            !annualCtc ||
            annualCtc <= 0
        ) {
            return;
        }

        setIsEditSaving(true);

        const updated =
            updateSalaryStructure(
                editingStructure.id,
                {
                    name: editName.trim(),
                    code:
                        editCode
                            .trim()
                            .toUpperCase(),
                    description:
                        editDescription.trim(),
                    frequency:
                        editFrequency,
                    annualCtc,
                }
            );

        if (updated) {
            setStructures(
                getSalaryStructures()
            );
            setEditingStructure(
                null
            );
        }

        setIsEditSaving(false);
    }

    function toggleStatus(
        structure: SalaryStructure
    ) {
        const updated =
            updateSalaryStructure(
                structure.id,
                {
                    status:
                        structure.status ===
                        "active"
                            ? "inactive"
                            : "active",
                }
            );

        if (updated) {
            setStructures(
                getSalaryStructures()
            );

            if (
                selectedStructure?.id ===
                updated.id
            ) {
                setSelectedStructure(
                    updated
                );
            }
        }
    }

    return (
        <div className="min-h-screen bg-[#f7f9f8]">
            <div className="mx-auto max-w-[1600px] px-6 py-6">
                <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                                <Layers3
                                    size={20}
                                />
                            </div>

                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                                Payroll
                            </span>
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                            Salary Structures
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Configure compensation,
                            deductions and employer
                            contributions.
                        </p>
                    </div>

                    <Link
                        href="/admin/salary-structures/new"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800"
                    >
                        <Plus
                            size={18}
                        />
                        Create Salary Structure
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
                        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-50" />

                        <div className="relative flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Total Structures
                                </p>

                                <p className="mt-3 text-4xl font-bold text-slate-950">
                                    {
                                        stats.total
                                    }
                                </p>

                                <p className="mt-2 text-sm font-medium text-emerald-600">
                                    Salary configurations
                                </p>
                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                                <Layers3
                                    size={22}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
                        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-50" />

                        <div className="relative flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Active Structures
                                </p>

                                <p className="mt-3 text-4xl font-bold text-slate-950">
                                    {
                                        stats.active
                                    }
                                </p>

                                <p className="mt-2 text-sm font-medium text-blue-600">
                                    Ready for payroll
                                </p>
                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                                <Check
                                    size={22}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
                        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-purple-50" />

                        <div className="relative flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Assigned Employees
                                </p>

                                <p className="mt-3 text-4xl font-bold text-slate-950">
                                    {
                                        stats.assigned
                                    }
                                </p>

                                <p className="mt-2 text-sm font-medium text-purple-600">
                                    Using salary structures
                                </p>
                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500 text-white shadow-lg shadow-purple-500/20">
                                <Users
                                    size={22}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
                        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-orange-50" />

                        <div className="relative flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Average Annual CTC
                                </p>

                                <p className="mt-3 text-3xl font-bold text-slate-950">
                                    {formatCurrency(
                                        stats.averageAnnualCtc
                                    )}
                                </p>

                                <p className="mt-2 text-sm font-medium text-orange-600">
                                    Across all structures
                                </p>
                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
                                ₹
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="relative max-w-xl flex-1">
                            <Search
                                size={20}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                value={
                                    search
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSearch(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Search salary structures..."
                                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {[
                                {
                                    value: "all",
                                    label: "All",
                                },
                                {
                                    value: "monthly",
                                    label: "Monthly",
                                },
                                {
                                    value: "weekly",
                                    label: "Weekly",
                                },
                                {
                                    value: "daily",
                                    label: "Daily",
                                },
                                {
                                    value: "yearly",
                                    label: "Yearly",
                                },
                            ].map(
                                (
                                    filter
                                ) => (
                                    <button
                                        key={
                                            filter.value
                                        }
                                        onClick={() =>
                                            setFrequencyFilter(
                                                filter.value as FrequencyFilter
                                            )
                                        }
                                        className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                                            frequencyFilter ===
                                            filter.value
                                                ? "bg-emerald-950 text-white shadow-lg shadow-emerald-950/10"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
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

                <div className="mt-7">
                    {filteredStructures.length ===
                    0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                <Layers3
                                    size={28}
                                />
                            </div>

                            <h3 className="mt-5 text-lg font-bold text-slate-900">
                                No salary structures found
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                Create a salary
                                structure or
                                change your search
                                filters.
                            </p>

                            <Link
                                href="/admin/salary-structures/new"
                                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white"
                            >
                                <Plus
                                    size={17}
                                />
                                Create Structure
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
                            {filteredStructures.map(
                                (
                                    structure
                                ) => {
                                    const breakdown =
                                        getStructureBreakdown(
                                            structure
                                        );

                                    const accent =
                                        getFrequencyAccent(
                                            structure.frequency
                                        );

                                    return (
                                        <div
                                            key={
                                                structure.id
                                            }
                                            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                                        >
                                            <div className="p-7">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex min-w-0 items-center gap-4">
                                                        <div
                                                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg ${accent.icon}`}
                                                        >
                                                            ₹
                                                        </div>

                                                        <div className="min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <h2 className="truncate text-xl font-bold lowercase text-slate-950">
                                                                    {
                                                                        structure.name
                                                                    }
                                                                </h2>

                                                                <span
                                                                    className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                                                        structure.status ===
                                                                        "active"
                                                                            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                                                                            : "border-slate-200 bg-slate-100 text-slate-500"
                                                                    }`}
                                                                >
                                                                    {
                                                                        structure.status
                                                                    }
                                                                </span>
                                                            </div>

                                                            <p className="mt-1 text-sm font-medium text-slate-400">
                                                                {
                                                                    structure.code
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div
                                                        className={`shrink-0 rounded-2xl px-4 py-3 text-right ${accent.soft}`}
                                                    >
                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                            Frequency
                                                        </p>

                                                        <p className="mt-1 text-sm font-bold text-slate-800">
                                                            {getFrequencyLabel(
                                                                structure.frequency
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <p className="mt-6 min-h-10 text-sm leading-6 text-slate-500">
                                                    {
                                                        structure.description
                                                    }
                                                </p>

                                                <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                            {getFrequencyLabel(
                                                                structure.frequency
                                                            )}{" "}
                                                            CTC
                                                        </p>

                                                        <p className="mt-1 text-3xl font-bold text-slate-950">
                                                            {formatCurrency(
                                                                breakdown.periodCtc
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-5 grid grid-cols-3 gap-3">
                                                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                                                            Earnings
                                                        </p>

                                                        <p className="mt-2 text-lg font-bold text-slate-950">
                                                            {formatCurrency(
                                                                breakdown.earnings
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-2xl border border-red-100 bg-red-50/70 p-4">
                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-red-500">
                                                            Deductions
                                                        </p>

                                                        <p className="mt-2 text-lg font-bold text-slate-950">
                                                            {formatCurrency(
                                                                breakdown.deductions
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                                                            Employees
                                                        </p>

                                                        <p className="mt-2 text-lg font-bold text-slate-950">
                                                            {
                                                                (
                                                                    structure.employeeIds ||
                                                                    []
                                                                ).length
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                                        <Clock3
                                                            size={
                                                                16
                                                            }
                                                        />

                                                        {
                                                            structure
                                                                .components
                                                                .length
                                                        }{" "}
                                                        components
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                setSelectedStructure(
                                                                    structure
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                                                        >
                                                            View
                                                            <ArrowUpRight
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                openEdit(
                                                                    structure
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                                                        >
                                                            <Edit3
                                                                size={
                                                                    15
                                                                }
                                                            />
                                                            Edit
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between border-t border-blue-100 bg-blue-50/70 px-7 py-4">
                                                <p className="text-sm text-blue-700">
                                                    Employer contributions
                                                    included:{" "}
                                                    <span className="font-bold">
                                                        {formatCurrency(
                                                            breakdown.employerContributions
                                                        )}
                                                    </span>
                                                </p>

                                                <button
                                                    onClick={() =>
                                                        toggleStatus(
                                                            structure
                                                        )
                                                    }
                                                    className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                                                        structure.status ===
                                                        "active"
                                                            ? "bg-white text-slate-600"
                                                            : "bg-emerald-600 text-white"
                                                    }`}
                                                >
                                                    {structure.status ===
                                                    "active"
                                                        ? "Deactivate"
                                                        : "Activate"}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    )}
                </div>
            </div>

            {selectedStructure && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
                    <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                                    Salary Structure
                                </p>

                                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                                    {
                                        selectedStructure.name
                                    }
                                </h2>

                                <p className="mt-1 text-sm text-slate-400">
                                    {
                                        selectedStructure.code
                                    }
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setSelectedStructure(
                                        null
                                    )
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
                            >
                                <X
                                    size={20}
                                />
                            </button>
                        </div>

                        <div className="max-h-[calc(90vh-90px)] overflow-y-auto p-6">
                            <div className="grid gap-4 sm:grid-cols-4">
                                <div className="rounded-2xl bg-slate-50 p-4">
                                    <p className="text-xs font-semibold text-slate-400">
                                        Frequency
                                    </p>

                                    <p className="mt-2 font-bold text-slate-900">
                                        {getFrequencyLabel(
                                            selectedStructure.frequency
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-emerald-50 p-4">
                                    <p className="text-xs font-semibold text-emerald-600">
                                        {
                                            getFrequencyLabel(
                                                selectedStructure.frequency
                                            )
                                        }{" "}
                                        CTC
                                    </p>

                                    <p className="mt-2 font-bold text-slate-900">
                                        {formatCurrency(
                                            getStructureBreakdown(
                                                selectedStructure
                                            ).periodCtc
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-red-50 p-4">
                                    <p className="text-xs font-semibold text-red-500">
                                        Deductions
                                    </p>

                                    <p className="mt-2 font-bold text-slate-900">
                                        {formatCurrency(
                                            getStructureBreakdown(
                                                selectedStructure
                                            ).deductions
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-blue-50 p-4">
                                    <p className="text-xs font-semibold text-blue-600">
                                        Net
                                    </p>

                                    <p className="mt-2 font-bold text-slate-900">
                                        {formatCurrency(
                                            getStructureBreakdown(
                                                selectedStructure
                                            ).net
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <ComponentBreakdown
                                    structure={
                                        selectedStructure
                                    }
                                />
                            </div>

                            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400">
                                            Annual CTC
                                        </p>

                                        <p className="mt-1 text-xl font-bold text-slate-950">
                                            {formatCurrency(
                                                selectedStructure.annualCtc
                                            )}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold text-slate-400">
                                            Employees Assigned
                                        </p>

                                        <p className="mt-1 text-xl font-bold text-slate-950">
                                            {
                                                (
                                                    selectedStructure.employeeIds ||
                                                    []
                                                ).length
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {editingStructure && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                                    Edit Structure
                                </p>

                                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                                    Salary Configuration
                                </h2>
                            </div>

                            <button
                                onClick={() =>
                                    setEditingStructure(
                                        null
                                    )
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
                            >
                                <X
                                    size={20}
                                />
                            </button>
                        </div>

                        <div className="space-y-5 p-6">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Structure Name
                                    </label>

                                    <input
                                        value={
                                            editName
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setEditName(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Structure Code
                                    </label>

                                    <input
                                        value={
                                            editCode
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setEditCode(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm uppercase outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Description
                                </label>

                                <textarea
                                    value={
                                        editDescription
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setEditDescription(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    rows={3}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                                />
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Pay Frequency
                                    </label>

                                    <div className="relative">
                                        <select
                                            value={
                                                editFrequency
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setEditFrequency(
                                                    event
                                                        .target
                                                        .value as SalaryFrequency
                                                )
                                            }
                                            className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                                        >
                                            <option value="monthly">
                                                Monthly
                                            </option>

                                            <option value="weekly">
                                                Weekly
                                            </option>

                                            <option value="daily">
                                                Daily
                                            </option>

                                            <option value="yearly">
                                                Yearly
                                            </option>
                                        </select>

                                        <ChevronDown
                                            size={
                                                17
                                            }
                                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Annual CTC
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={
                                            editAnnualCtc
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setEditAnnualCtc(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                                    />
                                </div>
                            </div>

                            <div className="rounded-2xl bg-emerald-50 p-5">
                                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                                    Preview
                                </p>

                                <p className="mt-2 text-3xl font-bold text-slate-950">
                                    {formatCurrency(
                                        getPeriodAmount(
                                            Number(
                                                editAnnualCtc
                                            ) || 0,
                                            editFrequency
                                        )
                                    )}
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    {getFrequencyLabel(
                                        editFrequency
                                    )}{" "}
                                    CTC
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                                <button
                                    onClick={() =>
                                        setEditingStructure(
                                            null
                                        )
                                    }
                                    className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-200"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={
                                        saveEdit
                                    }
                                    disabled={
                                        isEditSaving
                                    }
                                    className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isEditSaving
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}