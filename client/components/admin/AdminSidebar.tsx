"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Users,
    ClipboardCheck,
    FileText,
    CalendarClock,
    CalendarDays,
    WalletCards,
    Receipt,
    Landmark,
    SlidersHorizontal,
    UserCog,
    BarChart3,
    ShieldCheck,
    Settings,
    ChevronDown,
    ChevronLeft,
    LogOut,
    Building2,
} from "lucide-react";

type NavigationItem = {
    label: string;
    href: string;
    icon: React.ElementType;
};

const mainNavigation: NavigationItem[] = [
    {
        label: "Employees",
        href: "/admin/employees",
        icon: Users,
    },
    {
        label: "Attendance",
        href: "/admin/attendance",
        icon: ClipboardCheck,
    },
    {
        label: "Contracts",
        href: "/admin/contracts",
        icon: FileText,
    },
    {
        label: "Working Schedules",
        href: "/admin/working-schedules",
        icon: CalendarClock,
    },
    {
        label: "Time Off",
        href: "/admin/time-off",
        icon: CalendarDays,
    },
];

const payrollNavigation: NavigationItem[] = [
    {
        label: "Payruns",
        href: "/admin/payruns",
        icon: WalletCards,
    },
    {
        label: "Payslips",
        href: "/admin/payslips",
        icon: Receipt,
    },
    {
        label: "Salary Structures",
        href: "/admin/salary-structures",
        icon: Landmark,
    },
    {
        label: "Salary Rules",
        href: "/admin/salary-rules",
        icon: SlidersHorizontal,
    },
];

const administrationNavigation: NavigationItem[] = [
    {
        label: "Users & Roles",
        href: "/admin/users",
        icon: UserCog,
    },
    {
        label: "Reports",
        href: "/admin/reports",
        icon: BarChart3,
    },
    {
        label: "Audit Logs",
        href: "/admin/audit-logs",
        icon: ShieldCheck,
    },
];

const bottomNavigation: NavigationItem[] = [
    {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
    },
];

function NavigationSection({
    title,
    items,
    collapsed,
}: {
    title: string;
    items: NavigationItem[];
    collapsed: boolean;
}) {
    return (
        <div className="mb-6">
            {!collapsed && title && (
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-100/40">
                    {title}
                </p>
            )}

            <div className="space-y-1">
                {items.map((item) => {
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={collapsed ? item.label : undefined}
                            className={`group flex items-center rounded-xl text-sm font-medium text-emerald-50/70 transition hover:bg-white/8 hover:text-white ${
                                collapsed
                                    ? "justify-center px-2 py-3"
                                    : "gap-3 px-3 py-2.5"
                            }`}
                        >
                            <Icon
                                size={18}
                                strokeWidth={1.8}
                                className="shrink-0 text-emerald-200/60 transition group-hover:text-emerald-200"
                            />

                            {!collapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

export default function AdminSidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-50 flex h-screen shrink-0 flex-col overflow-hidden bg-[#063d2f] text-white shadow-xl transition-all duration-300 ${
                collapsed ? "w-[82px]" : "w-[270px]"
            }`}
        >
            <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full border border-white/5" />

            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full border border-white/5" />

            <div
                className={`relative flex h-[76px] shrink-0 items-center border-b border-white/8 ${
                    collapsed
                        ? "justify-center px-3"
                        : "justify-between px-5"
                }`}
            >
                <Link
                    href="/admin"
                    className="flex items-center gap-3"
                    title={collapsed ? "PeoplePay360" : undefined}
                >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#063d2f] shadow-lg">
                        <span className="text-lg font-bold">P</span>
                    </div>

                    {!collapsed && (
                        <div>
                            <p className="text-[15px] font-bold tracking-tight">
                                PeoplePay360
                            </p>

                            <p className="mt-0.5 text-[10px] font-medium text-emerald-100/50">
                                HR & Payroll
                            </p>
                        </div>
                    )}
                </Link>

                {!collapsed && (
                    <button
                        type="button"
                        onClick={() => setCollapsed(true)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-100/50 transition hover:bg-white/8 hover:text-white"
                        aria-label="Collapse sidebar"
                    >
                        <ChevronLeft size={17} />
                    </button>
                )}

                {collapsed && (
                    <button
                        type="button"
                        onClick={() => setCollapsed(false)}
                        className="absolute -right-3 top-[22px] z-20 flex h-7 w-7 items-center justify-center rounded-full border border-emerald-900/30 bg-white text-[#063d2f] shadow-md"
                        aria-label="Expand sidebar"
                    >
                        <ChevronDown
                            size={15}
                            className="rotate-[-90deg]"
                        />
                    </button>
                )}
            </div>

            <div className="relative min-h-0 flex-1 overflow-y-auto px-3 py-6 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.12)_transparent]">
                <NavigationSection
                    title="Workforce"
                    items={mainNavigation}
                    collapsed={collapsed}
                />

                <NavigationSection
                    title="Payroll"
                    items={payrollNavigation}
                    collapsed={collapsed}
                />

                <NavigationSection
                    title="Administration"
                    items={administrationNavigation}
                    collapsed={collapsed}
                />
            </div>

            <div className="relative shrink-0 border-t border-white/8 bg-[#063d2f] p-3">
                <NavigationSection
                    title=""
                    items={bottomNavigation}
                    collapsed={collapsed}
                />

                <div className="relative">
                    <button
                        type="button"
                        onClick={() =>
                            setProfileOpen((value) => !value)
                        }
                        className={`flex w-full items-center rounded-xl p-2 transition hover:bg-white/8 ${
                            collapsed
                                ? "justify-center"
                                : "justify-between"
                        }`}
                    >
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-400/15 text-sm font-bold text-emerald-200">
                                A
                            </div>

                            {!collapsed && (
                                <div className="min-w-0 text-left">
                                    <p className="truncate text-xs font-semibold text-white">
                                        Admin
                                    </p>

                                    <p className="truncate text-[10px] text-emerald-100/45">
                                        Administrator
                                    </p>
                                </div>
                            )}
                        </div>

                        {!collapsed && (
                            <ChevronDown
                                size={15}
                                className={`shrink-0 text-emerald-100/40 transition ${
                                    profileOpen
                                        ? "rotate-180"
                                        : ""
                                }`}
                            />
                        )}
                    </button>

                    {profileOpen && !collapsed && (
                        <div className="absolute bottom-full left-0 mb-2 w-full rounded-xl border border-white/10 bg-[#07513e] p-1.5 shadow-2xl">
                            <button
                                type="button"
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium text-emerald-50/80 transition hover:bg-white/8 hover:text-white"
                            >
                                <Building2 size={16} />
                                Company Profile
                            </button>

                            <button
                                type="button"
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium text-emerald-50/80 transition hover:bg-white/8 hover:text-white"
                            >
                                <Settings size={16} />
                                Account Settings
                            </button>

                            <div className="my-1 border-t border-white/8" />

                            <button
                                type="button"
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium text-red-200/80 transition hover:bg-red-500/10 hover:text-red-200"
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}