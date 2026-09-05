"use client";

import {
    Megaphone,
    CalendarDays,
} from "lucide-react";

export default function AnnouncementsPage() {
    return (
        <div className="space-y-6">

            {/* PAGE HEADER */}
            <div>
                <p className="text-sm font-semibold text-[#0F766E]">
                    Employee Portal
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0F172A]">
                    Announcements
                </h1>

                <p className="mt-1 text-sm text-[#64748B]">
                    Stay updated with company news and important notices.
                </p>
            </div>

            {/* ANNOUNCEMENTS */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                    <div>
                        <h2 className="text-lg font-semibold text-[#0F172A]">
                            Company Announcements
                        </h2>

                        <p className="mt-1 text-sm text-[#64748B]">
                            Important updates from your organization.
                        </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECFDF5]">
                        <Megaphone
                            size={20}
                            className="text-[#0F766E]"
                        />
                    </div>

                </div>

                {/* EMPTY STATE */}
                <div className="flex min-h-[360px] flex-col items-center justify-center text-center">

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F9F8]">
                        <Megaphone
                            size={32}
                            className="text-[#CBD5E1]"
                        />
                    </div>

                    <h3 className="mt-5 text-base font-semibold text-[#334155]">
                        No announcements
                    </h3>

                    <p className="mt-1 max-w-md text-sm leading-6 text-[#94A3B8]">
                        There are no company announcements available at the
                        moment. New announcements will appear here when
                        published by your organization.
                    </p>

                    <div className="mt-5 flex items-center gap-2 text-xs text-[#94A3B8]">
                        <CalendarDays size={14} />
                        <span>Waiting for new updates</span>
                    </div>

                </div>

            </div>

        </div>
    );
}