"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    ArrowUpRight,
    CircleDollarSign,
    Mail,
    MapPin,
    Pencil,
    Plus,
    Search,
    UserRound,
    Users,
    X,
} from "lucide-react";
import {
    getAdminEmployees,
    updateAdminEmployee,
} from "@/lib/admin-api";
import type {
    Employee,
    PaymentBasis,
} from "@/types/employee";

function formatDate(date: string) {
    if (!date) {
        return "-";
    }

    return new Date(`${date}T00:00:00`).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}

function formatCurrency(value: number) {
    return `₹${value.toLocaleString("en-IN")}`;
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [search, setSearch] = useState("");
    const [selectedEmployee, setSelectedEmployee] =
        useState<Employee | null>(null);
    const [editingEmployee, setEditingEmployee] =
        useState<Employee | null>(null);
    const [saveError, setSaveError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const [editForm, setEditForm] = useState({
        name: "",
        email: "",
        dateOfJoining: "",
        dateOfBirth: "",
        paymentBasis: "monthly" as PaymentBasis,
        workingHours: 8,
        workingDays: 5,
        basicSalary: 0,
        hra: 0,
        allowances: 0,
        deductions: 0,
        location: "",
        role: "",
    });

    const loadEmployees = async () => {
        try {
            setSaveError("");
            setEmployees(await getAdminEmployees());
        } catch {
            setSaveError("Unable to load employees.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    const filteredEmployees = employees.filter((employee) => {
        const searchValue = search.toLowerCase();

        return (
            employee.name.toLowerCase().includes(searchValue) ||
            employee.email.toLowerCase().includes(searchValue) ||
            employee.role.toLowerCase().includes(searchValue) ||
            employee.location.toLowerCase().includes(searchValue)
        );
    });

    const activeEmployees = employees.filter(
        (employee) => employee.status === "active"
    ).length;

    const payrollEmployees = employees.filter(
        (employee) => employee.basicSalary > 0
    ).length;

    function openEdit(employee: Employee) {
        setSelectedEmployee(null);
        setSaveError("");

        setEditForm({
            name: employee.name,
            email: employee.email,
            dateOfJoining: employee.dateOfJoining,
            dateOfBirth: employee.dateOfBirth,
            paymentBasis: employee.paymentBasis,
            workingHours: employee.workingHours,
            workingDays: employee.workingDays,
            basicSalary: employee.basicSalary,
            hra: employee.hra,
            allowances: employee.allowances,
            deductions: employee.deductions,
            location: employee.location,
            role: employee.role,
        });

        setEditingEmployee(employee);
    }

    function handleEditChange(
        field: keyof typeof editForm,
        value: string | number
    ) {
        setEditForm((current) => ({
            ...current,
            [field]: value,
        }));
    }

    async function handleSaveEdit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!editingEmployee) {
            return;
        }

        setSaveError("");

        if (
            !editForm.name.trim() ||
            !editForm.email.trim() ||
            !editForm.dateOfJoining ||
            !editForm.dateOfBirth ||
            !editForm.location.trim() ||
            !editForm.role.trim()
        ) {
            setSaveError("Please fill all required fields.");
            return;
        }

        if (
            editForm.workingHours < 1 ||
            editForm.workingHours > 24
        ) {
            setSaveError(
                "Working hours must be between 1 and 24."
            );
            return;
        }

        if (
            editForm.workingDays < 1 ||
            editForm.workingDays > 7
        ) {
            setSaveError(
                "Working days must be between 1 and 7."
            );
            return;
        }

        try {
            const response = await updateAdminEmployee(
                editingEmployee.id,
                {
                name: editForm.name.trim(),
                email: editForm.email.trim(),
                dateOfJoining: editForm.dateOfJoining,
                dateOfBirth: editForm.dateOfBirth,
                paymentBasis: editForm.paymentBasis,
                workingHours: Number(
                    editForm.workingHours
                ),
                workingDays: Number(
                    editForm.workingDays
                ),
                basicSalary: Number(
                    editForm.basicSalary
                ),
                hra: Number(editForm.hra),
                allowances: Number(
                    editForm.allowances
                ),
                deductions: Number(
                    editForm.deductions
                ),
                location: editForm.location.trim(),
                role: editForm.role.trim(),
                }
            );

            if (response.success === false) {
                setSaveError(
                    response.message || "Unable to update employee. Please try again."
                );
                return;
            }

            await loadEmployees();
            setEditingEmployee(null);
        } catch {
            setSaveError(
                "Unable to update employee. Please try again."
            );
        }
    }

    return (
        <div className="min-h-screen bg-[#f7f9f8]">
            <div className="mx-auto max-w-[1400px] px-6 py-7 lg:px-8">
                <div className="mb-7 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-emerald-700">
                            Workforce
                        </p>

                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                            Employees
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage your organization's employee profiles.
                        </p>
                    </div>

                    <Link
                        href="/admin/employee/new"
                        className="flex items-center gap-2 rounded-xl bg-[#063d2f] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#07513e]"
                    >
                        <Plus size={18} />
                        Add Employee
                    </Link>
                </div>

                <div className="mb-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Total Employees
                                </p>

                                <p className="mt-2 text-3xl font-bold text-slate-900">
                                    {employees.length}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <Users size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Active Employees
                                </p>

                                <p className="mt-2 text-3xl font-bold text-slate-900">
                                    {activeEmployees}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <UserRound size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Payroll Employees
                                </p>

                                <p className="mt-2 text-3xl font-bold text-slate-900">
                                    {payrollEmployees}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <CircleDollarSign size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                Employee Directory
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                {isLoading ? "Loading" : employees.length} employee
                                {employees.length === 1 ? "" : "s"} in your organization.
                            </p>
                        </div>

                        <div className="relative w-full md:w-80">
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
                                placeholder="Search employees..."
                                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                            />
                        </div>
                    </div>

                    {filteredEmployees.length === 0 ? (
                        <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <Users size={28} />
                            </div>

                            <h3 className="mt-5 text-base font-bold text-slate-900">
                                {employees.length === 0
                                    ? "No employees yet"
                                    : "No employees found"}
                            </h3>

                            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                                {employees.length === 0
                                    ? "Create your first employee profile to start managing your workforce."
                                    : "Try searching with a different name, email, role or location."}
                            </p>

                            {employees.length === 0 && (
                                <Link
                                    href="/admin/employee/new"
                                    className="mt-6 flex items-center gap-2 rounded-xl bg-[#063d2f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#07513e]"
                                >
                                    <Plus size={17} />
                                    Add Employee
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1100px]">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Employee
                                        </th>

                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Role
                                        </th>

                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Joining Date
                                        </th>

                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Location
                                        </th>

                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Salary
                                        </th>

                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Status
                                        </th>

                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredEmployees.map((employee) => (
                                        <tr
                                            key={employee.id}
                                            className="border-b border-slate-100 transition hover:bg-slate-50/60"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700">
                                                        {employee.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-bold text-slate-900">
                                                            {employee.name}
                                                        </p>

                                                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                                            <Mail size={12} />

                                                            <span>
                                                                {employee.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-5">
                                                <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                                                    {employee.role}
                                                </span>
                                            </td>

                                            <td className="px-6 py-5 text-sm text-slate-600">
                                                {formatDate(
                                                    employee.dateOfJoining
                                                )}
                                            </td>

                                            <td className="max-w-[220px] px-6 py-5">
                                                <div className="flex items-start gap-2 text-sm text-slate-600">
                                                    <MapPin
                                                        size={15}
                                                        className="mt-0.5 shrink-0 text-slate-400"
                                                    />

                                                    <span className="line-clamp-2">
                                                        {employee.location}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-5 text-sm font-semibold text-slate-800">
                                                {formatCurrency(
                                                    employee.basicSalary
                                                )}
                                            </td>

                                            <td className="px-6 py-5">
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                    Active
                                                </span>
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedEmployee(
                                                                employee
                                                            )
                                                        }
                                                        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                                                    >
                                                        View
                                                        <ArrowUpRight size={14} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEdit(employee)
                                                        }
                                                        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                                                    >
                                                        <Pencil size={14} />
                                                        Edit
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {selectedEmployee && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-5 backdrop-blur-sm"
                    onClick={() => setSelectedEmployee(null)}
                >
                    <div
                        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700">
                                    {selectedEmployee.name
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        {selectedEmployee.name}
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        {selectedEmployee.id}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedEmployee(null)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-6 p-6">
                            <section>
                                <div className="mb-4 flex items-center gap-2">
                                    <UserRound
                                        size={17}
                                        className="text-emerald-600"
                                    />

                                    <h3 className="text-sm font-bold text-slate-900">
                                        Personal Information
                                    </h3>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-xl bg-slate-50 p-4">
                                        <p className="text-xs text-slate-500">
                                            Full Name
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {selectedEmployee.name}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 p-4">
                                        <p className="text-xs text-slate-500">
                                            Email Address
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {selectedEmployee.email}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 p-4">
                                        <p className="text-xs text-slate-500">
                                            Date of Birth
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {formatDate(
                                                selectedEmployee.dateOfBirth
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 p-4">
                                        <p className="text-xs text-slate-500">
                                            Date of Joining
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {formatDate(
                                                selectedEmployee.dateOfJoining
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 p-4">
                                        <p className="text-xs text-slate-500">
                                            Residential Location
                                        </p>

                                        <p className="mt-1 flex items-start gap-2 text-sm font-semibold text-slate-900">
                                            <MapPin
                                                size={15}
                                                className="mt-0.5 shrink-0 text-emerald-600"
                                            />
                                            {selectedEmployee.location}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 p-4">
                                        <p className="text-xs text-slate-500">
                                            Payment Basis
                                        </p>

                                        <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
                                            {selectedEmployee.paymentBasis} Basis
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 p-4">
                                        <p className="text-xs text-slate-500">
                                            Working Hours
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {selectedEmployee.workingHours} hours/day
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 p-4">
                                        <p className="text-xs text-slate-500">
                                            Working Days
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {selectedEmployee.workingDays} days/week
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <div className="mb-4 flex items-center gap-2">
                                    <UserRound
                                        size={17}
                                        className="text-emerald-600"
                                    />

                                    <h3 className="text-sm font-bold text-slate-900">
                                        Access & Role
                                    </h3>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-xl bg-slate-50 p-4">
                                        <p className="text-xs text-slate-500">
                                            Role
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {selectedEmployee.role}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 p-4">
                                        <p className="text-xs text-slate-500">
                                            Account Status
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-emerald-700">
                                            Active
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <div className="mb-4 flex items-center gap-2">
                                    <CircleDollarSign
                                        size={17}
                                        className="text-emerald-600"
                                    />

                                    <h3 className="text-sm font-bold text-slate-900">
                                        Payout Allocations
                                    </h3>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                        <p className="text-xs text-slate-500">
                                            Basic Salary
                                        </p>

                                        <p className="mt-1 text-sm font-bold text-slate-900">
                                            {formatCurrency(
                                                selectedEmployee.basicSalary
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                        <p className="text-xs text-slate-500">
                                            HRA
                                        </p>

                                        <p className="mt-1 text-sm font-bold text-slate-900">
                                            {formatCurrency(
                                                selectedEmployee.hra
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                        <p className="text-xs text-slate-500">
                                            Allowances
                                        </p>

                                        <p className="mt-1 text-sm font-bold text-slate-900">
                                            {formatCurrency(
                                                selectedEmployee.allowances
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                        <p className="text-xs text-slate-500">
                                            Deductions
                                        </p>

                                        <p className="mt-1 text-sm font-bold text-slate-900">
                                            {formatCurrency(
                                                selectedEmployee.deductions
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 md:col-span-2">
                                        <p className="text-xs text-emerald-700">
                                            Estimated Net Salary
                                        </p>

                                        <p className="mt-1 text-xl font-bold text-emerald-800">
                                            {formatCurrency(
                                                selectedEmployee.basicSalary +
                                                    selectedEmployee.hra +
                                                    selectedEmployee.allowances -
                                                    selectedEmployee.deductions
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                                <p className="text-xs text-slate-500">
                                    Employee password is securely excluded from
                                    the profile display.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {editingEmployee && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-5 backdrop-blur-sm"
                    onClick={() => setEditingEmployee(null)}
                >
                    <div
                        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                                    Workforce
                                </p>

                                <h2 className="mt-1 text-lg font-bold text-slate-900">
                                    Edit Employee
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    Update employee profile and payroll settings.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setEditingEmployee(null)
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSaveEdit}
                            className="p-6"
                        >
                            <div className="space-y-7">
                                <section>
                                    <h3 className="mb-4 text-sm font-bold text-slate-900">
                                        Personal Information
                                    </h3>

                                    <div className="grid gap-5 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                Full Name
                                            </label>

                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(event) =>
                                                    handleEditChange(
                                                        "name",
                                                        event.target.value
                                                    )
                                                }
                                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                Email Address
                                            </label>

                                            <input
                                                type="email"
                                                value={editForm.email}
                                                onChange={(event) =>
                                                    handleEditChange(
                                                        "email",
                                                        event.target.value
                                                    )
                                                }
                                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                Date of Birth
                                            </label>

                                            <input
                                                type="date"
                                                value={editForm.dateOfBirth}
                                                onChange={(event) =>
                                                    handleEditChange(
                                                        "dateOfBirth",
                                                        event.target.value
                                                    )
                                                }
                                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                Date of Joining
                                            </label>

                                            <input
                                                type="date"
                                                value={editForm.dateOfJoining}
                                                onChange={(event) =>
                                                    handleEditChange(
                                                        "dateOfJoining",
                                                        event.target.value
                                                    )
                                                }
                                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                                required
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                Residential Location
                                            </label>

                                            <input
                                                type="text"
                                                value={editForm.location}
                                                onChange={(event) =>
                                                    handleEditChange(
                                                        "location",
                                                        event.target.value
                                                    )
                                                }
                                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                                required
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="mb-4 text-sm font-bold text-slate-900">
                                        Work & Payment Settings
                                    </h3>

                                    <div className="grid gap-5 md:grid-cols-3">
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                Payment Basis
                                            </label>

                                            <select
                                                value={editForm.paymentBasis}
                                                onChange={(event) =>
                                                    handleEditChange(
                                                        "paymentBasis",
                                                        event.target.value as PaymentBasis
                                                    )
                                                }
                                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                            >
                                                <option value="daily">
                                                    Daily Basis
                                                </option>

                                                <option value="weekly">
                                                    Weekly Basis
                                                </option>

                                                <option value="monthly">
                                                    Monthly Basis
                                                </option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                Working Hours / Day
                                            </label>

                                            <input
                                                type="number"
                                                min="1"
                                                max="24"
                                                step="0.5"
                                                value={editForm.workingHours}
                                                onChange={(event) =>
                                                    handleEditChange(
                                                        "workingHours",
                                                        Number(
                                                            event.target.value
                                                        )
                                                    )
                                                }
                                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                Working Days / Week
                                            </label>

                                            <select
                                                value={editForm.workingDays}
                                                onChange={(event) =>
                                                    handleEditChange(
                                                        "workingDays",
                                                        Number(
                                                            event.target.value
                                                        )
                                                    )
                                                }
                                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                            >
                                                {Array.from(
                                                    { length: 7 },
                                                    (_, index) => index + 1
                                                ).map((day) => (
                                                    <option
                                                        key={day}
                                                        value={day}
                                                    >
                                                        {day}{" "}
                                                        {day === 1
                                                            ? "Day"
                                                            : "Days"}{" "}
                                                        / Week
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="mb-4 text-sm font-bold text-slate-900">
                                        Payout Allocations
                                    </h3>

                                    <div className="grid gap-5 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                Basic Salary
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                value={editForm.basicSalary}
                                                onChange={(event) =>
                                                    handleEditChange(
                                                        "basicSalary",
                                                        Number(
                                                            event.target.value
                                                        )
                                                    )
                                                }
                                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                HRA
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                value={editForm.hra}
                                                onChange={(event) =>
                                                    handleEditChange(
                                                        "hra",
                                                        Number(
                                                            event.target.value
                                                        )
                                                    )
                                                }
                                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                Allowances
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                value={editForm.allowances}
                                                onChange={(event) =>
                                                    handleEditChange(
                                                        "allowances",
                                                        Number(
                                                            event.target.value
                                                        )
                                                    )
                                                }
                                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                Deductions
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                value={editForm.deductions}
                                                onChange={(event) =>
                                                    handleEditChange(
                                                        "deductions",
                                                        Number(
                                                            event.target.value
                                                        )
                                                    )
                                                }
                                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                                        <p className="text-xs font-medium text-emerald-700">
                                            Estimated Net Salary
                                        </p>

                                        <p className="mt-1 text-xl font-bold text-emerald-800">
                                            {formatCurrency(
                                                Number(
                                                    editForm.basicSalary
                                                ) +
                                                    Number(
                                                        editForm.hra
                                                    ) +
                                                    Number(
                                                        editForm.allowances
                                                    ) -
                                                    Number(
                                                        editForm.deductions
                                                    )
                                            )}
                                        </p>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="mb-4 text-sm font-bold text-slate-900">
                                        Access & Role
                                    </h3>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Role
                                        </label>

                                        <input
                                            type="text"
                                            value={editForm.role}
                                            onChange={(event) =>
                                                handleEditChange(
                                                    "role",
                                                    event.target.value
                                                )
                                            }
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                            required
                                        />
                                    </div>
                                </section>

                                {saveError && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                        {saveError}
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setEditingEmployee(null)
                                    }
                                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="rounded-xl bg-[#063d2f] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#07513e]"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
