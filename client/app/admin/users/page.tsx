"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    CheckCircle2,
    KeyRound,
    Plus,
    Search,
    ShieldCheck,
    UserRound,
    Users,
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
    getEmployees,
    getUsers,
    subscribeToDataChanges,
} from "@/lib/peoplepay-store";
import type { Employee, User, UserRole } from "@/types/employee";

const roleLabels: Record<UserRole, string> = {
    employee: "Employee",
    hr_manager: "HR Manager",
    hr_payroll_user: "HR Payroll User",
    hr_payroll_manager: "HR Payroll Manager",
    admin: "Admin",
};

const roleDescriptions: Record<UserRole, string> = {
    employee: "Employee self-service access",
    hr_manager: "HR management access",
    hr_payroll_user: "Payroll and HR access",
    hr_payroll_manager: "Advanced payroll management",
    admin: "Full system administration",
};

const roleStyles: Record<UserRole, string> = {
    employee: "bg-slate-100 text-slate-700",
    hr_manager: "bg-blue-50 text-blue-700",
    hr_payroll_user: "bg-violet-50 text-violet-700",
    hr_payroll_manager: "bg-amber-50 text-amber-700",
    admin: "bg-emerald-50 text-emerald-700",
};

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [search, setSearch] = useState("");

    const loadData = () => {
        setUsers(getUsers());
        setEmployees(getEmployees());
    };

    useEffect(() => {
        loadData();

        return subscribeToDataChanges(loadData);
    }, []);

    const employeeMap = useMemo(() => {
        return new Map(
            employees.map((employee) => [
                employee.employeeId,
                employee,
            ])
        );
    }, [employees]);

    const filteredUsers = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return users;
        }

        return users.filter((user) => {
            const employee = user.employeeId
                ? employeeMap.get(user.employeeId)
                : undefined;

            return (
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query) ||
                user.role.toLowerCase().includes(query) ||
                user.employeeId?.toLowerCase().includes(query) ||
                employee?.department
                    .toLowerCase()
                    .includes(query) ||
                employee?.jobPosition
                    .toLowerCase()
                    .includes(query)
            );
        });
    }, [search, users, employeeMap]);

    const activeUsers = users.filter(
        (user) => user.isActive
    ).length;

    const employeeUsers = users.filter(
        (user) => user.role === "employee"
    ).length;

    const privilegedUsers = users.filter(
        (user) =>
            user.role !== "employee"
    ).length;

    return (
        <div className="min-h-screen bg-[#f7f9f8]">
            <AdminSidebar />

            <main className="min-h-screen lg:ml-64">
                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto max-w-7xl px-6 py-7">
                        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                            <div>
                                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
                                    <ShieldCheck className="h-4 w-4" />
                                    Access Management
                                </div>

                                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                    Users & Roles
                                </h1>

                                <p className="mt-1 text-sm text-slate-500">
                                    Manage login accounts and system access.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    router.push(
                                        "/admin/employees/new"
                                    )
                                }
                                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 text-sm font-semibold text-white transition hover:bg-emerald-900"
                            >
                                <Plus className="h-4 w-4" />
                                Create Employee
                            </button>
                        </div>
                    </div>
                </header>

                <div className="mx-auto max-w-7xl px-6 py-8">
                    <div className="grid gap-4 md:grid-cols-3">
                        <StatCard
                            title="Total Users"
                            value={users.length}
                            icon={Users}
                            description="All login accounts"
                        />

                        <StatCard
                            title="Active Users"
                            value={activeUsers}
                            icon={CheckCircle2}
                            description="Currently active accounts"
                        />

                        <StatCard
                            title="Privileged Users"
                            value={privilegedUsers}
                            icon={ShieldCheck}
                            description="HR and administration access"
                        />
                    </div>

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900">
                                    User Accounts
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Login accounts created from employee
                                    profiles.
                                </p>
                            </div>

                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search users"
                                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                />
                            </div>
                        </div>

                        {filteredUsers.length === 0 ? (
                            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                                    <UserRound className="h-6 w-6" />
                                </div>

                                <h3 className="mt-5 text-base font-semibold text-slate-900">
                                    {search
                                        ? "No users found"
                                        : "No user accounts yet"}
                                </h3>

                                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                                    {search
                                        ? "Try a different name, email, role, employee ID, or department."
                                        : "Create an employee from the Employees module and their login account will appear here automatically."}
                                </p>

                                {!search && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.push(
                                                "/admin/employees/new"
                                            )
                                        }
                                        className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add First Employee
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[850px]">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/70">
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                User
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Employee
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Role
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Department
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Access
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {filteredUsers.map((user) => {
                                            const employee = user.employeeId
                                                ? employeeMap.get(
                                                      user.employeeId
                                                  )
                                                : undefined;

                                            return (
                                                <tr
                                                    key={user.id}
                                                    className="transition hover:bg-slate-50/70"
                                                >
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-semibold text-emerald-700">
                                                                {user.name
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-semibold text-slate-900">
                                                                    {
                                                                        user.name
                                                                    }
                                                                </p>

                                                                <p className="mt-0.5 truncate text-xs text-slate-500">
                                                                    {
                                                                        user.email
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-5">
                                                        {employee ? (
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-800">
                                                                    {
                                                                        employee.employeeId
                                                                    }
                                                                </p>

                                                                <p className="mt-0.5 text-xs text-slate-500">
                                                                    {
                                                                        employee.jobPosition
                                                                    }
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-slate-400">
                                                                Not linked
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-5">
                                                        <div>
                                                            <span
                                                                className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${roleStyles[user.role]}`}
                                                            >
                                                                {
                                                                    roleLabels[
                                                                        user
                                                                            .role
                                                                    ]
                                                                }
                                                            </span>

                                                            <p className="mt-1.5 text-xs text-slate-400">
                                                                {
                                                                    roleDescriptions[
                                                                        user
                                                                            .role
                                                                    ]
                                                                }
                                                            </p>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-5">
                                                        <span className="text-sm text-slate-600">
                                                            {employee
                                                                ?.department ||
                                                                "—"}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-5">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                                                                user.isActive
                                                                    ? "text-emerald-700"
                                                                    : "text-slate-400"
                                                            }`}
                                                        >
                                                            <span
                                                                className={`h-2 w-2 rounded-full ${
                                                                    user.isActive
                                                                        ? "bg-emerald-500"
                                                                        : "bg-slate-300"
                                                                }`}
                                                            />
                                                            {user.isActive
                                                                ? "Active"
                                                                : "Inactive"}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-5 text-right">
                                                        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500">
                                                            <KeyRound className="h-3.5 w-3.5" />
                                                            Login enabled
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {users.length > 0 && (
                        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                            <span>
                                Showing {filteredUsers.length} of{" "}
                                {users.length} users
                            </span>

                            <span>
                                {employeeUsers} employee accounts
                            </span>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function StatCard({
    title,
    value,
    description,
    icon: Icon,
}: {
    title: string;
    value: number;
    description: string;
    icon: typeof Users;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        {description}
                    </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}