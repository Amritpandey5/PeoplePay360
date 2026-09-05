"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    GraduationCap,
    KeyRound,
    Loader2,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    UserRound,
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
    addEmployee,
    addUser,
    getEmployees,
} from "@/lib/peoplepay-store";
import type {
    Employee,
    EmployeeType,
    EmploymentStatus,
    UserRole,
} from "@/types/employee";

type FormState = {
    fullName: string;
    email: string;
    phone: string;
    parentName: string;
    address: string;
    location: string;
    education: string;
    company: string;
    department: string;
    jobPosition: string;
    hrManagerId: string;
    reportingManagerId: string;
    joiningDate: string;
    employeeType: EmployeeType;
    employmentStatus: EmploymentStatus;
    workEmail: string;
    role: UserRole;
    temporaryPassword: string;
};

const initialForm: FormState = {
    fullName: "",
    email: "",
    phone: "",
    parentName: "",
    address: "",
    location: "",
    education: "",
    company: "",
    department: "",
    jobPosition: "",
    hrManagerId: "",
    reportingManagerId: "",
    joiningDate: "",
    employeeType: "permanent",
    employmentStatus: "active",
    workEmail: "",
    role: "employee",
    temporaryPassword: "",
};

function CustomSelect({
    value,
    onChange,
    options,
    placeholder,
}: {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
}) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
    );
}

function Field({
    label,
    icon: Icon,
    value,
    onChange,
    placeholder,
    type = "text",
    required = false,
}: {
    label: string;
    icon: typeof UserRound;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    type?: string;
    required?: boolean;
}) {
    return (
        <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <Icon className="h-4 w-4 text-emerald-600" />
                {label}
                {required && <span className="text-rose-500">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                required={required}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
        </div>
    );
}

function Section({
    title,
    description,
    icon: Icon,
    children,
}: {
    title: string;
    description: string;
    icon: typeof UserRound;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">
                            {title}
                        </h2>
                        <p className="mt-0.5 text-sm text-slate-500">
                            {description}
                        </p>
                    </div>
                </div>
            </div>
            <div className="grid gap-5 p-6 md:grid-cols-2">
                {children}
            </div>
        </section>
    );
}

export default function NewEmployeePage() {
    const router = useRouter();
    const [form, setForm] = useState<FormState>(initialForm);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        setEmployees(getEmployees());
    }, []);

    const updateField = <K extends keyof FormState>(
        field: K,
        value: FormState[K]
    ) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const generateEmployeeId = () => {
        const existing = getEmployees();
        const numbers = existing
            .map((employee) => {
                const match = employee.employeeId.match(/(\d+)$/);
                return match ? Number(match[1]) : 0;
            })
            .filter((number) => Number.isFinite(number));

        const nextNumber =
            numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

        return `EMP${String(nextNumber).padStart(4, "0")}`;
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        if (!form.fullName.trim()) {
            setError("Full name is required.");
            return;
        }

        if (!form.email.trim()) {
            setError("Personal email is required.");
            return;
        }

        if (!form.phone.trim()) {
            setError("Phone number is required.");
            return;
        }

        if (!form.company.trim()) {
            setError("Company is required.");
            return;
        }

        if (!form.department.trim()) {
            setError("Department is required.");
            return;
        }

        if (!form.jobPosition.trim()) {
            setError("Job position is required.");
            return;
        }

        if (!form.joiningDate) {
            setError("Joining date is required.");
            return;
        }

        if (!form.workEmail.trim()) {
            setError("Work email is required.");
            return;
        }

        if (!form.temporaryPassword.trim()) {
            setError("Temporary password is required.");
            return;
        }

        const existingEmployees = getEmployees();

        const emailExists = existingEmployees.some(
            (employee) =>
                employee.email.toLowerCase() ===
                    form.email.trim().toLowerCase() ||
                employee.workEmail.toLowerCase() ===
                    form.workEmail.trim().toLowerCase()
        );

        if (emailExists) {
            setError(
                "An employee with this email already exists."
            );
            return;
        }

        setSaving(true);

        try {
            const now = new Date().toISOString();
            const employeeId = generateEmployeeId();

            const employee: Employee = {
                id: crypto.randomUUID(),
                employeeId,
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                parentName: form.parentName.trim(),
                address: form.address.trim(),
                location: form.location.trim(),
                education: form.education.trim(),
                company: form.company.trim(),
                department: form.department.trim(),
                jobPosition: form.jobPosition.trim(),
                hrManagerId: form.hrManagerId,
                reportingManagerId: form.reportingManagerId,
                joiningDate: form.joiningDate,
                employeeType: form.employeeType,
                employmentStatus: form.employmentStatus,
                workEmail: form.workEmail.trim(),
                createdAt: now,
            };

            const user = {
                id: crypto.randomUUID(),
                employeeId,
                name: form.fullName.trim(),
                email: form.workEmail.trim(),
                role: form.role,
                isActive: true,
                passwordConfigured: true,
                createdAt: now,
            };

            addEmployee(employee);
            addUser(user);

            setSuccess(true);

            setTimeout(() => {
                router.push("/admin/employees");
            }, 700);
        } catch {
            setSaving(false);
            setError(
                "Something went wrong while creating the employee."
            );
        }
    };

    const managerOptions = employees
        .filter(
            (employee) =>
                employee.employmentStatus === "active" ||
                employee.employmentStatus === "probation"
        )
        .map((employee) => ({
            value: employee.id,
            label: `${employee.fullName} · ${employee.jobPosition}`,
        }));

    const roleOptions = [
        {
            value: "employee",
            label: "Employee",
        },
        {
            value: "hr_manager",
            label: "HR Manager",
        },
        {
            value: "hr_payroll_user",
            label: "HR Payroll User",
        },
        {
            value: "hr_payroll_manager",
            label: "HR Payroll Manager",
        },
    ];

    return (
        <div className="min-h-screen bg-[#f7f9f8]">
            <AdminSidebar />
            <main className="min-h-screen lg:ml-64">
                <div className="border-b border-slate-200 bg-white">
                    <div className="mx-auto max-w-7xl px-6 py-5">
                        <button
                            type="button"
                            onClick={() =>
                                router.push("/admin/employees")
                            }
                            className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-700"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Employees
                        </button>

                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                            <div>
                                <div className="mb-2 flex items-center gap-2 text-sm text-emerald-700">
                                    <UsersIcon />
                                    Employee Management
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                    Add New Employee
                                </h1>
                                <p className="mt-1 text-sm text-slate-500">
                                    Create the employee profile and login
                                    account together.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                                <div>
                                    <p className="text-xs font-medium text-emerald-700">
                                        Employee ID
                                    </p>
                                    <p className="text-sm font-semibold text-emerald-900">
                                        {generateEmployeeId()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-6 py-8">
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        <Section
                            title="Personal Information"
                            description="Basic information about the employee."
                            icon={UserRound}
                        >
                            <Field
                                label="Full Name"
                                icon={UserRound}
                                value={form.fullName}
                                onChange={(value) =>
                                    updateField("fullName", value)
                                }
                                placeholder="Enter full name"
                                required
                            />

                            <Field
                                label="Personal Email"
                                icon={Mail}
                                value={form.email}
                                onChange={(value) =>
                                    updateField("email", value)
                                }
                                placeholder="name@example.com"
                                type="email"
                                required
                            />

                            <Field
                                label="Phone Number"
                                icon={Phone}
                                value={form.phone}
                                onChange={(value) =>
                                    updateField("phone", value)
                                }
                                placeholder="+91 98765 43210"
                                required
                            />

                            <Field
                                label="Parent / Guardian Name"
                                icon={UserRound}
                                value={form.parentName}
                                onChange={(value) =>
                                    updateField("parentName", value)
                                }
                                placeholder="Enter parent or guardian name"
                            />

                            <Field
                                label="Address"
                                icon={MapPin}
                                value={form.address}
                                onChange={(value) =>
                                    updateField("address", value)
                                }
                                placeholder="Enter full address"
                            />

                            <Field
                                label="Location"
                                icon={MapPin}
                                value={form.location}
                                onChange={(value) =>
                                    updateField("location", value)
                                }
                                placeholder="City / Office location"
                            />

                            <Field
                                label="Education"
                                icon={GraduationCap}
                                value={form.education}
                                onChange={(value) =>
                                    updateField("education", value)
                                }
                                placeholder="Highest qualification"
                            />
                        </Section>

                        <Section
                            title="Work Information"
                            description="Assign the employee to the correct organizational structure."
                            icon={BriefcaseBusiness}
                        >
                            <Field
                                label="Company"
                                icon={Building2}
                                value={form.company}
                                onChange={(value) =>
                                    updateField("company", value)
                                }
                                placeholder="Company name"
                                required
                            />

                            <Field
                                label="Department"
                                icon={Building2}
                                value={form.department}
                                onChange={(value) =>
                                    updateField("department", value)
                                }
                                placeholder="e.g. Engineering"
                                required
                            />

                            <Field
                                label="Job Position"
                                icon={BriefcaseBusiness}
                                value={form.jobPosition}
                                onChange={(value) =>
                                    updateField("jobPosition", value)
                                }
                                placeholder="e.g. Software Engineer"
                                required
                            />

                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <UserRound className="h-4 w-4 text-emerald-600" />
                                    HR Manager
                                </label>
                                <CustomSelect
                                    value={form.hrManagerId}
                                    onChange={(value) =>
                                        updateField(
                                            "hrManagerId",
                                            value
                                        )
                                    }
                                    options={managerOptions}
                                    placeholder={
                                        managerOptions.length
                                            ? "Select HR manager"
                                            : "No managers available"
                                    }
                                />
                            </div>

                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <UserRound className="h-4 w-4 text-emerald-600" />
                                    Reporting Manager
                                </label>
                                <CustomSelect
                                    value={form.reportingManagerId}
                                    onChange={(value) =>
                                        updateField(
                                            "reportingManagerId",
                                            value
                                        )
                                    }
                                    options={managerOptions}
                                    placeholder={
                                        managerOptions.length
                                            ? "Select reporting manager"
                                            : "No managers available"
                                    }
                                />
                            </div>
                        </Section>

                        <Section
                            title="Employment Details"
                            description="Define the employee's employment status and type."
                            icon={CalendarDays}
                        >
                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <CalendarDays className="h-4 w-4 text-emerald-600" />
                                    Joining Date
                                    <span className="text-rose-500">
                                        *
                                    </span>
                                </label>
                                <input
                                    type="date"
                                    value={form.joiningDate}
                                    onChange={(event) =>
                                        updateField(
                                            "joiningDate",
                                            event.target.value
                                        )
                                    }
                                    required
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Employee Type
                                </label>
                                <CustomSelect
                                    value={form.employeeType}
                                    onChange={(value) =>
                                        updateField(
                                            "employeeType",
                                            value as EmployeeType
                                        )
                                    }
                                    options={[
                                        {
                                            value: "permanent",
                                            label: "Permanent",
                                        },
                                        {
                                            value: "temporary",
                                            label: "Temporary",
                                        },
                                        {
                                            value: "contract",
                                            label: "Contract",
                                        },
                                        {
                                            value: "intern",
                                            label: "Intern",
                                        },
                                    ]}
                                    placeholder="Select employee type"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Employment Status
                                </label>
                                <CustomSelect
                                    value={form.employmentStatus}
                                    onChange={(value) =>
                                        updateField(
                                            "employmentStatus",
                                            value as EmploymentStatus
                                        )
                                    }
                                    options={[
                                        {
                                            value: "active",
                                            label: "Active",
                                        },
                                        {
                                            value: "probation",
                                            label: "Probation",
                                        },
                                        {
                                            value: "on_leave",
                                            label: "On Leave",
                                        },
                                        {
                                            value: "inactive",
                                            label: "Inactive",
                                        },
                                    ]}
                                    placeholder="Select status"
                                />
                            </div>
                        </Section>

                        <Section
                            title="Login & Access"
                            description="Create the employee's PeoplePay360 login account."
                            icon={KeyRound}
                        >
                            <Field
                                label="Work Email"
                                icon={Mail}
                                value={form.workEmail}
                                onChange={(value) =>
                                    updateField("workEmail", value)
                                }
                                placeholder="employee@company.com"
                                type="email"
                                required
                            />

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    System Role
                                </label>
                                <CustomSelect
                                    value={form.role}
                                    onChange={(value) =>
                                        updateField(
                                            "role",
                                            value as UserRole
                                        )
                                    }
                                    options={roleOptions}
                                    placeholder="Select system role"
                                />
                            </div>

                            <Field
                                label="Temporary Password"
                                icon={KeyRound}
                                value={form.temporaryPassword}
                                onChange={(value) =>
                                    updateField(
                                        "temporaryPassword",
                                        value
                                    )
                                }
                                placeholder="Enter temporary password"
                                type="password"
                                required
                            />

                            <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        Secure account setup
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        The password is only used during account
                                        creation and is not stored in the
                                        browser data store.
                                    </p>
                                </div>
                            </div>
                        </Section>

                        {error && (
                            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                                <CheckCircle2 className="h-5 w-5" />
                                Employee and login account created
                                successfully.
                            </div>
                        )}

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() =>
                                    router.push("/admin/employees")
                                }
                                className="h-11 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving || success}
                                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-7 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Creating Employee...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-4 w-4" />
                                        Create Employee
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

function UsersIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}