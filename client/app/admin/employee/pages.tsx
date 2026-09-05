"use client";

import Link from "next/link";
import {
    BriefcaseBusiness,
    CalendarDays,
    ChevronDown,
    Plus,
    Search,
    Users,
} from "lucide-react";
import { useState } from "react";

type EmployeeStatus = "active" | "probation" | "on_leave" | "inactive";

type Employee = {
    id: string;
    employeeId: string;
    name: string;
    email: string;
    department: string;
    position: string;
    joiningDate: string;
    employeeType: string;
    status: EmployeeStatus;
};

const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "probation", label: "Probation" },
    { value: "on_leave", label: "On Leave" },
    { value: "inactive", label: "Inactive" },
];

export default function EmployeesPage() {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [statusOpen, setStatusOpen] = useState(false);

    const employees: Employee[] = [];

    const filteredEmployees = employees.filter((employee) => {
        const query = search.toLowerCase().trim();

        const matchesSearch =
            !query ||
            employee.name.toLowerCase().includes(query) ||
            employee.employeeId.toLowerCase().includes(query) ||
            employee.email.toLowerCase().includes(query) ||
            employee.department.toLowerCase().includes(query);

        const matchesStatus =
            status === "all" || employee.status === status;

        return matchesSearch && matchesStatus;
    });

    const activeEmployees = employees.filter(
        (employee) => employee.status === "active"
    ).length;

    const departments = new Set(
        employees.map((employee) => employee.department)
    ).size;

    return (
        <main className="ml-[250px] min-h-screen bg-[#f7f9f8] px-8 py-8">
            <div className="mx-auto max-w-[1500px]">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[28px] font-semibold tracking-[-0.5px] text-[#17211c]">
                            Employees
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage employee profiles, employment information and
                            organizational details.
                        </p>
                    </div>

                    <Link
                        href="/admin/employees/new"
                        className="flex h-11 items-center gap-2 rounded-xl bg-[#063d2f] px-5 text-sm font-semibold text-white transition hover:bg-[#07523f]"
                    >
                        <Plus size={18} />
                        Add Employee
                    </Link>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Total Employees
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-[#17211c]">
                                    {employees.length}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                <Users size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Active Employees
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-[#17211c]">
                                    {activeEmployees}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                <BriefcaseBusiness size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Departments
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-[#17211c]">
                                    {departments}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                <CalendarDays size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white">
                    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-[#17211c]">
                                Employee Directory
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Search and manage your organization's employees.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative w-full sm:w-[280px]">
                                <Search
                                    size={17}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search employees"
                                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                />
                            </div>

                            <div className="relative w-full sm:w-[170px]">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setStatusOpen((current) => !current)
                                    }
                                    className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-600 transition hover:border-slate-300"
                                >
                                    <span>
                                        {
                                            statusOptions.find(
                                                (option) =>
                                                    option.value === status
                                            )?.label
                                        }
                                    </span>

                                    <ChevronDown
                                        size={16}
                                        className={`transition ${
                                            statusOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>

                                {statusOpen && (
                                    <div className="absolute right-0 top-12 z-20 w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                                        {statusOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => {
                                                    setStatus(option.value);
                                                    setStatusOpen(false);
                                                }}
                                                className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
                                                    status === option.value
                                                        ? "bg-emerald-50 font-medium text-emerald-700"
                                                        : "text-slate-600 hover:bg-slate-50"
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {filteredEmployees.length === 0 ? (
                        <div className="flex min-h-[380px] flex-col items-center justify-center px-6 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                                <Users size={28} />
                            </div>

                            <h3 className="mt-5 text-base font-semibold text-[#17211c]">
                                No employees found
                            </h3>

                            <p className="mt-2 max-w-[460px] text-sm leading-6 text-slate-500">
                                Your employee directory is currently empty. Add
                                your first employee to start managing your
                                workforce.
                            </p>

                            <Link
                                href="/admin/employees/new"
                                className="mt-5 flex h-10 items-center gap-2 rounded-xl bg-[#063d2f] px-4 text-sm font-semibold text-white transition hover:bg-[#07523f]"
                            >
                                <Plus size={17} />
                                Add Employee
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px]">
                                <thead>
                                    <tr className="border-b border-slate-100 text-left">
                                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Employee
                                        </th>
                                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Department
                                        </th>
                                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Position
                                        </th>
                                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Joining Date
                                        </th>
                                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredEmployees.map((employee) => (
                                        <tr
                                            key={employee.id}
                                            className="border-b border-slate-100 last:border-0"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-700">
                                                        {employee.name
                                                            .split(" ")
                                                            .map(
                                                                (part) =>
                                                                    part[0]
                                                            )
                                                            .slice(0, 2)
                                                            .join("")}
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800">
                                                            {employee.name}
                                                        </p>
                                                        <p className="text-xs text-slate-400">
                                                            {
                                                                employee.employeeId
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {employee.department}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {employee.position}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {employee.joiningDate}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                                                    {employee.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}