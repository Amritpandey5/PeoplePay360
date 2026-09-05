"use client";

import {
    Mail,
    Phone,
    MapPin,
    Briefcase,
    CalendarDays,
    User,
} from "lucide-react";

export default function ProfilePage() {
    return (
        <div className="space-y-6">

            {/* PAGE HEADER */}
            <div>
                <p className="text-sm font-semibold text-[#0F766E]">
                    Employee Portal
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0F172A]">
                    My Profile
                </h1>

                <p className="mt-1 text-sm text-[#64748B]">
                    View your personal and employment information.
                </p>
            </div>

            {/* PROFILE HEADER */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#063D2F] text-white">
                        <User size={34} strokeWidth={1.8} />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-[#0F172A]">
                            Employee Name
                        </h2>

                        <p className="mt-1 text-sm text-[#64748B]">
                            Employee ID
                        </p>

                        <span className="mt-2 inline-flex rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold text-[#0F766E]">
                            Active Employee
                        </span>
                    </div>

                </div>

            </div>

            {/* INFORMATION */}
            <div className="grid gap-6 lg:grid-cols-2">

                {/* PERSONAL INFORMATION */}
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

                    <h2 className="text-lg font-semibold text-[#0F172A]">
                        Personal Information
                    </h2>

                    <div className="mt-6 space-y-6">

                        {/* EMAIL */}
                        <div className="flex gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ECFDF5]">
                                <Mail
                                    size={18}
                                    className="text-[#0F766E]"
                                />
                            </div>

                            <div>
                                <p className="text-xs text-[#94A3B8]">
                                    Email
                                </p>

                                <p className="mt-1 text-sm font-medium text-[#334155]">
                                    —
                                </p>
                            </div>
                        </div>

                        {/* PHONE */}
                        <div className="flex gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ECFDF5]">
                                <Phone
                                    size={18}
                                    className="text-[#0F766E]"
                                />
                            </div>

                            <div>
                                <p className="text-xs text-[#94A3B8]">
                                    Phone
                                </p>

                                <p className="mt-1 text-sm font-medium text-[#334155]">
                                    —
                                </p>
                            </div>
                        </div>

                        {/* LOCATION */}
                        <div className="flex gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ECFDF5]">
                                <MapPin
                                    size={18}
                                    className="text-[#0F766E]"
                                />
                            </div>

                            <div>
                                <p className="text-xs text-[#94A3B8]">
                                    Location
                                </p>

                                <p className="mt-1 text-sm font-medium text-[#334155]">
                                    —
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* EMPLOYMENT INFORMATION */}
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

                    <h2 className="text-lg font-semibold text-[#0F172A]">
                        Employment Information
                    </h2>

                    <div className="mt-6 space-y-6">

                        {/* DEPARTMENT */}
                        <div className="flex gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ECFDF5]">
                                <Briefcase
                                    size={18}
                                    className="text-[#0F766E]"
                                />
                            </div>

                            <div>
                                <p className="text-xs text-[#94A3B8]">
                                    Department
                                </p>

                                <p className="mt-1 text-sm font-medium text-[#334155]">
                                    —
                                </p>
                            </div>
                        </div>

                        {/* POSITION */}
                        <div className="flex gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ECFDF5]">
                                <Briefcase
                                    size={18}
                                    className="text-[#0F766E]"
                                />
                            </div>

                            <div>
                                <p className="text-xs text-[#94A3B8]">
                                    Position
                                </p>

                                <p className="mt-1 text-sm font-medium text-[#334155]">
                                    —
                                </p>
                            </div>
                        </div>

                        {/* JOINING DATE */}
                        <div className="flex gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ECFDF5]">
                                <CalendarDays
                                    size={18}
                                    className="text-[#0F766E]"
                                />
                            </div>

                            <div>
                                <p className="text-xs text-[#94A3B8]">
                                    Joining Date
                                </p>

                                <p className="mt-1 text-sm font-medium text-[#334155]">
                                    —
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* BACKEND NOTE */}
            <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F7F9F8] p-5">
                <p className="text-sm font-semibold text-[#334155]">
                    Profile information
                </p>

                <p className="mt-1 text-sm leading-6 text-[#64748B]">
                    Employee information will appear here once the employee
                    profile is connected to the system.
                </p>
            </div>

        </div>
    );
}