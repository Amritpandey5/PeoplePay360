"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowUpRight,
    Bell,
    CalendarDays,
    CheckCircle2,
    Clock3,
    FileText,
    Search,
    UserPlus,
    Users,
    WalletCards,
} from "lucide-react";
import {
    getEmployees,
    getUsers,
    subscribeToDataChanges,
} from "@/lib/employee-storage";
import type { Employee, User } from "@/types/employee";

export default function AdminDashboard() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    const loadData = () => {
        setEmployees(getEmployees());
        setUsers(getUsers());
    };

    useEffect(() => {
        loadData();

        return subscribeToDataChanges(loadData);
    }, []);

    const activeEmployees = employees.filter(
        (employee) => employee.employmentStatus === "active"
    ).length;

    const inactiveEmployees = employees.filter(
        (employee) => employee.employmentStatus === "inactive"
    ).length;

    const activeUsers = users.filter(
        (user) => user.isActive
    ).length;

    const today = new Date();

    const formattedDate = today.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <main className="min-h-screen bg-[#f7f9f8]">
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="flex h-[76px] items-center justify-between px-6 lg:px-8">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-emerald-700">
                            Admin Portal
                        </p>

                        <p className="mt-0.5 truncate text-xs text-slate-400">
                            {formattedDate}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative hidden w-[300px] md:block">
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input
                                type="text"
                                placeholder="Search anything..."
                                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                            />

                            <span className="absolute right-3 top-1/2 flex h-6 min-w-6 -translate-y-1/2 items-center justify-center rounded-md border border-slate-200 bg-white px-1.5 text-[10px] font-medium text-slate-400">
                                /
                            </span>
                        </div>

                        <button
                            type="button"
                            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                        >
                            <Bell className="h-5 w-5" />

                            <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </button>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#063d2f] text-sm font-bold text-white shadow-sm">
                            A
                        </div>
                    </div>
                </div>
            </header>

            <div className="px-6 py-8 lg:px-8">
                <div className="mx-auto max-w-[1600px]">
                    <section className="mb-8">
                        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                            <div>
                                <p className="mb-2 text-sm font-semibold text-emerald-700">
                                    Dashboard Overview
                                </p>

                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                    Good afternoon, Admin
                                </h1>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                    Manage your workforce, payroll,
                                    access and HR operations from one
                                    place.
                                </p>
                            </div>

                            <Link
                                href="/admin/employees/new"
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900"
                            >
                                <UserPlus className="h-4 w-4" />
                                Add Employee
                            </Link>
                        </div>
                    </section>

                    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                        <DashboardStat
                            title="Total Employees"
                            value={employees.length}
                            description="Employees in your organization"
                            icon={Users}
                            href="/admin/employees"
                        />

                        <DashboardStat
                            title="Active Employees"
                            value={activeEmployees}
                            description="Currently active employees"
                            icon={CheckCircle2}
                            href="/admin/employees"
                        />

                        <DashboardStat
                            title="Active Users"
                            value={activeUsers}
                            description="Accounts with system access"
                            icon={Users}
                            href="/admin/users"
                        />

                        <DashboardStat
                            title="Inactive Employees"
                            value={inactiveEmployees}
                            description="Inactive employee profiles"
                            icon={Clock3}
                            href="/admin/employees"
                        />
                    </section>

                    <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                                <div>
                                    <h2 className="text-base font-semibold text-slate-900">
                                        Workforce Overview
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Current employee status across
                                        your organization.
                                    </p>
                                </div>

                                <Link
                                    href="/admin/employees"
                                    className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
                                >
                                    View Employees
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </div>

                            <div className="p-6">
                                {employees.length === 0 ? (
                                    <EmptyState
                                        icon={Users}
                                        title="No employees yet"
                                        description="Your workforce overview will appear here once you add employees."
                                        actionLabel="Add Employee"
                                        actionHref="/admin/employees/new"
                                    />
                                ) : (
                                    <div className="space-y-6">
                                        <div>
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-sm font-medium text-slate-600">
                                                    Active employees
                                                </span>

                                                <span className="text-sm font-semibold text-slate-900">
                                                    {activeEmployees}
                                                </span>
                                            </div>

                                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full rounded-full bg-emerald-600 transition-all"
                                                    style={{
                                                        width: `${
                                                            employees.length
                                                                ? (activeEmployees /
                                                                      employees.length) *
                                                                  100
                                                                : 0
                                                        }%`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <MiniMetric
                                                label="Total"
                                                value={employees.length}
                                            />

                                            <MiniMetric
                                                label="Active"
                                                value={activeEmployees}
                                            />

                                            <MiniMetric
                                                label="Inactive"
                                                value={inactiveEmployees}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-6 py-5">
                                <h2 className="text-base font-semibold text-slate-900">
                                    Quick Actions
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Frequently used administration
                                    tools.
                                </p>
                            </div>

                            <div className="grid gap-3 p-5">
                                <QuickAction
                                    href="/admin/employees/new"
                                    icon={UserPlus}
                                    title="Add Employee"
                                    description="Create a new employee profile"
                                />

                                <QuickAction
                                    href="/admin/users"
                                    icon={Users}
                                    title="Users & Roles"
                                    description="Manage login access and permissions"
                                />

                                <QuickAction
                                    href="/admin/payruns"
                                    icon={WalletCards}
                                    title="Manage Payruns"
                                    description="Review and manage payroll runs"
                                />

                                <QuickAction
                                    href="/admin/reports"
                                    icon={FileText}
                                    title="Reports"
                                    description="View HR and payroll reports"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="mt-6 grid gap-6 lg:grid-cols-2">
                        <DashboardPanel
                            icon={CalendarDays}
                            title="Attendance Overview"
                            description="Attendance information will appear here when attendance tracking is connected."
                        />

                        <DashboardPanel
                            icon={Clock3}
                            title="Pending Time Off"
                            description="Leave and time-off requests will appear here when the module is connected."
                        />
                    </section>

                    <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-6 py-5">
                            <h2 className="text-base font-semibold text-slate-900">
                                Recent Activity
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Important activity across your HR
                                system.
                            </p>
                        </div>

                        <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                                <Clock3 className="h-6 w-6" />
                            </div>

                            <h3 className="mt-4 text-sm font-semibold text-slate-800">
                                No recent activity
                            </h3>

                            <p className="mt-1 max-w-md text-sm text-slate-400">
                                Employee, payroll and access activity
                                will appear here as your organization
                                starts using PeoplePay360.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}

function DashboardStat({
    title,
    value,
    description,
    icon: Icon,
    href,
}: {
    title: string;
    value: number;
    description: string;
    icon: typeof Users;
    href: string;
}) {
    return (
        <Link
            href={href}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                        {value}
                    </p>

                    <p className="mt-1.5 text-xs text-slate-400">
                        {description}
                    </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-100">
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </Link>
    );
}

function MiniMetric({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
                {value}
            </p>
        </div>
    );
}

function QuickAction({
    href,
    icon: Icon,
    title,
    description,
}: {
    href: string;
    icon: typeof Users;
    title: string;
    description: string;
}) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-4 rounded-xl border border-slate-100 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40"
        >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-100">
                <Icon className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                    {title}
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                    {description}
                </p>
            </div>

            <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-emerald-600" />
        </Link>
    );
}

function DashboardPanel({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof CalendarDays;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-start gap-4 p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                    <Icon className="h-5 w-5" />
                </div>

                <div>
                    <h2 className="text-base font-semibold text-slate-900">
                        {title}
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                        {description}
                    </p>
                </div>
            </div>

            <div className="border-t border-slate-100 px-6 py-5">
                <span className="text-xs font-medium text-slate-400">
                    No data available yet
                </span>
            </div>
        </div>
    );
}

function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    actionHref,
}: {
    icon: typeof Users;
    title: string;
    description: string;
    actionLabel: string;
    actionHref: string;
}) {
    return (
        <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Icon className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
                {title}
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                {description}
            </p>

            <Link
                href={actionHref}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
                <UserPlus className="h-4 w-4" />
                {actionLabel}
            </Link>
        </div>
    );
}