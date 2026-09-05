"use client";

import Link from "next/link";
import {
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    ArrowRight,
    Calculator,
    CheckCircle2,
    CircleDollarSign,
    Clock3,
    Edit3,
    FileText,
    Filter,
    Landmark,
    Plus,
    Search,
    ShieldCheck,
    Trash2,
    TrendingDown,
    TrendingUp,
    X,
} from "lucide-react";
import type {
    SalaryRule,
    SalaryRuleCalculation,
    SalaryRuleFrequency,
    SalaryRuleType,
} from "@/types/salary-rule";
import {
    deleteSalaryRule,
    getSalaryRules,
    updateSalaryRule,
} from "@/lib/salary-rule-storage";

const typeConfig: Record<
    SalaryRuleType,
    {
        label: string;
        icon: typeof TrendingDown;
        className: string;
    }
> = {
    deduction: {
        label: "Deduction",
        icon: TrendingDown,
        className:
            "bg-red-50 text-red-600 border-red-100",
    },
    employer_contribution: {
        label: "Employer Contribution",
        icon: Landmark,
        className:
            "bg-blue-50 text-blue-600 border-blue-100",
    },
    earning: {
        label: "Earning",
        icon: TrendingUp,
        className:
            "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    tax: {
        label: "Tax",
        icon: Calculator,
        className:
            "bg-orange-50 text-orange-600 border-orange-100",
    },
};

const calculationLabels: Record<
    SalaryRuleCalculation,
    string
> = {
    fixed: "Fixed Amount",
    percentage_basic: "% of Basic",
    percentage_gross: "% of Gross",
    percentage_ctc: "% of CTC",
    slab: "Slab Based",
};

const frequencyLabels: Record<
    SalaryRuleFrequency,
    string
> = {
    monthly: "Monthly",
    weekly: "Weekly",
    daily: "Daily",
    yearly: "Yearly",
};

function formatCurrency(value: number) {
    return `₹${value.toLocaleString("en-IN")}`;
}

function formatRuleValue(rule: SalaryRule) {
    if (rule.calculation === "fixed") {
        return formatCurrency(rule.value);
    }

    if (rule.calculation === "slab") {
        return "Slab based";
    }

    return `${rule.value}%`;
}

export default function SalaryRulesPage() {
    const [rules, setRules] = useState<
        SalaryRule[]
    >([]);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] =
        useState<"all" | SalaryRuleType>("all");
    const [frequencyFilter, setFrequencyFilter] =
        useState<
            "all" | SalaryRuleFrequency
        >("all");
    const [selectedRule, setSelectedRule] =
        useState<SalaryRule | null>(null);
    const [editingRule, setEditingRule] =
        useState<SalaryRule | null>(null);

    useEffect(() => {
        setRules(getSalaryRules());
    }, []);

    const filteredRules = useMemo(() => {
        return rules.filter((rule) => {
            const searchMatch =
                rule.name
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                rule.code
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const typeMatch =
                typeFilter === "all" ||
                rule.type === typeFilter;

            const frequencyMatch =
                frequencyFilter === "all" ||
                rule.frequency ===
                    frequencyFilter;

            return (
                searchMatch &&
                typeMatch &&
                frequencyMatch
            );
        });
    }, [
        rules,
        search,
        typeFilter,
        frequencyFilter,
    ]);

    const activeRules = rules.filter(
        (rule) => rule.status === "active"
    ).length;

    const statutoryRules = rules.filter(
        (rule) => rule.isStatutory
    ).length;

    const deductionRules = rules.filter(
        (rule) => rule.type === "deduction"
    ).length;

    const employerRules = rules.filter(
        (rule) =>
            rule.type ===
            "employer_contribution"
    ).length;

    function toggleStatus(rule: SalaryRule) {
        const updated = updateSalaryRule(
            rule.id,
            {
                status:
                    rule.status === "active"
                        ? "inactive"
                        : "active",
            }
        );

        if (!updated) {
            return;
        }

        setRules(getSalaryRules());
    }

    function handleDelete(rule: SalaryRule) {
        const confirmed =
            window.confirm(
                `Delete ${rule.name}?`
            );

        if (!confirmed) {
            return;
        }

        deleteSalaryRule(rule.id);
        setRules(getSalaryRules());

        if (
            selectedRule?.id === rule.id
        ) {
            setSelectedRule(null);
        }
    }

    function handleEditSave(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!editingRule) {
            return;
        }

        const formData = new FormData(
            event.currentTarget
        );

        const updated = updateSalaryRule(
            editingRule.id,
            {
                name:
                    String(
                        formData.get("name")
                    ).trim(),
                code:
                    String(
                        formData.get("code")
                    ).trim(),
                description:
                    String(
                        formData.get(
                            "description"
                        )
                    ).trim(),
                value:
                    Number(
                        formData.get("value")
                    ) || 0,
                maximumCap:
                    formData.get(
                        "maximumCap"
                    )
                        ? Number(
                              formData.get(
                                  "maximumCap"
                              )
                          )
                        : null,
                minimumSalary:
                    formData.get(
                        "minimumSalary"
                    )
                        ? Number(
                              formData.get(
                                  "minimumSalary"
                              )
                          )
                        : null,
                priority:
                    Number(
                        formData.get(
                            "priority"
                        )
                    ) || 1,
                effectiveFrom:
                    String(
                        formData.get(
                            "effectiveFrom"
                        )
                    ),
            }
        );

        if (!updated) {
            return;
        }

        setRules(getSalaryRules());
        setEditingRule(null);
    }

    return (
        <div className="min-h-screen bg-[#f7f9f8]">
            <div className="mx-auto max-w-[1600px] px-6 py-7">
                <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-600">
                            <ShieldCheck size={17} />
                            Payroll Configuration
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Salary Rules
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Configure payroll calculation rules,
                            deductions, taxes and employer
                            contributions.
                        </p>
                    </div>

                    <Link
                        href="/admin/salary-rules/new"
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#064e3b] px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-[#053f31]"
                    >
                        <Plus size={18} />
                        Create Salary Rule
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-5 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Total Rules
                                </p>
                                <h2 className="mt-3 text-3xl font-bold text-slate-900">
                                    {rules.length}
                                </h2>
                            </div>
                            <div className="rounded-2xl bg-emerald-500 p-3 text-white shadow-lg shadow-emerald-500/20">
                                <FileText size={22} />
                            </div>
                        </div>
                        <p className="mt-3 text-xs font-medium text-emerald-600">
                            Payroll calculation rules
                        </p>
                    </div>

                    <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-5 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Active Rules
                                </p>
                                <h2 className="mt-3 text-3xl font-bold text-slate-900">
                                    {activeRules}
                                </h2>
                            </div>
                            <div className="rounded-2xl bg-blue-500 p-3 text-white shadow-lg shadow-blue-500/20">
                                <CheckCircle2 size={22} />
                            </div>
                        </div>
                        <p className="mt-3 text-xs font-medium text-blue-600">
                            Ready for payroll
                        </p>
                    </div>

                    <div className="relative overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-white to-orange-50 p-5 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Statutory Rules
                                </p>
                                <h2 className="mt-3 text-3xl font-bold text-slate-900">
                                    {statutoryRules}
                                </h2>
                            </div>
                            <div className="rounded-2xl bg-orange-500 p-3 text-white shadow-lg shadow-orange-500/20">
                                <Landmark size={22} />
                            </div>
                        </div>
                        <p className="mt-3 text-xs font-medium text-orange-600">
                            Compliance configured
                        </p>
                    </div>

                    <div className="relative overflow-hidden rounded-3xl border border-purple-100 bg-gradient-to-br from-white to-purple-50 p-5 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Employer Rules
                                </p>
                                <h2 className="mt-3 text-3xl font-bold text-slate-900">
                                    {employerRules}
                                </h2>
                            </div>
                            <div className="rounded-2xl bg-purple-500 p-3 text-white shadow-lg shadow-purple-500/20">
                                <CircleDollarSign size={22} />
                            </div>
                        </div>
                        <p className="mt-3 text-xs font-medium text-purple-600">
                            Company contributions
                        </p>
                    </div>
                </div>

                <div className="mt-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="relative w-full max-w-xl">
                            <Search
                                size={19}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search salary rules..."
                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <Filter size={16} />
                                Filters
                            </div>

                            {(
                                [
                                    ["all", "All"],
                                    [
                                        "deduction",
                                        "Deductions",
                                    ],
                                    [
                                        "employer_contribution",
                                        "Employer",
                                    ],
                                    [
                                        "earning",
                                        "Earnings",
                                    ],
                                    ["tax", "Tax"],
                                ] as const
                            ).map(
                                (item) => (
                                    <button
                                        key={item[0]}
                                        onClick={() =>
                                            setTypeFilter(
                                                item[0]
                                            )}
                                        className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                                            typeFilter ===
                                            item[0]
                                                ? "bg-[#064e3b] text-white"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                    >
                                        {item[1]}
                                    </button>
                                )
                            )}

                            {(
                                [
                                    ["all", "All Frequency"],
                                    [
                                        "monthly",
                                        "Monthly",
                                    ],
                                    [
                                        "weekly",
                                        "Weekly",
                                    ],
                                    [
                                        "daily",
                                        "Daily",
                                    ],
                                    [
                                        "yearly",
                                        "Yearly",
                                    ],
                                ] as const
                            ).map(
                                (item) => (
                                    <button
                                        key={item[0]}
                                        onClick={() =>
                                            setFrequencyFilter(
                                                item[0]
                                            )}
                                        className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                                            frequencyFilter ===
                                            item[0]
                                                ? "bg-slate-800 text-white"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                    >
                                        {item[1]}
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {filteredRules.length === 0 ? (
                    <div className="mt-7 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                            <FileText size={28} />
                        </div>
                        <h3 className="mt-5 text-lg font-semibold text-slate-900">
                            No salary rules found
                        </h3>
                        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                            Create your first payroll rule to
                            start configuring salary calculations.
                        </p>
                        <Link
                            href="/admin/salary-rules/new"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#064e3b] px-5 py-3 text-sm font-semibold text-white"
                        >
                            <Plus size={17} />
                            Create Salary Rule
                        </Link>
                    </div>
                ) : (
                    <div className="mt-7 grid grid-cols-1 gap-5 xl:grid-cols-2">
                        {filteredRules.map(
                            (rule) => {
                                const config =
                                    typeConfig[
                                        rule.type
                                    ];
                                const TypeIcon =
                                    config.icon;

                                return (
                                    <div
                                        key={
                                            rule.id
                                        }
                                        className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
                                    >
                                        <div className="p-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex min-w-0 items-center gap-4">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#064e3b] text-white shadow-lg shadow-emerald-900/10">
                                                        <TypeIcon
                                                            size={
                                                                22
                                                            }
                                                        />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="text-lg font-bold text-slate-900">
                                                                {
                                                                    rule.name
                                                                }
                                                            </h3>
                                                            <span
                                                                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                                                                    rule.status ===
                                                                    "active"
                                                                        ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                                                                        : "border-slate-200 bg-slate-100 text-slate-500"
                                                                }`}
                                                            >
                                                                {
                                                                    rule.status
                                                                }
                                                            </span>
                                                        </div>
                                                        <p className="mt-1 text-sm text-slate-400">
                                                            {
                                                                rule.code
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() =>
                                                        toggleStatus(
                                                            rule
                                                        )
                                                    }
                                                    className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                                                        rule.status ===
                                                        "active"
                                                            ? "bg-emerald-50 text-emerald-600"
                                                            : "bg-slate-100 text-slate-500"
                                                    }`}
                                                >
                                                    {rule.status ===
                                                    "active"
                                                        ? "Active"
                                                        : "Inactive"}
                                                </button>
                                            </div>

                                            <p className="mt-5 line-clamp-2 text-sm leading-6 text-slate-500">
                                                {
                                                    rule.description
                                                }
                                            </p>

                                            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                                                <div className="rounded-2xl bg-slate-50 p-4">
                                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                        Type
                                                    </p>
                                                    <p className="mt-2 text-sm font-semibold text-slate-800">
                                                        {
                                                            config.label
                                                        }
                                                    </p>
                                                </div>

                                                <div className="rounded-2xl bg-emerald-50 p-4">
                                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-500">
                                                        Value
                                                    </p>
                                                    <p className="mt-2 text-sm font-bold text-emerald-700">
                                                        {formatRuleValue(
                                                            rule
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="rounded-2xl bg-blue-50 p-4">
                                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-500">
                                                        Frequency
                                                    </p>
                                                    <p className="mt-2 text-sm font-semibold text-blue-700">
                                                        {
                                                            frequencyLabels[
                                                                rule.frequency
                                                            ]
                                                        }
                                                    </p>
                                                </div>

                                                <div className="rounded-2xl bg-purple-50 p-4">
                                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-purple-500">
                                                        Calculation
                                                    </p>
                                                    <p className="mt-2 text-sm font-semibold text-purple-700">
                                                        {
                                                            calculationLabels[
                                                                rule.calculation
                                                            ]
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                                {rule.isStatutory && (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 font-semibold text-orange-600">
                                                        <ShieldCheck
                                                            size={
                                                                14
                                                            }
                                                        />
                                                        Statutory
                                                    </span>
                                                )}

                                                {rule.maximumCap !==
                                                    null && (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
                                                        Cap:{" "}
                                                        {formatCurrency(
                                                            rule.maximumCap
                                                        )}
                                                    </span>
                                                )}

                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
                                                    <Clock3
                                                        size={
                                                            14
                                                        }
                                                    />
                                                    From{" "}
                                                    {rule.effectiveFrom ||
                                                        "Not set"}
                                                </span>
                                            </div>

                                            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                                                <button
                                                    onClick={() =>
                                                        setSelectedRule(
                                                            rule
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                                                >
                                                    View Rule
                                                    <ArrowRight
                                                        size={
                                                            16
                                                        }
                                                    />
                                                </button>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            setEditingRule(
                                                                rule
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
                                                    >
                                                        <Edit3
                                                            size={
                                                                16
                                                            }
                                                        />
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                rule
                                                            )
                                                        }
                                                        className="rounded-xl bg-red-50 p-2.5 text-red-500 hover:bg-red-100"
                                                    >
                                                        <Trash2
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        )}
                    </div>
                )}

                <div className="mt-7 rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white p-5">
                    <div className="flex gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
                            <Calculator size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">
                                Payroll calculation engine
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                Salary rules will be applied during
                                Pay Run calculation. Statutory
                                thresholds and compliance values
                                should be configured according to
                                the applicable rules and company
                                policy.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {selectedRule && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-5 backdrop-blur-sm">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 p-6">
                            <div>
                                <p className="text-sm font-medium text-emerald-600">
                                    Salary Rule
                                </p>
                                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                                    {
                                        selectedRule.name
                                    }
                                </h2>
                            </div>
                            <button
                                onClick={() =>
                                    setSelectedRule(
                                        null
                                    )
                                }
                                className="rounded-xl bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-3">
                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs text-slate-400">
                                    Code
                                </p>
                                <p className="mt-2 font-semibold text-slate-800">
                                    {
                                        selectedRule.code
                                    }
                                </p>
                            </div>

                            <div className="rounded-2xl bg-emerald-50 p-4">
                                <p className="text-xs text-emerald-500">
                                    Value
                                </p>
                                <p className="mt-2 font-bold text-emerald-700">
                                    {formatRuleValue(
                                        selectedRule
                                    )}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-blue-50 p-4">
                                <p className="text-xs text-blue-500">
                                    Frequency
                                </p>
                                <p className="mt-2 font-semibold text-blue-700">
                                    {
                                        frequencyLabels[
                                            selectedRule.frequency
                                        ]
                                    }
                                </p>
                            </div>

                            <div className="rounded-2xl bg-purple-50 p-4">
                                <p className="text-xs text-purple-500">
                                    Calculation
                                </p>
                                <p className="mt-2 font-semibold text-purple-700">
                                    {
                                        calculationLabels[
                                            selectedRule.calculation
                                        ]
                                    }
                                </p>
                            </div>

                            <div className="rounded-2xl bg-orange-50 p-4">
                                <p className="text-xs text-orange-500">
                                    Minimum Salary
                                </p>
                                <p className="mt-2 font-semibold text-orange-700">
                                    {selectedRule.minimumSalary !==
                                    null
                                        ? formatCurrency(
                                              selectedRule.minimumSalary
                                          )
                                        : "No minimum"}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-red-50 p-4">
                                <p className="text-xs text-red-500">
                                    Maximum Cap
                                </p>
                                <p className="mt-2 font-semibold text-red-700">
                                    {selectedRule.maximumCap !==
                                    null
                                        ? formatCurrency(
                                              selectedRule.maximumCap
                                          )
                                        : "No cap"}
                                </p>
                            </div>
                        </div>

                        <div className="px-6 pb-6">
                            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Description
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {
                                        selectedRule.description
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {editingRule && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-5 backdrop-blur-sm">
                    <form
                        onSubmit={
                            handleEditSave
                        }
                        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 p-6">
                            <div>
                                <p className="text-sm font-medium text-emerald-600">
                                    Edit Rule
                                </p>
                                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                                    {
                                        editingRule.name
                                    }
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setEditingRule(
                                        null
                                    )
                                }
                                className="rounded-xl bg-slate-100 p-2 text-slate-500"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid gap-5 p-6 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-semibold text-slate-700">
                                    Rule Name
                                </label>
                                <input
                                    name="name"
                                    defaultValue={
                                        editingRule.name
                                    }
                                    required
                                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700">
                                    Rule Code
                                </label>
                                <input
                                    name="code"
                                    defaultValue={
                                        editingRule.code
                                    }
                                    required
                                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700">
                                    Value
                                </label>
                                <input
                                    name="value"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    defaultValue={
                                        editingRule.value
                                    }
                                    required
                                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700">
                                    Priority
                                </label>
                                <input
                                    name="priority"
                                    type="number"
                                    min="1"
                                    defaultValue={
                                        editingRule.priority
                                    }
                                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700">
                                    Maximum Cap
                                </label>
                                <input
                                    name="maximumCap"
                                    type="number"
                                    min="0"
                                    defaultValue={
                                        editingRule.maximumCap ??
                                        ""
                                    }
                                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700">
                                    Minimum Salary
                                </label>
                                <input
                                    name="minimumSalary"
                                    type="number"
                                    min="0"
                                    defaultValue={
                                        editingRule.minimumSalary ??
                                        ""
                                    }
                                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700">
                                    Effective From
                                </label>
                                <input
                                    name="effectiveFrom"
                                    type="date"
                                    defaultValue={
                                        editingRule.effectiveFrom
                                    }
                                    required
                                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    defaultValue={
                                        editingRule.description
                                    }
                                    rows={4}
                                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-emerald-400"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-100 p-6">
                            <button
                                type="button"
                                onClick={() =>
                                    setEditingRule(
                                        null
                                    )
                                }
                                className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="rounded-xl bg-[#064e3b] px-5 py-3 text-sm font-semibold text-white"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}