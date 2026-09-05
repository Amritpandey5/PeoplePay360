"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";import {
    ArrowLeft,
    CalendarDays,
    CircleDollarSign,
    Clock3,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    MapPin,
    Phone,
    UserPlus,
    UserRound,
    Users,
} from "lucide-react";
import { createAdminEmployee } from "@/lib/admin-api";
import type { PaymentBasis } from "@/types/employee";

const roles = [
    "Employee",
    "HR Payroll User",
    "HR Payroll Manager",
    "HR Manager",
];

const paymentBasisOptions: {
    value: PaymentBasis;
    label: string;
}[] = [
    {
        value: "daily",
        label: "Daily Basis",
    },
    {
        value: "weekly",
        label: "Weekly Basis",
    },
    {
        value: "monthly",
        label: "Monthly Basis",
    },
];

function FieldLabel({
    children,
    required = false,
}: {
    children: React.ReactNode;
    required?: boolean;
}) {
    return (
        <label className="mb-2 block text-sm font-semibold text-slate-700">
            {children}
            {required && (
                <span className="ml-1 text-emerald-600">
                    *
                </span>
            )}
        </label>
    );
}

function InputField({
    label,
    type = "text",
    placeholder,
    icon: Icon,
    required = false,
    value,
    onChange,
    min,
    step,
}: {
    label: string;
    type?: string;
    placeholder: string;
    icon?: React.ElementType;
    required?: boolean;
    value: string;
    onChange: (value: string) => void;
    min?: string;
    step?: string;
}) {
    return (
        <div>
            <FieldLabel required={required}>
                {label}
            </FieldLabel>

            <div className="relative">
                {Icon && (
                    <Icon
                        size={17}
                        strokeWidth={1.8}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                )}

                <input
                    type={type}
                    value={value}
                    onChange={(event) =>
                        onChange(
                            event.target.value
                        )
                    }
                    placeholder={placeholder}
                    min={min}
                    step={step}
                    className={`h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                        Icon
                            ? "pl-11 pr-4"
                            : "px-4"
                    }`}
                />
            </div>
        </div>
    );
}
export default function NewEmployeePage() {
     const router = useRouter();
    const [showPassword, setShowPassword] =
        useState(false);

    const [error, setError] =
        useState("");

const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    password: "",
    dateOfJoining: "",
    dateOfBirth: "",
    paymentBasis: "" as PaymentBasis | "",
    workingHours: "8",
    workingDays: "5",
    basicSalary: "",
    hra: "",
    allowances: "",
    deductions: "",
    location: "",
    role: "",
});

    const updateField = (
        field: keyof typeof form,
        value: string
    ) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));

        setError("");
    };
    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (
            !form.name.trim() ||
            !form.email.trim() ||
            !form.phone.trim() ||
            !form.gender ||
            !form.password ||
            !form.dateOfJoining ||
            !form.dateOfBirth ||
            !form.paymentBasis ||
            !form.workingHours ||
            !form.workingDays ||
            !form.location.trim() ||
            !form.role
        ) {
            setError(
                "Please complete all required fields."
            );
            return;
        }

        if (!/^[0-9]{10}$/.test(form.phone)) {
            setError(
                "Phone number must contain exactly 10 digits."
            );
            return;
        }

        const workingHours =
            Number(form.workingHours);

        const workingDays =
            Number(form.workingDays);

        if (
            workingHours <= 0 ||
            workingHours > 24
        ) {
            setError(
                "Working hours must be between 1 and 24 hours."
            );
            return;
        }

        if (
            workingDays <= 0 ||
            workingDays > 7
        ) {
            setError(
                "Working days must be between 1 and 7 days per week."
            );
            return;
        }

        if (form.dateOfJoining < today) {
            setError(
                "Date of Joining cannot be earlier than today."
            );
            return;
        }

        try {
            const response = await createAdminEmployee({
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone,
                gender: form.gender,
                password: form.password,
                dateOfJoining: form.dateOfJoining,
                dateOfBirth: form.dateOfBirth,
                paymentBasis: form.paymentBasis,
                workingHours,
                workingDays,
                basicSalary: Number(
                    form.basicSalary || 0
                ),
                hra: Number(form.hra || 0),
                allowances: Number(
                    form.allowances || 0
                ),
                deductions: Number(
                    form.deductions || 0
                ),
                location: form.location.trim(),
                role: form.role,
            });

            if (response.success === false) {
                setError(response.message || "Unable to create employee.");
                return;
            }

            router.push("/admin/employee");
        } catch {
            setError("Unable to create employee. Please try again.");
        }
    };
const today =
    new Date()
        .toISOString()
        .split("T")[0];

    return (
        <div className="min-h-screen bg-[#f7f9f8]">
            <div className="mx-auto max-w-350px px-6 py-7 lg:px-8">
                <div className="mb-7 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/employee"
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                            <ArrowLeft
                                size={18}
                            />
                        </Link>

                        <div>
                            <div className="flex items-center gap-2">
                                <UserPlus
                                    size={19}
                                    className="text-emerald-600"
                                />

                                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                    Add Employee
                                </h1>
                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                                Create a new employee profile and system access.
                            </p>
                        </div>
                    </div>

                    <div className="hidden rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700 md:block">
                        Employee Setup
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <Users
                                        size={19}
                                    />
                                </div>

                                <div>
                                    <h2 className="text-base font-bold text-slate-900">
                                        Basic Information
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Personal information and login credentials.
                                    </p>
                                </div>
                            </div>
                        </div>


                        <div className="grid gap-5 p-6 md:grid-cols-2">
                            <InputField
                                label="Full Name"
                                placeholder="Enter employee name"
                                icon={Users}
                                required
                                value={form.name}
                                onChange={(
                                    value
                                ) =>
                                    updateField(
                                        "name",
                                        value
                                    )
                                }
                            />
                            

                           <InputField 
    label="Email Address" 
    type="email" 
    placeholder="employee@company.com" 
    icon={Mail} 
    required 
    value={form.email} 
    onChange={(value) => 
        updateField(
            "email",
            value
        )
    } 
/>

<div>
    <FieldLabel required>
        Phone Number
    </FieldLabel>

    <div className="relative">
        <Phone
            size={17}
            strokeWidth={1.8}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
    type="tel"
    inputMode="numeric"
    pattern="[0-9]*"
    maxLength={10}
    value={form.phone}
    onChange={(e) => {
        const value = e.target.value.replace(/\D/g, "");
        setForm({
            ...form,
            phone: value,
        });
    }}
    placeholder="Enter phone number"
    className="w-full rounded-xl border border-slate-200 bg-white px-11 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
/>
    </div>
</div>

<div>
    <FieldLabel required>
        Password
    </FieldLabel>

    <div className="relative">
        <LockKeyhole
            size={17}
            strokeWidth={1.8}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
            type={
                showPassword
                    ? "text"
                    : "password"
            }
            value={form.password}
            onChange={(event) =>
                updateField(
                    "password",
                    event.target.value
                )
            }
            placeholder="Create login password"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        />

        <button
            type="button"
            onClick={() =>
                setShowPassword(
                    (current) => !current
                )
            }
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
            {showPassword ? (
                <EyeOff size={17} />
            ) : (
                <Eye size={17} />
            )}
        </button>
    </div>
</div>

<div>
    <FieldLabel required>
        Gender
    </FieldLabel>

    <div className="relative">
        <UserRound
            size={17}
            strokeWidth={1.8}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <select
            value={form.gender}
            onChange={(event) =>
                updateField(
                    "gender",
                    event.target.value
                )
            }
            className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        >
            <option value="">
                Select gender
            </option>
            <option value="male">
                Male
            </option>
            <option value="female">
                Female
            </option>
            <option value="other">
                Other
            </option>
            <option value="prefer_not_to_say">
                Prefer not to say
            </option>
        </select>
    </div>
</div>
                            <div>
                                <FieldLabel required>
                                    Password
                                </FieldLabel>

                                <div className="relative">
                                    <LockKeyhole
                                        size={17}
                                        strokeWidth={
                                            1.8
                                        }
                                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={
                                            form.password
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateField(
                                                "password",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Create login password"
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (
                                                    current
                                                ) =>
                                                    !current
                                            )
                                        }
                                        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff
                                                size={
                                                    17
                                                }
                                            />
                                        ) : (
                                            <Eye
                                                size={
                                                    17
                                                }
                                            />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <InputField
                                label="Date of Birth"
                                type="date"
                                placeholder="Select date of birth"
                                icon={
                                    CalendarDays
                                }
                                required
                                value={
                                    form.dateOfBirth
                                }
                                onChange={(
                                    value
                                ) =>
                                    updateField(
                                        "dateOfBirth",
                                        value
                                    )
                                }
                            />

                            <InputField
                                label="Date of Joining"
                                type="date"
                                placeholder="Select joining date"
                                icon={
                                    CalendarDays
                                }
                                required
                                min={today}
                                value={
                                    form.dateOfJoining
                                }
                                onChange={(
                                    value
                                ) =>
                                    updateField(
                                        "dateOfJoining",
                                        value
                                    )
                                }
                            />
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <Clock3
                                        size={19}
                                    />
                                </div>

                                <div>
                                    <h2 className="text-base font-bold text-slate-900">
                                        Work & Payment Settings
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Configure how the employee is paid and their standard working schedule.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-5 p-6 md:grid-cols-3">
                            <div>
                                <FieldLabel required>
                                    Payment Basis
                                </FieldLabel>

                                <select
                                    value={
                                        form.paymentBasis
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        updateField(
                                            "paymentBasis",
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    className={`h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 ${
                                        form.paymentBasis
                                            ? "text-slate-900"
                                            : "text-slate-400"
                                    }`}
                                >
                                    <option value="">
                                        Select payment basis
                                    </option>

                                    {paymentBasisOptions.map(
                                        (
                                            option
                                        ) => (
                                            <option
                                                key={
                                                    option.value
                                                }
                                                value={
                                                    option.value
                                                }
                                            >
                                                {
                                                    option.label
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <InputField
                                label="Working Hours"
                                type="number"
                                placeholder="8"
                                icon={Clock3}
                                required
                                min="1"
                                step="0.5"
                                value={
                                    form.workingHours
                                }
                                onChange={(
                                    value
                                ) =>
                                    updateField(
                                        "workingHours",
                                        value
                                    )
                                }
                            />

                            <div>
                                <FieldLabel required>
                                    Working Days
                                </FieldLabel>

                                <select
                                    value={
                                        form.workingDays
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        updateField(
                                            "workingDays",
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                >
                                    <option value="1">
                                        1 Day / Week
                                    </option>
                                    <option value="2">
                                        2 Days / Week
                                    </option>
                                    <option value="3">
                                        3 Days / Week
                                    </option>
                                    <option value="4">
                                        4 Days / Week
                                    </option>
                                    <option value="5">
                                        5 Days / Week
                                    </option>
                                    <option value="6">
                                        6 Days / Week
                                    </option>
                                    <option value="7">
                                        7 Days / Week
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div className="mx-6 mb-6 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
                            <p className="text-xs font-medium text-emerald-800">
                                Payment Basis determines the employee's payroll calculation frequency. Working hours and working days will be used for attendance and payroll calculations.
                            </p>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CircleDollarSign
                    size={19}
                />
            </div>

            <div>
                <h2 className="text-base font-bold text-slate-900">
                    Salary Allocations
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                    Define the employee's salary payout components.
                </p>
            </div>
        </div>
    </div>

    <div className="grid gap-5 p-6 md:grid-cols-2 lg:grid-cols-4">
        <InputField
            label="Basic Salary"
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={form.basicSalary}
            onChange={(value) =>
                updateField(
                    "basicSalary",
                    value
                )
            }
        />

        <InputField
            label="HRA"
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={form.hra}
            onChange={(value) =>
                updateField(
                    "hra",
                    value
                )
            }
        />

        <InputField
            label="Allowances"
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={form.allowances}
            onChange={(value) =>
                updateField(
                    "allowances",
                    value
                )
            }
        />

        <InputField
            label="Deductions"
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={form.deductions}
            onChange={(value) =>
                updateField(
                    "deductions",
                    value
                )
            }
        />
    </div>
</section>
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <MapPin
                                        size={19}
                                    />
                                </div>

                                <div>
                                    <h2 className="text-base font-bold text-slate-900">
                                        Employee Details
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Residential location and system access role.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-5 p-6 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <FieldLabel required>
                                    Residential Location
                                </FieldLabel>

                                <div className="relative">
                                    <MapPin
                                        size={17}
                                        strokeWidth={
                                            1.8
                                        }
                                        className="pointer-events-none absolute left-4 top-4 text-slate-400"
                                    />

                                    <textarea
                                        value={
                                            form.location
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateField(
                                                "location",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Enter where the employee currently lives"
                                        rows={3}
                                        className="w-full resize-none rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                    />
                                </div>

                                <p className="mt-2 text-xs text-slate-400">
                                    Example: Kankarbagh, Patna, Bihar - 800020
                                </p>
                            </div>

                            <div>
                                <FieldLabel required>
                                    Role
                                </FieldLabel>

                                <div className="relative">
                                    <LockKeyhole
                                        size={17}
                                        strokeWidth={
                                            1.8
                                        }
                                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <select
                                        value={
                                            form.role
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateField(
                                                "role",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className={`h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 ${
                                            form.role
                                                ? "text-slate-900"
                                                : "text-slate-400"
                                        }`}
                                    >
                                        <option value="">
                                            Select employee role
                                        </option>

                                        {roles.map(
                                            (
                                                role
                                            ) => (
                                                <option
                                                    key={
                                                        role
                                                    }
                                                    value={
                                                        role
                                                    }
                                                >
                                                    {
                                                        role
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">
                                Create employee profile
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Required fields are marked with an asterisk.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/admin/employee"
                                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                className="rounded-xl bg-[#063d2f] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#07513e]"
                            >
                                Create Employee
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
