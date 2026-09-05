"use client";

import {
    CircleHelp,
    Mail,
    MessageSquare,
    Phone,
} from "lucide-react";

export default function SupportPage() {
    return (
        <div className="space-y-6">

            {/* PAGE HEADER */}
            <div>
                <p className="text-sm font-semibold text-[#0F766E]">
                    Employee Portal
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0F172A]">
                    Help & Support
                </h1>

                <p className="mt-1 text-sm text-[#64748B]">
                    Need help? Get assistance from your HR support team.
                </p>
            </div>

            {/* SUPPORT OPTIONS */}
            <div className="grid gap-4 md:grid-cols-3">

                {/* EMAIL */}
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ECFDF5]">
                        <Mail
                            size={22}
                            className="text-[#0F766E]"
                        />
                    </div>

                    <h2 className="mt-4 font-semibold text-[#0F172A]">
                        Email Support
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-[#64748B]">
                        Contact your HR team for assistance with employee
                        related queries.
                    </p>

                    <button
                        type="button"
                        disabled
                        className="mt-4 cursor-not-allowed text-sm font-semibold text-[#0F766E] opacity-50"
                    >
                        Contact HR
                    </button>

                </div>

                {/* TICKET */}
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50">
                        <MessageSquare
                            size={22}
                            className="text-slate-500"
                        />
                    </div>

                    <h2 className="mt-4 font-semibold text-[#0F172A]">
                        Raise a Ticket
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-[#64748B]">
                        Submit a support request when you need help from the
                        HR team.
                    </p>

                    <button
                        type="button"
                        disabled
                        className="mt-4 cursor-not-allowed text-sm font-semibold text-slate-500 opacity-50"
                    >
                        Create Ticket
                    </button>

                </div>

                {/* PHONE */}
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ECFDF5]">
                        <Phone
                            size={22}
                            className="text-[#0F766E]"
                        />
                    </div>

                    <h2 className="mt-4 font-semibold text-[#0F172A]">
                        HR Helpline
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-[#64748B]">
                        Speak with your HR team for direct assistance.
                    </p>

                    <button
                        type="button"
                        disabled
                        className="mt-4 cursor-not-allowed text-sm font-semibold text-[#0F766E] opacity-50"
                    >
                        Call HR
                    </button>

                </div>

            </div>

            {/* FAQ */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

                <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECFDF5]">
                        <CircleHelp
                            size={21}
                            className="text-[#0F766E]"
                        />
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-[#0F172A]">
                            Frequently Asked Questions
                        </h2>

                        <p className="mt-1 text-sm text-[#64748B]">
                            Common questions and helpful information.
                        </p>
                    </div>

                </div>

                {/* EMPTY STATE */}
                <div className="flex min-h-[280px] flex-col items-center justify-center text-center">

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F9F8]">
                        <CircleHelp
                            size={32}
                            className="text-[#CBD5E1]"
                        />
                    </div>

                    <h3 className="mt-5 text-base font-semibold text-[#334155]">
                        No help articles available
                    </h3>

                    <p className="mt-1 max-w-md text-sm leading-6 text-[#94A3B8]">
                        Frequently asked questions and support information
                        will appear here once they are published.
                    </p>

                </div>

            </div>

            {/* SUPPORT STATUS */}
            <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F7F9F8] p-5">

                <p className="text-sm font-semibold text-[#334155]">
                    Support information
                </p>

                <p className="mt-1 text-sm leading-6 text-[#64748B]">
                    HR contact details, support tickets and help resources
                    will be available here once configured by the
                    organization.
                </p>

            </div>

        </div>
    );
}