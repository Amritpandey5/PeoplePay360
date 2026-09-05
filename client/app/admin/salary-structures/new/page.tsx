"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
    ArrowLeft,
    Calculator,
    Check,
    ChevronDown,
    Plus,
    Trash2,
    TrendingDown,
    TrendingUp,
    Users,
    WalletCards,
} from "lucide-react";
import type {
    SalaryCalculationType,
    SalaryComponent,
    SalaryComponentType,
    SalaryFrequency,
} from "@/types/salary-structure";
import {
    createSalaryStructure,
} from "@/lib/salary-structure-storage";

type ComponentForm = {
    id: string;
    name: string;
    type: SalaryComponentType;
    calculationType: SalaryCalculationType;
    value: number;
    isStatutory: boolean;
};

type FormState = {
    name: string;
    code: string;
    description: string;
    frequency: SalaryFrequency;
    annualCtc: string;
};

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Math.max(0, value || 0));
}

function getPeriodAmount(
    annualCtc: number,
    frequency: SalaryFrequency
) {
    if (frequency === "yearly") {
        return annualCtc;
    }

    if (frequency === "monthly") {
        return annualCtc / 12;
    }

    if (frequency === "weekly") {
        return annualCtc / 52;
    }

    return annualCtc / 260;
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

function getDefaultFixedAmount(
    monthlyAmount: number,
    frequency: SalaryFrequency
) {
    if (frequency === "yearly") {
        return monthlyAmount * 12;
    }

    if (frequency === "monthly") {
        return monthlyAmount;
    }

    if (frequency === "weekly") {
        return (monthlyAmount * 12) / 52;
    }

    return (monthlyAmount * 12) / 260;
}

function getComponentAmount(
    component: ComponentForm,
    annualCtc: number,
    frequency: SalaryFrequency,
    allComponents: ComponentForm[]
) {
    const periodCtc =
        getPeriodAmount(
            annualCtc,
            frequency
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
        const gross =
            allComponents
                .filter(
                    (item) =>
                        item.type ===
                            "earning" &&
                        item.id !==
                            component.id
                )
                .reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        getComponentAmount(
                            item,
                            annualCtc,
                            frequency,
                            allComponents
                        ),
                    0
                );

        return (
            gross *
            (Number(component.value) || 0) /
            100
        );
    }

    return 0;
}

function ComponentCard({
    component,
    onChange,
    onRemove,
}: {
    component: ComponentForm;
    onChange: (
        field: keyof ComponentForm,
        value: string | number | boolean
    ) => void;
    onRemove: () => void;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-bold text-slate-900">
                        Salary Component
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        Configure how this component
                        contributes to payroll.
                    </p>
                </div>

                <button
                    onClick={onRemove}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100"
                >
                    <Trash2
                        size={16}
                    />
                </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                        Component Name
                    </label>

                    <input
                        value={
                            component.name
                        }
                        onChange={(
                            event
                        ) =>
                            onChange(
                                "name",
                                event
                                    .target
                                    .value
                            )
                        }
                        placeholder="Basic Salary"
                        className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                        Component Type
                    </label>

                    <div className="relative">
                        <select
                            value={
                                component.type
                            }
                            onChange={(
                                event
                            ) =>
                                onChange(
                                    "type",
                                    event
                                        .target
                                        .value
                                )
                            }
                            className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                        >
                            <option value="earning">
                                Earning
                            </option>

                            <option value="deduction">
                                Employee Deduction
                            </option>

                            <option value="employer_contribution">
                                Employer Contribution
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
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                        Calculation
                    </label>

                    <div className="relative">
                        <select
                            value={
                                component.calculationType
                            }
                            onChange={(
                                event
                            ) =>
                                onChange(
                                    "calculationType",
                                    event
                                        .target
                                        .value
                                )
                            }
                            className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                        >
                            <option value="fixed">
                                Fixed Amount
                            </option>

                            <option value="percentage_basic">
                                % of Basic
                            </option>

                            <option value="percentage_gross">
                                % of Gross
                            </option>

                            <option value="percentage_ctc">
                                % of CTC
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
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                        {component.calculationType ===
                        "fixed"
                            ? "Amount"
                            : "Percentage"}
                    </label>

                    <div className="relative">
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                                component.value
                            }
                            onChange={(
                                event
                            ) =>
                                onChange(
                                    "value",
                                    Number(
                                        event
                                            .target
                                            .value
                                    )
                                )
                            }
                            className="h-12 w-full rounded-xl border border-slate-200 px-4 pr-12 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                        />

                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                            {component.calculationType ===
                            "fixed"
                                ? "₹"
                                : "%"}
                        </span>
                    </div>
                </div>
            </div>

            <label className="mt-5 flex cursor-pointer items-center gap-3">
                <input
                    type="checkbox"
                    checked={
                        component.isStatutory
                    }
                    onChange={(
                        event
                    ) =>
                        onChange(
                            "isStatutory",
                            event
                                .target
                                .checked
                        )
                    }
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />

                <span className="text-sm font-medium text-slate-600">
                    Statutory component
                </span>
            </label>
        </div>
    );
}

export default function NewSalaryStructurePage() {
    const [form, setForm] =
        useState<FormState>({
            name: "",
            code: "",
            description: "",
            frequency: "monthly",
            annualCtc: "720000",
        });

    const [earnings, setEarnings] =
        useState<ComponentForm[]>([
            {
                id: "earning-1",
                name: "Basic Salary",
                type: "earning",
                calculationType:
                    "percentage_ctc",
                value: 50,
                isStatutory: false,
            },
            {
                id: "earning-2",
                name: "HRA",
                type: "earning",
                calculationType:
                    "percentage_basic",
                value: 40,
                isStatutory: false,
            },
            {
                id: "earning-3",
                name: "Special Allowance",
                type: "earning",
                calculationType: "fixed",
                value: 18000,
                isStatutory: false,
            },
        ]);

    const [deductions, setDeductions] =
        useState<ComponentForm[]>([
            {
                id: "deduction-1",
                name: "Employee PF",
                type: "deduction",
                calculationType:
                    "percentage_basic",
                value: 12,
                isStatutory: true,
            },
            {
                id: "deduction-2",
                name: "Professional Tax",
                type: "deduction",
                calculationType: "fixed",
                value: 200,
                isStatutory: true,
            },
        ]);

    const [employerContributions, setEmployerContributions] =
        useState<ComponentForm[]>([
            {
                id: "employer-1",
                name: "Employer PF",
                type: "employer_contribution",
                calculationType:
                    "percentage_basic",
                value: 12,
                isStatutory: true,
            },
        ]);

    const [isSaving, setIsSaving] =
        useState(false);

    const allComponents = useMemo(
        () => [
            ...earnings,
            ...deductions,
            ...employerContributions,
        ],
        [
            earnings,
            deductions,
            employerContributions,
        ]
    );

    const annualCtc =
        Number(form.annualCtc) || 0;

    const preview = useMemo(() => {
        const periodCtc =
            getPeriodAmount(
                annualCtc,
                form.frequency
            );

        const earningTotal =
            earnings.reduce(
                (
                    total,
                    component
                ) =>
                    total +
                    getComponentAmount(
                        component,
                        annualCtc,
                        form.frequency,
                        allComponents
                    ),
                0
            );

        const deductionTotal =
            deductions.reduce(
                (
                    total,
                    component
                ) =>
                    total +
                    getComponentAmount(
                        component,
                        annualCtc,
                        form.frequency,
                        allComponents
                    ),
                0
            );

        const employerTotal =
            employerContributions.reduce(
                (
                    total,
                    component
                ) =>
                    total +
                    getComponentAmount(
                        component,
                        annualCtc,
                        form.frequency,
                        allComponents
                    ),
                0
            );

        return {
            periodCtc,
            earningTotal,
            deductionTotal,
            employerTotal,
            net:
                earningTotal -
                deductionTotal,
            employerCost:
                earningTotal +
                employerTotal,
        };
    }, [
        annualCtc,
        form.frequency,
        earnings,
        deductions,
        employerContributions,
        allComponents,
    ]);

    function updateComponent(
        type: SalaryComponentType,
        id: string,
        field: keyof ComponentForm,
        value: string | number | boolean
    ) {
        const setter =
            type === "earning"
                ? setEarnings
                : type === "deduction"
                  ? setDeductions
                  : setEmployerContributions;

        setter(
            (
                current
            ) =>
                current.map(
                    (
                        component
                    ) =>
                        component.id ===
                        id
                            ? {
                                  ...component,
                                  [field]:
                                      value,
                              }
                            : component
                )
        );
    }

    function addComponent(
        type: SalaryComponentType
    ) {
        const component: ComponentForm =
            {
                id: `${type}-${Date.now()}`,
                name: "",
                type,
                calculationType:
                    "fixed",
                value: 0,
                isStatutory: false,
            };

        if (type === "earning") {
            setEarnings(
                (
                    current
                ) => [
                    ...current,
                    component,
                ]
            );
        }

        if (type === "deduction") {
            setDeductions(
                (
                    current
                ) => [
                    ...current,
                    component,
                ]
            );
        }

        if (
            type ===
            "employer_contribution"
        ) {
            setEmployerContributions(
                (
                    current
                ) => [
                    ...current,
                    component,
                ]
            );
        }
    }

    function removeComponent(
        type: SalaryComponentType,
        id: string
    ) {
        if (type === "earning") {
            setEarnings(
                (
                    current
                ) =>
                    current.filter(
                        (
                            component
                        ) =>
                            component.id !==
                            id
                    )
            );
        }

        if (type === "deduction") {
            setDeductions(
                (
                    current
                ) =>
                    current.filter(
                        (
                            component
                        ) =>
                            component.id !==
                            id
                    )
            );
        }

        if (
            type ===
            "employer_contribution"
        ) {
            setEmployerContributions(
                (
                    current
                ) =>
                    current.filter(
                        (
                            component
                        ) =>
                            component.id !==
                            id
                    )
            );
        }
    }

    function handleFrequencyChange(
        frequency: SalaryFrequency
    ) {
        setForm(
            (
                current
            ) => ({
                ...current,
                frequency,
            })
        );

        if (
            frequency ===
            "monthly"
        ) {
            return;
        }

        setEarnings(
            (
                current
            ) =>
                current.map(
                    (
                        component
                    ) => {
                        if (
                            component.calculationType !==
                            "fixed"
                        ) {
                            return component;
                        }

                        if (
                            component.name ===
                            "Special Allowance"
                        ) {
                            return {
                                ...component,
                                value:
                                    Number(
                                        getDefaultFixedAmount(
                                            18000,
                                            frequency
                                        ).toFixed(
                                            2
                                        )
                                    ),
                            };
                        }

                        return component;
                    }
                )
        );

        setDeductions(
            (
                current
            ) =>
                current.map(
                    (
                        component
                    ) => {
                        if (
                            component.name ===
                            "Professional Tax" &&
                            component.calculationType ===
                                "fixed"
                        ) {
                            return {
                                ...component,
                                value:
                                    Number(
                                        getDefaultFixedAmount(
                                            200,
                                            frequency
                                        ).toFixed(
                                            2
                                        )
                                    ),
                            };
                        }

                        return component;
                    }
                )
        );
    }

    function handleSave() {
        if (
            !form.name.trim() ||
            !form.code.trim() ||
            annualCtc <= 0
        ) {
            alert(
                "Please fill all required fields."
            );
            return;
        }

        if (
            allComponents.some(
                (
                    component
                ) =>
                    !component.name.trim() ||
                    component.value <
                        0
            )
        ) {
            alert(
                "Please complete all salary components."
            );
            return;
        }

        setIsSaving(true);

        const components: SalaryComponent[] =
            allComponents.map(
                (
                    component
                ) => ({
                    ...component,
                })
            );

        createSalaryStructure({
            name: form.name.trim(),
            code:
                form.code
                    .trim()
                    .toUpperCase(),
            description:
                form.description.trim() ||
                "Custom salary structure",
            frequency:
                form.frequency,
            annualCtc,
            components,
            status: "active",
            employeeIds: [],
        });

        window.location.href =
            "/admin/salary-structures";
    }

    return (
        <div className="min-h-screen bg-[#f7f9f8]">
            <div className="mx-auto max-w-[1500px] px-6 py-6">
                <div className="mb-7 flex items-center gap-4">
                    <Link
                        href="/admin/salary-structures"
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
                    >
                        <ArrowLeft
                            size={19}
                        />
                    </Link>

                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                            Payroll Configuration
                        </p>

                        <h1 className="mt-1 text-3xl font-bold text-slate-950">
                            Create Salary Structure
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Build a flexible compensation
                            structure for your employees.
                        </p>
                    </div>
                </div>

                <div className="grid gap-7 xl:grid-cols-[1fr_390px]">
                    <div className="space-y-6">
                        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                    <WalletCards
                                        size={20}
                                    />
                                </div>

                                <div>
                                    <h2 className="font-bold text-slate-950">
                                        Basic Information
                                    </h2>

                                    <p className="text-xs text-slate-400">
                                        Define the structure identity
                                        and payroll frequency.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Structure Name *
                                    </label>

                                    <input
                                        value={
                                            form.name
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    name:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                        placeholder="Standard Employee"
                                        className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Structure Code *
                                    </label>

                                    <input
                                        value={
                                            form.code
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    code:
                                                        event
                                                            .target
                                                            .value
                                                            .toUpperCase(),
                                                })
                                            )
                                        }
                                        placeholder="STD"
                                        className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm uppercase outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Pay Frequency *
                                    </label>

                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                        {[
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
                                                item
                                            ) => (
                                                <button
                                                    key={
                                                        item.value
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        handleFrequencyChange(
                                                            item.value as SalaryFrequency
                                                        )
                                                    }
                                                    className={`rounded-xl border px-3 py-3 text-xs font-bold transition ${
                                                        form.frequency ===
                                                        item.value
                                                            ? "border-emerald-700 bg-emerald-700 text-white"
                                                            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                                                    }`}
                                                >
                                                    {
                                                        item.label
                                                    }
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Annual CTC *
                                    </label>

                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                                            ₹
                                        </span>

                                        <input
                                            type="number"
                                            min="0"
                                            value={
                                                form.annualCtc
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setForm(
                                                    (
                                                        current
                                                    ) => ({
                                                        ...current,
                                                        annualCtc:
                                                            event
                                                                .target
                                                                .value,
                                                    })
                                                )
                                            }
                                            className="h-12 w-full rounded-xl border border-slate-200 pl-9 pr-4 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Description
                                </label>

                                <textarea
                                    rows={3}
                                    value={
                                        form.description
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setForm(
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
                                    placeholder="Describe this salary structure..."
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                                />
                            </div>
                        </div>

                        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/40 p-7">
                            <div className="mb-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
                                        <TrendingUp
                                            size={20}
                                        />
                                    </div>

                                    <div>
                                        <h2 className="font-bold text-slate-950">
                                            Earnings
                                        </h2>

                                        <p className="text-xs text-slate-500">
                                            Components added to employee
                                            gross pay.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        addComponent(
                                            "earning"
                                        )
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800"
                                >
                                    <Plus
                                        size={15}
                                    />
                                    Add
                                </button>
                            </div>

                            <div className="space-y-4">
                                {earnings.map(
                                    (
                                        component
                                    ) => (
                                        <ComponentCard
                                            key={
                                                component.id
                                            }
                                            component={
                                                component
                                            }
                                            onChange={(
                                                field,
                                                value
                                            ) =>
                                                updateComponent(
                                                    "earning",
                                                    component.id,
                                                    field,
                                                    value
                                                )
                                            }
                                            onRemove={() =>
                                                removeComponent(
                                                    "earning",
                                                    component.id
                                                )
                                            }
                                        />
                                    )
                                )}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-red-100 bg-red-50/40 p-7">
                            <div className="mb-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500 text-white">
                                        <TrendingDown
                                            size={20}
                                        />
                                    </div>

                                    <div>
                                        <h2 className="font-bold text-slate-950">
                                            Employee Deductions
                                        </h2>

                                        <p className="text-xs text-slate-500">
                                            Amounts deducted from employee
                                            payroll.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        addComponent(
                                            "deduction"
                                        )
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700"
                                >
                                    <Plus
                                        size={15}
                                    />
                                    Add
                                </button>
                            </div>

                            <div className="space-y-4">
                                {deductions.map(
                                    (
                                        component
                                    ) => (
                                        <ComponentCard
                                            key={
                                                component.id
                                            }
                                            component={
                                                component
                                            }
                                            onChange={(
                                                field,
                                                value
                                            ) =>
                                                updateComponent(
                                                    "deduction",
                                                    component.id,
                                                    field,
                                                    value
                                                )
                                            }
                                            onRemove={() =>
                                                removeComponent(
                                                    "deduction",
                                                    component.id
                                                )
                                            }
                                        />
                                    )
                                )}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-blue-100 bg-blue-50/40 p-7">
                            <div className="mb-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500 text-white">
                                        <Users
                                            size={20}
                                        />
                                    </div>

                                    <div>
                                        <h2 className="font-bold text-slate-950">
                                            Employer Contributions
                                        </h2>

                                        <p className="text-xs text-slate-500">
                                            Employer-side payroll costs.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        addComponent(
                                            "employer_contribution"
                                        )
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700"
                                >
                                    <Plus
                                        size={15}
                                    />
                                    Add
                                </button>
                            </div>

                            <div className="space-y-4">
                                {employerContributions.map(
                                    (
                                        component
                                    ) => (
                                        <ComponentCard
                                            key={
                                                component.id
                                            }
                                            component={
                                                component
                                            }
                                            onChange={(
                                                field,
                                                value
                                            ) =>
                                                updateComponent(
                                                    "employer_contribution",
                                                    component.id,
                                                    field,
                                                    value
                                                )
                                            }
                                            onRemove={() =>
                                                removeComponent(
                                                    "employer_contribution",
                                                    component.id
                                                )
                                            }
                                        />
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="xl:sticky xl:top-6 xl:h-fit">
                        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
                            <div className="bg-emerald-950 p-7 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                                        <Calculator
                                            size={20}
                                        />
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                                            Live Preview
                                        </p>

                                        <h2 className="mt-1 text-xl font-bold">
                                            Payroll Summary
                                        </h2>
                                    </div>
                                </div>

                                <div className="mt-7 rounded-2xl bg-white/10 p-5">
                                    <p className="text-xs font-medium text-emerald-200">
                                        {getFrequencyLabel(
                                            form.frequency
                                        )}{" "}
                                        CTC
                                    </p>

                                    <p className="mt-2 text-4xl font-bold">
                                        {formatCurrency(
                                            preview.periodCtc
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 p-6">
                                <div className="flex items-center justify-between rounded-2xl bg-emerald-50 p-4">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                                            Earnings
                                        </p>

                                        <p className="mt-1 text-lg font-bold text-slate-950">
                                            {formatCurrency(
                                                preview.earningTotal
                                            )}
                                        </p>
                                    </div>

                                    <TrendingUp
                                        size={
                                            20
                                        }
                                        className="text-emerald-500"
                                    />
                                </div>

                                <div className="flex items-center justify-between rounded-2xl bg-red-50 p-4">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-red-500">
                                            Deductions
                                        </p>

                                        <p className="mt-1 text-lg font-bold text-slate-950">
                                            {formatCurrency(
                                                preview.deductionTotal
                                            )}
                                        </p>
                                    </div>

                                    <TrendingDown
                                        size={
                                            20
                                        }
                                        className="text-red-500"
                                    />
                                </div>

                                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Net Pay
                                        </p>

                                        <p className="mt-1 text-xl font-bold text-slate-950">
                                            {formatCurrency(
                                                preview.net
                                            )}
                                        </p>
                                    </div>

                                    <WalletCards
                                        size={
                                            20
                                        }
                                        className="text-slate-500"
                                    />
                                </div>

                                <div className="flex items-center justify-between rounded-2xl bg-blue-50 p-4">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                                            Employer Contribution
                                        </p>

                                        <p className="mt-1 text-lg font-bold text-slate-950">
                                            {formatCurrency(
                                                preview.employerTotal
                                            )}
                                        </p>
                                    </div>

                                    <Users
                                        size={
                                            20
                                        }
                                        className="text-blue-500"
                                    />
                                </div>

                                <div className="mt-4 border-t border-slate-100 pt-5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-slate-500">
                                            Total Employer Cost
                                        </span>

                                        <span className="text-lg font-bold text-slate-950">
                                            {formatCurrency(
                                                preview.employerCost
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                                    <p className="text-xs leading-5 text-amber-700">
                                        Statutory calculations should
                                        ultimately be controlled by
                                        your payroll rules and
                                        applicable company policy.
                                    </p>
                                </div>

                                <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                                    <Check
                                        size={
                                            15
                                        }
                                        className="text-emerald-600"
                                    />
                                    Employees can be assigned after
                                    creating this structure.
                                </div>

                                <div className="mt-6 flex gap-3">
                                    <Link
                                        href="/admin/salary-structures"
                                        className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-bold text-slate-600 hover:bg-slate-200"
                                    >
                                        Cancel
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={
                                            handleSave
                                        }
                                        disabled={
                                            isSaving
                                        }
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <Check
                                            size={
                                                17
                                            }
                                        />
                                        {isSaving
                                            ? "Saving..."
                                            : "Create Structure"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}