"use client";

import { useState } from "react";
import {
    CheckCircle2,
    ChevronDown,
    KeyRound,
    Plus,
    Search,
    ShieldCheck,
    UserCog,
    Users,
    X,
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";

type UserRole =
    | "employee"
    | "hr_manager"
    | "hr_payroll_user"
    | "hr_payroll_manager"
    | "admin";

const roles: {
    value: UserRole;
    label: string;
    description: string;
}[] = [
    {
        value: "employee",
        label: "Employee",
        description:
            "Access personal HR information and employee self-service.",
    },
    {
        value: "hr_manager",
        label: "HR Manager",
        description:
            "Manage employees, leave, attendance and HR operations.",
    },
    {
        value: "hr_payroll_user",
        label: "HR Payroll User",
        description:
            "Work with payroll information and payroll operations.",
    },
    {
        value: "hr_payroll_manager",
        label: "HR Payroll Manager",
        description:
            "Manage payroll processes, salary and payroll approvals.",
    },
    {
        value: "admin",
        label: "Admin",
        description:
            "Full access to the PeoplePay360 administration system.",
    },
];

export default function UsersPage() {
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");
    const [employee, setEmployee] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<UserRole>("employee");
    const [password, setPassword] = useState("");

    const selectedRole = roles.find((item) => item.value === role);

    const closeModal = () => {
        setShowModal(false);
        setEmployee("");
        setEmail("");
        setRole("employee");
        setPassword("");
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
    };

    return (
        <main className="flex min-h-screen bg-[#f7f9f8]">
            <AdminSidebar />

            <div className="min-w-0 flex-1">
                <header className="flex h-[76px] items-center justify-between border-b border-slate-200 bg-white px-6 lg:px-8">
                    <div>
                        <p className="text-xs font-medium text-slate-400">
                            Admin Portal
                        </p>

                        <h1 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">
                            Users
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden h-10 w-64 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 md:flex">
                            <Search
                                size={17}
                                className="text-slate-400"
                            />

                            <input
                                type="text"
                                placeholder="Search anything..."
                                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                            />

                            <span className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                                /
                            </span>
                        </div>

                        <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-[#063d2f] text-sm font-bold text-white sm:flex">
                            A
                        </div>
                    </div>
                </header>

                <div className="space-y-6 p-6 lg:p-8">
                    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                    User Management
                                </h2>

                                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                    Access Control
                                </span>
                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                                Manage login accounts, roles and system access.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowModal(true)}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#063d2f] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#07513e]"
                        >
                            <Plus size={17} />
                            Create User
                        </button>
                    </section>

                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <StatCard
                            title="Total Users"
                            value="0"
                            description="Login accounts"
                            icon={Users}
                            iconClass="bg-emerald-50 text-emerald-700"
                        />

                        <StatCard
                            title="Active Users"
                            value="0"
                            description="Currently active"
                            icon={CheckCircle2}
                            iconClass="bg-blue-50 text-blue-600"
                        />

                        <StatCard
                            title="Available Roles"
                            value="5"
                            description="System access levels"
                            icon={ShieldCheck}
                            iconClass="bg-violet-50 text-violet-600"
                        />
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    Login Accounts
                                </h3>

                                <p className="mt-1 text-xs text-slate-400">
                                    Employee login accounts and assigned
                                    permissions.
                                </p>
                            </div>

                            <div className="relative w-full lg:w-72">
                                <Search
                                    size={17}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search users..."
                                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                                />
                            </div>
                        </div>

                        <div className="flex min-h-[400px] flex-col items-center justify-center px-6 py-16 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                                <UserCog size={29} />
                            </div>

                            <h3 className="mt-5 text-lg font-bold text-slate-900">
                                No user accounts yet
                            </h3>

                            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                                There are no login accounts in the system yet.
                                Create a user account for an existing employee
                                when login access is required.
                            </p>

                            <button
                                type="button"
                                onClick={() => setShowModal(true)}
                                className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-[#063d2f] px-4 text-sm font-semibold text-white transition hover:bg-[#07513e]"
                            >
                                <Plus size={17} />
                                Create First User
                            </button>
                        </div>
                    </section>
                </div>
            </div>

            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeModal();
                        }
                    }}
                >
                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Create User
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Give an existing employee login access.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                aria-label="Close modal"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5 p-6"
                        >
                            <div>
                                <label
                                    htmlFor="employee"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Employee
                                </label>

                                <div className="relative">
                                    <select
                                        id="employee"
                                        value={employee}
                                        onChange={(event) =>
                                            setEmployee(event.target.value)
                                        }
                                        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 pr-10 text-sm text-slate-700 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                                    >
                                        <option value="">
                                            Select an employee
                                        </option>
                                    </select>

                                    <ChevronDown
                                        size={17}
                                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                    />
                                </div>

                                <p className="mt-2 text-xs leading-5 text-slate-400">
                                    Employees will appear here once the
                                    Employees module is connected.
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Work Email
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    placeholder="employee@company.com"
                                    autoComplete="email"
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="role"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Role
                                </label>

                                <div className="relative">
                                    <select
                                        id="role"
                                        value={role}
                                        onChange={(event) =>
                                            setRole(
                                                event.target.value as UserRole
                                            )
                                        }
                                        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 pr-10 text-sm text-slate-700 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                                    >
                                        {roles.map((item) => (
                                            <option
                                                key={item.value}
                                                value={item.value}
                                            >
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>

                                    <ChevronDown
                                        size={17}
                                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                    />
                                </div>

                                {selectedRole && (
                                    <p className="mt-2 text-xs leading-5 text-slate-400">
                                        {selectedRole.description}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Temporary Password
                                </label>

                                <div className="relative">
                                    <KeyRound
                                        size={17}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(event.target.value)
                                        }
                                        placeholder="Enter temporary password"
                                        autoComplete="new-password"
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                                    />
                                </div>

                                <p className="mt-2 text-xs leading-5 text-slate-400">
                                    Passwords will be securely hashed when
                                    backend authentication is connected.
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="h-10 rounded-xl bg-[#063d2f] px-5 text-sm font-semibold text-white transition hover:bg-[#07513e]"
                                >
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}

function StatCard({
    title,
    value,
    description,
    icon: Icon,
    iconClass,
}: {
    title: string;
    value: string;
    description: string;
    icon: React.ElementType;
    iconClass: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
                >
                    <Icon size={19} />
                </div>
            </div>

            <p className="mt-5 text-sm font-semibold text-slate-700">
                {title}
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                {value}
            </p>

            <p className="mt-1 text-xs text-slate-400">
                {description}
            </p>
        </div>
    );
}