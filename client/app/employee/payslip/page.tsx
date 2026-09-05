"use client";

import {
    Download,
    FileText,
    CalendarDays,
} from "lucide-react";

export default function PayslipPage() {
    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div>
                <p className="text-sm font-semibold text-[#0F766E]">
                    Employee Portal
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0F172A]">
                    My Payslip
                </h1>

                <p className="mt-1 text-sm text-[#64748B]">
                    View and download your monthly salary statements.
                </p>
            </div>

            {/* LATEST PAYSLIP */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <p className="text-sm text-[#64748B]">
                            Latest Payslip
                        </p>

                        <h2 className="mt-1 text-3xl font-bold text-[#0F172A]">
                            —
                        </h2>

                        <p className="mt-1 text-sm text-[#94A3B8]">
                            No payslip available
                        </p>
                    </div>

                    <button
                        type="button"
                        disabled
                        className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#063D2F]/40 px-5 py-3 text-sm font-semibold text-white opacity-60"
                    >
                        <Download size={17} />
                        Download Payslip
                    </button>

                </div>

                {/* SALARY SUMMARY */}
                <div className="mt-6 grid gap-4 sm:grid-cols-3">

                    <div className="rounded-xl bg-[#F7F9F8] p-4">
                        <p className="text-xs font-medium text-[#64748B]">
                            Gross Salary
                        </p>

                        <p className="mt-2 text-xl font-bold text-[#0F172A]">
                            —
                        </p>
                    </div>

                    <div className="rounded-xl bg-[#F7F9F8] p-4">
                        <p className="text-xs font-medium text-[#64748B]">
                            Deductions
                        </p>

                        <p className="mt-2 text-xl font-bold text-[#0F172A]">
                            —
                        </p>
                    </div>

                    <div className="rounded-xl bg-[#ECFDF5] p-4">
                        <p className="text-xs font-medium text-[#0F766E]">
                            Net Salary
                        </p>

                        <p className="mt-2 text-xl font-bold text-[#0F766E]">
                            —
                        </p>
                    </div>

                </div>
            </div>

            {/* PAYSLIP HISTORY */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                    <div>
                        <h2 className="text-lg font-semibold text-[#0F172A]">
                            Payslip History
                        </h2>

                        <p className="mt-1 text-sm text-[#64748B]">
                            Your previous salary statements will appear here.
                        </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECFDF5]">
                        <CalendarDays
                            size={20}
                            className="text-[#0F766E]"
                        />
                    </div>

                </div>

                {/* EMPTY STATE */}
                <div className="flex min-h-[300px] flex-col items-center justify-center text-center">

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F9F8]">
                        <FileText
                            size={32}
                            className="text-[#CBD5E1]"
                        />
                    </div>

                    <h3 className="mt-5 text-base font-semibold text-[#334155]">
                        No payslips available
                    </h3>

                    <p className="mt-1 max-w-sm text-sm leading-6 text-[#94A3B8]">
                        Your payslip history will be displayed here once
                        salary statements are generated.
                    </p>

                </div>

            </div>

        </div>
    );
}