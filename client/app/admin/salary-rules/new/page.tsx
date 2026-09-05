"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
    ArrowLeft,
    Calculator,
    Check,
    Info,
    Landmark,
    Percent,
    Save,
    ShieldCheck,
    WalletCards,
} from "lucide-react";
import {
    createSalaryRule,
} from "@/lib/salary-rule-storage";
import type {
    SalaryRuleCalculation,
    SalaryRuleFrequency,
    SalaryRuleType,
} from "@/types/salary-rule";

const inputClass =
    "mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10";

export default function NewSalaryRulePage() {
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [description, setDescription] =
        useState("");
    const [type, setType] =
        useState<SalaryRuleType>("deduction");
    const [calculation, setCalculation] =
        useState<SalaryRuleCalculation>(
            "percentage_basic"
        );
    const [value, setValue] = useState("12");
    const [maximumCap, setMaximumCap] =
        useState("");
    const [minimumSalary, setMinimumSalary] =
        useState("");
    const [frequency, setFrequency] =
        useState<SalaryRuleFrequency>("monthly");
    const [isStatutory, setIsStatutory] =
        useState(false);
    const [effectiveFrom, setEffectiveFrom] =
        useState(
            new Date()
                .toISOString()
                .split("T")[0]
        );
    const [priority, setPriority] =
        useState("1");
    const [error, setError] = useState("");

    const preview = useMemo(() => {
        const numericValue =
            Number(value) || 0;

        const sampleBasic = 30000;
        const sampleGross = 60000;
        const sampleCtc = 720000;

        let amount = 0;

        if (
            calculation === "percentage_basic"
        ) {
            amount =
                sampleBasic *
                (numericValue / 100);
        }

        if (
            calculation === "percentage_gross"
        ) {
            amount =
                sampleGross *
                (numericValue / 100);
        }

        if (
            calculation === "percentage_ctc"
        ) {
            amount =
                (sampleCtc / 12) *
                (numericValue / 100);
        }

        if (calculation === "fixed") {
            amount = numericValue;
        }

        return amount;
    }, [value, calculation]);

    function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        setError("");

        if (!name.trim()) {
            setError(
                "Please enter a rule name."
            );
            return;
        }

        if (!code.trim()) {
            setError(
                "Please enter a rule code."
            );
            return;
        }

        if ((Number(value) || 0) < 0) {
            setError(
                "Rule value cannot be negative."
            );
            return;
        }

        if (
            maximumCap &&
            Number(maximumCap) < 0
        ) {
            setError(
                "Maximum cap cannot be negative."
            );
            return;
        }

        if (
            minimumSalary &&
            Number(minimumSalary) < 0
        ) {
            setError(
                "Minimum salary cannot be negative."
            );
            return;
        }

        createSalaryRule({
            name: name.trim(),
            code: code
                .trim()
                .toUpperCase(),
            description:
                description.trim(),
            type,
            calculation,
            value:
                Number(value) || 0,
            maximumCap:
                maximumCap
                    ? Number(
                          maximumCap
                      )
                    : null,
            minimumSalary:
                minimumSalary
                    ? Number(
                          minimumSalary
                      )
                    : null,
            frequency,
            isStatutory,
            status: "active",
            effectiveFrom,
            priority:
                Number(priority) || 1,
        });

        window.location.href =
            "/admin/salary-rules";
    }

    return (
        <div className="min-h-screen bg-[#f7f9f8]">
            <div className="mx-auto max-w-[1500px] px-6 py-7">
                <div className="mb-7 flex items-center gap-4">
                    <Link
                        href="/admin/salary-rules"
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                    >
                        <ArrowLeft size={19} />
                    </Link>

                    <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                            <ShieldCheck
                                size={16}
                            />
                            Payroll Configuration
                        </div>

                        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                            Create Salary Rule
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Define how a payroll component
                            should be calculated.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_390px]"
                >
                    <div className="space-y-6">
                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-6 flex items-center gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                    <WalletCards
                                        size={21}
                                    />
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Basic Information
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Identify this payroll rule.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-semibold text-slate-700">
                                        Rule Name
                                    </label>
                                    <input
                                        value={name}
                                        onChange={(event) =>
                                            setName(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Employee Provident Fund"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-slate-700">
                                        Rule Code
                                    </label>
                                    <input
                                        value={code}
                                        onChange={(event) =>
                                            setCode(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="EMP_PF"
                                        className={inputClass}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-sm font-semibold text-slate-700">
                                        Description
                                    </label>
                                    <textarea
                                        value={
                                            description
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setDescription(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        rows={4}
                                        placeholder="Describe how this rule is applied..."
                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-6 flex items-center gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                    <Calculator
                                        size={21}
                                    />
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Calculation
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Define how the amount should
                                        be calculated.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-semibold text-slate-700">
                                        Rule Type
                                    </label>

                                    <select
                                        value={type}
                                        onChange={(event) =>
                                            setType(
                                                event
                                                    .target
                                                    .value as SalaryRuleType
                                            )
                                        }
                                        className={inputClass}
                                    >
                                        <option value="deduction">
                                            Deduction
                                        </option>
                                        <option value="earning">
                                            Earning
                                        </option>
                                        <option value="employer_contribution">
                                            Employer Contribution
                                        </option>
                                        <option value="tax">
                                            Tax
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-slate-700">
                                        Calculation Method
                                    </label>

                                    <select
                                        value={
                                            calculation
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setCalculation(
                                                event
                                                    .target
                                                    .value as SalaryRuleCalculation
                                            )
                                        }
                                        className={inputClass}
                                    >
                                        <option value="fixed">
                                            Fixed Amount
                                        </option>
                                        <option value="percentage_basic">
                                            Percentage of Basic
                                        </option>
                                        <option value="percentage_gross">
                                            Percentage of Gross
                                        </option>
                                        <option value="percentage_ctc">
                                            Percentage of CTC
                                        </option>
                                        <option value="slab">
                                            Slab Based
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-slate-700">
                                        {calculation ===
                                        "fixed"
                                            ? "Amount"
                                            : calculation ===
                                                "slab"
                                              ? "Base Value"
                                              : "Percentage"}
                                    </label>

                                    <div className="relative mt-2">
                                        {calculation !==
                                            "percentage_basic" &&
                                            calculation !==
                                                "percentage_gross" &&
                                            calculation !==
                                                "percentage_ctc" && (
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                    ₹
                                                </span>
                                            )}

                                        {calculation !==
                                            "fixed" &&
                                            calculation !==
                                                "slab" && (
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                    %
                                                </span>
                                            )}

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={value}
                                            onChange={(
                                                event
                                            ) =>
                                                setValue(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            className={`${inputClass} ${
                                                calculation ===
                                                    "fixed" ||
                                                calculation ===
                                                    "slab"
                                                    ? "pl-9"
                                                    : "pr-10"
                                            }`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-slate-700">
                                        Frequency
                                    </label>

                                    <select
                                        value={
                                            frequency
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setFrequency(
                                                event
                                                    .target
                                                    .value as SalaryRuleFrequency
                                            )
                                        }
                                        className={inputClass}
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
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-slate-700">
                                        Minimum Salary
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={
                                            minimumSalary
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setMinimumSalary(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Optional"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-slate-700">
                                        Maximum Cap
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={
                                            maximumCap
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setMaximumCap(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Optional"
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-6 flex items-center gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                                    <Landmark
                                        size={21}
                                    />
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Rule Settings
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Configure applicability and
                                        priority.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-semibold text-slate-700">
                                        Effective From
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            effectiveFrom
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setEffectiveFrom(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-slate-700">
                                        Priority
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        value={priority}
                                        onChange={(
                                            event
                                        ) =>
                                            setPriority(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setIsStatutory(
                                        !isStatutory
                                    )
                                }
                                className={`mt-6 flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                                    isStatutory
                                        ? "border-orange-200 bg-orange-50"
                                        : "border-slate-200 bg-slate-50"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                            isStatutory
                                                ? "bg-orange-500 text-white"
                                                : "bg-white text-slate-400"
                                        }`}
                                    >
                                        <ShieldCheck
                                            size={
                                                19
                                            }
                                        />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            Statutory Rule
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Mark this rule as a
                                            statutory/compliance
                                            component.
                                        </p>
                                    </div>
                                </div>

                                <div
                                    className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                                        isStatutory
                                            ? "border-orange-500 bg-orange-500 text-white"
                                            : "border-slate-300 bg-white"
                                    }`}
                                >
                                    {isStatutory && (
                                        <Check
                                            size={
                                                14
                                            }
                                        />
                                    )}
                                </div>
                            </button>
                        </section>

                        <div className="flex items-center justify-end gap-3">
                            <Link
                                href="/admin/salary-rules"
                                className="rounded-xl bg-slate-100 px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 rounded-xl bg-[#064e3b] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-[#053f31]"
                            >
                                <Save size={18} />
                                Create Salary Rule
                            </button>
                        </div>
                    </div>

                    <aside className="h-fit space-y-5 xl:sticky xl:top-6">
                        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#064e3b] via-[#087f5b] to-emerald-500 p-6 text-white shadow-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-emerald-100">
                                        Live Preview
                                    </p>
                                    <h2 className="mt-1 text-xl font-bold">
                                        Rule Calculation
                                    </h2>
                                </div>

                                <div className="rounded-2xl bg-white/15 p-3">
                                    <Percent
                                        size={22}
                                    />
                                </div>
                            </div>

                            <div className="mt-7 rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
                                <p className="text-xs text-emerald-100">
                                    Sample Monthly Amount
                                </p>

                                <p className="mt-2 text-4xl font-bold">
                                    ₹
                                    {preview.toLocaleString(
                                        "en-IN",
                                        {
                                            maximumFractionDigits: 0,
                                        }
                                    )}
                                </p>

                                <p className="mt-2 text-xs text-emerald-100">
                                    Based on a sample salary
                                    calculation
                                </p>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <div className="rounded-2xl bg-white/10 p-4">
                                    <p className="text-[11px] text-emerald-100">
                                        Type
                                    </p>
                                    <p className="mt-1 text-sm font-semibold">
                                        {type ===
                                        "employer_contribution"
                                            ? "Employer"
                                            : type
                                                  .charAt(
                                                      0
                                                  )
                                                  .toUpperCase() +
                                              type.slice(
                                                  1
                                              )}
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-white/10 p-4">
                                    <p className="text-[11px] text-emerald-100">
                                        Frequency
                                    </p>
                                    <p className="mt-1 text-sm font-semibold">
                                        {frequency
                                            .charAt(
                                                0
                                            )
                                            .toUpperCase() +
                                            frequency.slice(
                                                1
                                            )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                            <div className="flex gap-3">
                                <div className="mt-0.5 text-blue-600">
                                    <Info size={18} />
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-blue-900">
                                        How this works
                                    </h3>

                                    <p className="mt-2 text-xs leading-5 text-blue-700">
                                        The rule will be stored and
                                        later evaluated by the payroll
                                        engine during Pay Run
                                        processing.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-900">
                                Calculation Base
                            </h3>

                            <div className="mt-4 space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">
                                        Basic
                                    </span>
                                    <span className="font-semibold text-slate-800">
                                        ₹30,000
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-slate-500">
                                        Gross
                                    </span>
                                    <span className="font-semibold text-slate-800">
                                        ₹60,000
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-slate-500">
                                        Monthly CTC
                                    </span>
                                    <span className="font-semibold text-slate-800">
                                        ₹60,000
                                    </span>
                                </div>

                                <div className="border-t border-slate-100 pt-3">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-slate-700">
                                            Rule Result
                                        </span>
                                        <span className="font-bold text-emerald-600">
                                            ₹
                                            {preview.toLocaleString(
                                                "en-IN",
                                                {
                                                    maximumFractionDigits: 0,
                                                }
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </form>
            </div>
        </div>
    );
}