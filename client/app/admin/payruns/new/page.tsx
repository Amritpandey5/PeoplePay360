"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Calculator,
    CalendarDays,
    Check,
    CircleDollarSign,
    Clock3,
    Users,
    WalletCards,
} from "lucide-react";
import { getEmployees } from "@/lib/employee-storage";
import { createPayRun } from "@/lib/pay-run-storage";
import {
    calculateEmployeePayroll,
    calculatePayRunTotals,
} from "@/lib/payroll-calculator";

type Frequency =
    | "monthly"
    | "weekly"
    | "daily"
    | "yearly";

export default function CreatePayRunPage() {
    const router = useRouter();

    const employees = useMemo(
        () => getEmployees(),
        []
    );

    const [frequency, setFrequency] =
        useState<Frequency>("monthly");

    const [periodStart, setPeriodStart] =
        useState("");

    const [periodEnd, setPeriodEnd] =
        useState("");

    const [paymentDate, setPaymentDate] =
        useState("");

    const [selectedEmployees, setSelectedEmployees] =
        useState<string[]>(
            employees.map((employee) => employee.id)
        );

    const [error, setError] = useState("");

    const payrollEmployees = useMemo(() => {
        return employees
            .filter((employee) =>
                selectedEmployees.includes(employee.id)
            )
            .map((employee) => {
                const basicSalary =
                    Number(employee.basicSalary || 0);

                const hra =
                    Number(employee.hra || 0);

                const allowances =
                    Number(employee.allowances || 0);

                const deductions =
                    Number(employee.deductions || 0);

                return calculateEmployeePayroll({
                    employeeId: employee.id,
                    employeeName: employee.name,
                    contractId: "",
                    salaryStructureId: "",
                    basicSalary,
                    earnings:
                        hra + allowances,
                    deductions,
                    employerContributions: 0,
                });
            });
    }, [employees, selectedEmployees]);

    const totals = useMemo(
        () =>
            calculatePayRunTotals(
                payrollEmployees
            ),
        [payrollEmployees]
    );

    const toggleEmployee = (id: string) => {
        setSelectedEmployees((current) =>
            current.includes(id)
                ? current.filter(
                      (employeeId) =>
                          employeeId !== id
                  )
                : [...current, id]
        );
    };

    const handleCreate = () => {
        setError("");

        if (
            !periodStart ||
            !periodEnd ||
            !paymentDate
        ) {
            setError(
                "Please complete the payroll period and payment date."
            );
            return;
        }

        if (periodEnd < periodStart) {
            setError(
                "Period end date cannot be earlier than period start date."
            );
            return;
        }

        if (selectedEmployees.length === 0) {
            setError(
                "Select at least one employee."
            );
            return;
        }

        const payRun = createPayRun({
            name: `${frequency
                .charAt(0)
                .toUpperCase()}${frequency.slice(
                1
            )} Payroll - ${periodStart}`,
            periodStart,
            periodEnd,
            paymentDate,
            frequency,
            employeeIds:
                selectedEmployees,
            employees: payrollEmployees,
            totalBasic: totals.basic,
            totalEarnings: totals.earnings,
            totalGross: totals.gross,
            totalDeductions:
                totals.deductions,
            totalNet: totals.net,
            totalEmployerContributions:
                totals.employerContributions,
            totalEmployerCost:
                totals.employerCost,
            status: "draft",
        });

        router.push(
            `/admin/payruns/${payRun.id}`
        );
    };

    return (
        <div className="min-h-screen bg-[#f7f9f8]">
            <div className="mx-auto max-w-7xl px-6 py-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Link
                            href="/admin/payruns"
                            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-700"
                        >
                            <ArrowLeft
                                size={17}
                            />
                            Back to Pay Runs
                        </Link>

                        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                            Create Pay Run
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Create a payroll run for selected employees.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleCreate}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
                    >
                        <Check size={18} />
                        Create Pay Run
                    </button>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {error}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-6">
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <CalendarDays
                                        size={21}
                                    />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-slate-900">
                                        Payroll Period
                                    </h2>

                                    <p className="text-sm text-slate-500">
                                        Define the period and payment date.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-3">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Frequency
                                    </label>

                                    <select
                                        value={frequency}
                                        onChange={(event) =>
                                            setFrequency(
                                                event.target
                                                    .value as Frequency
                                            )
                                        }
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
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
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Period Start
                                    </label>

                                    <input
                                        type="date"
                                        value={periodStart}
                                        onChange={(event) =>
                                            setPeriodStart(
                                                event.target
                                                    .value
                                            )
                                        }
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Period End
                                    </label>

                                    <input
                                        type="date"
                                        value={periodEnd}
                                        onChange={(event) =>
                                            setPeriodEnd(
                                                event.target
                                                    .value
                                            )
                                        }
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Payment Date
                                    </label>

                                    <input
                                        type="date"
                                        value={paymentDate}
                                        onChange={(event) =>
                                            setPaymentDate(
                                                event.target
                                                    .value
                                            )
                                        }
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <Users
                                            size={21}
                                        />
                                    </div>

                                    <div>
                                        <h2 className="font-semibold text-slate-900">
                                            Employees
                                        </h2>

                                        <p className="text-sm text-slate-500">
                                            Select employees for this pay run.
                                        </p>
                                    </div>
                                </div>

                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                    {
                                        selectedEmployees.length
                                    }{" "}
                                    selected
                                </span>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {employees.length ===
                                0 ? (
                                    <div className="px-6 py-12 text-center">
                                        <Users
                                            size={35}
                                            className="mx-auto mb-3 text-slate-300"
                                        />

                                        <p className="font-medium text-slate-700">
                                            No employees found
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Add employees before creating payroll.
                                        </p>
                                    </div>
                                ) : (
                                    employees.map(
                                        (
                                            employee
                                        ) => {
                                            const selected =
                                                selectedEmployees.includes(
                                                    employee.id
                                                );

                                            return (
                                                <button
                                                    key={
                                                        employee.id
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        toggleEmployee(
                                                            employee.id
                                                        )
                                                    }
                                                    className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-slate-50"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div
                                                            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                                                                selected
                                                                    ? "bg-emerald-100 text-emerald-700"
                                                                    : "bg-slate-100 text-slate-500"
                                                            }`}
                                                        >
                                                            {employee.name
                                                                .charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}
                                                        </div>

                                                        <div>
                                                            <p className="font-medium text-slate-900">
                                                                {
                                                                    employee.name
                                                                }
                                                            </p>

                                                            <p className="text-xs text-slate-500">
                                                                {
                                                                    employee.email
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div
                                                        className={`flex h-6 w-6 items-center justify-center rounded-md border ${
                                                            selected
                                                                ? "border-emerald-600 bg-emerald-600 text-white"
                                                                : "border-slate-300 bg-white"
                                                        }`}
                                                    >
                                                        {selected && (
                                                            <Check
                                                                size={
                                                                    15
                                                                }
                                                            />
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        }
                                    )
                                )}
                            </div>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                        <Calculator
                                            size={21}
                                        />
                                    </div>

                                    <div>
                                        <h2 className="font-semibold text-slate-900">
                                            Payroll Calculation
                                        </h2>

                                        <p className="text-sm text-slate-500">
                                            Current payroll estimate for selected employees.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[720px] text-left">
                                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                        <tr>
                                            <th className="px-6 py-4">
                                                Employee
                                            </th>
                                            <th className="px-6 py-4">
                                                Basic
                                            </th>
                                            <th className="px-6 py-4">
                                                Earnings
                                            </th>
                                            <th className="px-6 py-4">
                                                Gross
                                            </th>
                                            <th className="px-6 py-4">
                                                Deductions
                                            </th>
                                            <th className="px-6 py-4">
                                                Net
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {payrollEmployees.map(
                                            (
                                                employee
                                            ) => (
                                                <tr
                                                    key={
                                                        employee.employeeId
                                                    }
                                                    className="text-sm"
                                                >
                                                    <td className="px-6 py-4 font-medium text-slate-900">
                                                        {
                                                            employee.employeeName
                                                        }
                                                    </td>

                                                    <td className="px-6 py-4 text-slate-600">
                                                        ₹
                                                        {employee.basicSalary.toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4 text-slate-600">
                                                        ₹
                                                        {employee.earnings.toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4 font-semibold text-slate-900">
                                                        ₹
                                                        {employee.grossSalary.toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4 text-red-600">
                                                        ₹
                                                        {employee.deductions.toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4 font-semibold text-emerald-700">
                                                        ₹
                                                        {employee.netSalary.toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    <aside className="lg:sticky lg:top-6 lg:self-start">
                        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-6 text-white shadow-xl shadow-emerald-900/10">
                            <div className="mb-7 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-emerald-100">
                                        Payroll Preview
                                    </p>

                                    <h2 className="mt-1 text-xl font-semibold">
                                        {frequency
                                            .charAt(
                                                0
                                            )
                                            .toUpperCase() +
                                            frequency.slice(
                                                1
                                            )}{" "}
                                        Payroll
                                    </h2>
                                </div>

                                <WalletCards
                                    size={26}
                                    className="text-emerald-100"
                                />
                            </div>

                            <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-emerald-100">
                                        Employees
                                    </span>

                                    <span className="font-semibold">
                                        {
                                            selectedEmployees.length
                                        }
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-emerald-100">
                                        Total Basic
                                    </span>

                                    <span className="font-semibold">
                                        ₹
                                        {totals.basic.toLocaleString(
                                            "en-IN"
                                        )}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-emerald-100">
                                        Total Gross
                                    </span>

                                    <span className="font-semibold">
                                        ₹
                                        {totals.gross.toLocaleString(
                                            "en-IN"
                                        )}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-emerald-100">
                                        Deductions
                                    </span>

                                    <span className="font-semibold">
                                        ₹
                                        {totals.deductions.toLocaleString(
                                            "en-IN"
                                        )}
                                    </span>
                                </div>

                                <div className="border-t border-white/20 pt-5">
                                    <p className="text-sm text-emerald-100">
                                        Estimated Net Payroll
                                    </p>

                                    <p className="mt-1 text-3xl font-bold">
                                        ₹
                                        {totals.net.toLocaleString(
                                            "en-IN"
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-7 rounded-xl bg-white/10 p-4 backdrop-blur">
                                <div className="flex items-center gap-3">
                                    <Clock3
                                        size={18}
                                        className="text-emerald-100"
                                    />

                                    <p className="text-xs leading-5 text-emerald-50">
                                        Attendance, approved leave and salary rules will be applied in the payroll calculation engine.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <CircleDollarSign
                                    size={20}
                                    className="text-emerald-600"
                                />

                                <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        Employer Cost
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        Gross + employer contributions
                                    </p>
                                </div>
                            </div>

                            <p className="mt-4 text-2xl font-bold text-slate-900">
                                ₹
                                {totals.employerCost.toLocaleString(
                                    "en-IN"
                                )}
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}