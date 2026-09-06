"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  UserCheck,
  UserX,
  X,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  BriefcaseBusiness,
  Clock3,
  IndianRupee,
  ChevronDown,
} from "lucide-react";

import type {
  Employee,
  PaymentBasis,
  Gender,
} from "@/types/employee";

import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  subscribeToDataChanges,
} from "@/lib/employee-storage";

import {
  canCreate,
  canUpdate,
  canDelete,
  type HRRole,
} from "@/lib/hr-permissions";

import HRPageHeader from "@/components/hr/HRPageHeader";
import HRGlassCard from "@/components/hr/HRGlassCard";
import HRStatCard from "@/components/hr/HRStatCard";
import HREmptyState from "@/components/hr/HREmptyState";

type EmployeeFormData = Omit<
  Employee,
  "id" | "createdAt" | "status"
>;

const INITIAL_FORM: EmployeeFormData = {
  name: "",
  email: "",
  phone: "",
  gender: "prefer_not_to_say",
  password: "",
  dateOfJoining: "",
  dateOfBirth: "",
  paymentBasis: "monthly",
  workingHours: 8,
  workingDays: 26,
  basicSalary: 0,
  hra: 0,
  allowances: 0,
  deductions: 0,
  location: "",
  role: "",
};

const role: HRRole = "HR_MANAGER";

type ModalMode = "add" | "edit" | null;

export default function HREmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"all" | "active" | "inactive">("all");

  const [loading, setLoading] = useState(true);

  const [modalMode, setModalMode] =
    useState<ModalMode>(null);

  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<Employee | null>(null);

  const loadEmployees = () => {
    setEmployees(getEmployees());
    setLoading(false);
  };

  useEffect(() => {
    loadEmployees();

    const unsubscribe =
      subscribeToDataChanges(() => {
        loadEmployees();
      });

    return unsubscribe;
  }, []);

  const activeEmployees = useMemo(
    () =>
      employees.filter(
        (employee) => employee.status === "active"
      ),
    [employees]
  );

  const inactiveEmployees = useMemo(
    () =>
      employees.filter(
        (employee) => employee.status === "inactive"
      ),
    [employees]
  );

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !query ||
        employee.name.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.phone.toLowerCase().includes(query) ||
        employee.role.toLowerCase().includes(query) ||
        employee.location
          .toLowerCase()
          .includes(query) ||
        employee.id.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        employee.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [employees, search, statusFilter]);

  const openAddModal = () => {
    setSelectedEmployee(null);
    setModalMode("add");
  };

  const openEditModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedEmployee(null);
  };

  const handleSave = (data: EmployeeFormData) => {
    if (modalMode === "add") {
      if (!canCreate(role, "employees")) {
        return;
      }

      createEmployee(data);
      closeModal();
      return;
    }

    if (
      modalMode === "edit" &&
      selectedEmployee
    ) {
      if (!canUpdate(role, "employees")) {
        return;
      }

      updateEmployee(
        selectedEmployee.id,
        data
      );

      closeModal();
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) {
      return;
    }

    if (!canDelete(role, "employees")) {
      return;
    }

    deleteEmployee(deleteTarget.id);

    setDeleteTarget(null);
  };

  return (
    <>
      <div className="px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        <HRPageHeader
          title="Employees"
          description="Manage your workforce, employee information and employment records."
          action={
            canCreate(role, "employees")
              ? {
                  label: "Add Employee",
                  onClick: openAddModal,
                  icon: Plus,
                }
              : undefined
          }
        />

        {/* =====================================================
            STATS
        ====================================================== */}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <HRStatCard
            title="Total Employees"
            value={employees.length}
            icon={Users}
          />

          <HRStatCard
            title="Active Employees"
            value={activeEmployees.length}
            icon={UserCheck}
          />

          <HRStatCard
            title="Inactive Employees"
            value={inactiveEmployees.length}
            icon={UserX}
          />
        </div>

        {/* =====================================================
            SEARCH / FILTER
        ====================================================== */}

        <HRGlassCard className="mt-6 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#68705D]"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search employees by name, email, role, location or ID..."
                className="h-12 w-full rounded-2xl border border-black/[0.06] bg-white/70 pl-11 pr-4 text-sm text-[#10130B] outline-none transition placeholder:text-[#92988B] focus:border-[#DFFF00] focus:ring-4 focus:ring-[#DFFF00]/15"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as
                      | "all"
                      | "active"
                      | "inactive"
                  )
                }
                className="h-12 min-w-[170px] appearance-none rounded-2xl border border-black/[0.06] bg-white/70 px-4 pr-10 text-sm font-medium text-[#10130B] outline-none focus:border-[#DFFF00] focus:ring-4 focus:ring-[#DFFF00]/15"
              >
                <option value="all">
                  All Status
                </option>
                <option value="active">
                  Active
                </option>
                <option value="inactive">
                  Inactive
                </option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#68705D]"
              />
            </div>
          </div>
        </HRGlassCard>

        {/* =====================================================
            EMPLOYEE LIST
        ====================================================== */}

        <HRGlassCard className="mt-6 overflow-hidden">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#DFFF00] border-t-transparent" />
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-6">
              <HREmptyState
                icon={Users}
                title={
                  employees.length === 0
                    ? "No employees yet"
                    : "No employees found"
                }
                description={
                  employees.length === 0
                    ? "Add your first employee to start managing your workforce."
                    : "Try changing your search or status filter."
                }
                action={
                  employees.length === 0 &&
                  canCreate(role, "employees")
                    ? {
                        label: "Add Employee",
                        onClick: openAddModal,
                      }
                    : undefined
                }
              />
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1050px]">
                  <thead>
                    <tr className="border-b border-black/[0.06] bg-black/[0.015] text-left">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#68705D]">
                        Employee
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#68705D]">
                        Role
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#68705D]">
                        Location
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#68705D]">
                        Payment
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#68705D]">
                        Salary
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#68705D]">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#68705D]">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredEmployees.map(
                      (employee) => (
                        <EmployeeTableRow
                          key={employee.id}
                          employee={employee}
                          onEdit={() =>
                            openEditModal(employee)
                          }
                          onDelete={() =>
                            setDeleteTarget(employee)
                          }
                          canEdit={canUpdate(
                            role,
                            "employees"
                          )}
                          canRemove={canDelete(
                            role,
                            "employees"
                          )}
                        />
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile / Tablet Cards */}
              <div className="grid gap-3 p-4 lg:hidden">
                {filteredEmployees.map(
                  (employee) => (
                    <EmployeeMobileCard
                      key={employee.id}
                      employee={employee}
                      onEdit={() =>
                        openEditModal(employee)
                      }
                      onDelete={() =>
                        setDeleteTarget(employee)
                      }
                      canEdit={canUpdate(
                        role,
                        "employees"
                      )}
                      canRemove={canDelete(
                        role,
                        "employees"
                      )}
                    />
                  )
                )}
              </div>
            </>
          )}
        </HRGlassCard>
      </div>

      {/* =======================================================
          ADD / EDIT MODAL
      ======================================================== */}

      {modalMode && (
        <EmployeeFormModal
          mode={modalMode}
          employee={selectedEmployee}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}

      {/* =======================================================
          DELETE MODAL
      ======================================================== */}

      {deleteTarget && (
        <DeleteEmployeeModal
          employee={deleteTarget}
          onCancel={() =>
            setDeleteTarget(null)
          }
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}

/* ============================================================
   DESKTOP ROW
============================================================ */

function EmployeeTableRow({
  employee,
  onEdit,
  onDelete,
  canEdit,
  canRemove,
}: {
  employee: Employee;
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
  canRemove: boolean;
}) {
  return (
    <tr className="border-b border-black/[0.05] transition hover:bg-[#DFFF00]/[0.04]">
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <EmployeeAvatar name={employee.name} />

          <div className="min-w-0">
            <p className="truncate font-semibold text-[#10130B]">
              {employee.name}
            </p>

            <p className="mt-0.5 text-xs text-[#92988B]">
              {employee.id}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-5">
        <p className="text-sm font-medium text-[#10130B]">
          {employee.role || "—"}
        </p>
      </td>

      <td className="px-6 py-5">
        <div className="flex items-center gap-2 text-sm text-[#68705D]">
          <MapPin size={15} />
          <span>{employee.location || "—"}</span>
        </div>
      </td>

      <td className="px-6 py-5">
        <p className="text-sm font-medium capitalize text-[#10130B]">
          {employee.paymentBasis}
        </p>

        <p className="mt-1 text-xs text-[#92988B]">
          {employee.workingHours}h/day ·{" "}
          {employee.workingDays}d/month
        </p>
      </td>

      <td className="px-6 py-5">
        <p className="text-sm font-semibold text-[#10130B]">
          ₹{formatMoney(employee.basicSalary)}
        </p>

        <p className="mt-1 text-xs text-[#92988B]">
          Basic salary
        </p>
      </td>

      <td className="px-6 py-5">
        <StatusBadge status={employee.status} />
      </td>

      <td className="px-6 py-5">
        <div className="flex justify-end gap-2">
          {canEdit && (
            <ActionButton
              icon={Pencil}
              label="Edit"
              onClick={onEdit}
            />
          )}

          {canRemove && (
            <ActionButton
              icon={Trash2}
              label="Delete"
              danger
              onClick={onDelete}
            />
          )}
        </div>
      </td>
    </tr>
  );
}

/* ============================================================
   MOBILE CARD
============================================================ */

function EmployeeMobileCard({
  employee,
  onEdit,
  onDelete,
  canEdit,
  canRemove,
}: {
  employee: Employee;
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
  canRemove: boolean;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white/55 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <EmployeeAvatar name={employee.name} />

          <div className="min-w-0">
            <p className="truncate font-semibold text-[#10130B]">
              {employee.name}
            </p>

            <p className="mt-0.5 text-xs text-[#92988B]">
              {employee.id}
            </p>
          </div>
        </div>

        <StatusBadge status={employee.status} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <InfoItem
          icon={Mail}
          value={employee.email}
        />

        <InfoItem
          icon={Phone}
          value={employee.phone}
        />

        <InfoItem
          icon={BriefcaseBusiness}
          value={employee.role || "—"}
        />

        <InfoItem
          icon={MapPin}
          value={employee.location || "—"}
        />

        <InfoItem
          icon={IndianRupee}
          value={`₹${formatMoney(
            employee.basicSalary
          )}`}
        />

        <InfoItem
          icon={Clock3}
          value={`${employee.workingHours}h/day · ${employee.workingDays}d/month`}
        />
      </div>

      {(canEdit || canRemove) && (
        <div className="mt-4 flex gap-2 border-t border-black/[0.06] pt-3">
          {canEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#DFFF00] text-sm font-semibold text-[#10130B] transition hover:bg-[#F4FF3F]"
            >
              <Pencil size={15} />
              Edit
            </button>
          )}

          {canRemove && (
            <button
              type="button"
              onClick={onDelete}
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
              <Trash2 size={15} />
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   EMPLOYEE FORM MODAL
============================================================ */

function EmployeeFormModal({
  mode,
  employee,
  onClose,
  onSave,
}: {
  mode: "add" | "edit";
  employee: Employee | null;
  onClose: () => void;
  onSave: (data: EmployeeFormData) => void;
}) {
  const [form, setForm] =
    useState<EmployeeFormData>(() => {
      if (!employee) {
        return INITIAL_FORM;
      }

      return {
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        gender: employee.gender,
        password: employee.password,
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
      };
    });

  const [error, setError] =
    useState("");

  const updateField = <
    K extends keyof EmployeeFormData
  >(
    field: K,
    value: EmployeeFormData[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Employee name is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    if (!form.dateOfJoining) {
      setError(
        "Date of joining is required."
      );
      return;
    }

    if (!form.role.trim()) {
      setError("Employee role is required.");
      return;
    }

    if (!form.location.trim()) {
      setError("Location is required.");
      return;
    }

    if (
      mode === "add" &&
      !form.password.trim()
    ) {
      setError("Password is required.");
      return;
    }

    if (form.workingHours <= 0) {
      setError(
        "Working hours must be greater than 0."
      );
      return;
    }

    if (form.workingDays <= 0) {
      setError(
        "Working days must be greater than 0."
      );
      return;
    }

    if (form.basicSalary < 0) {
      setError(
        "Basic salary cannot be negative."
      );
      return;
    }

    if (form.hra < 0) {
      setError("HRA cannot be negative.");
      return;
    }

    if (form.allowances < 0) {
      setError(
        "Allowances cannot be negative."
      );
      return;
    }

    if (form.deductions < 0) {
      setError(
        "Deductions cannot be negative."
      );
      return;
    }

    onSave({
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      role: form.role.trim(),
      location: form.location.trim(),
    });
  };

  return (
    <ModalShell
      title={
        mode === "add"
          ? "Add Employee"
          : "Edit Employee"
      }
      description={
        mode === "add"
          ? "Create a new employee record."
          : "Update employee information."
      }
      onClose={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Personal Information */}

        <FormSection
          title="Personal Information"
          description="Basic employee details."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Full Name"
              required
              value={form.name}
              onChange={(value) =>
                updateField("name", value)
              }
              placeholder="Enter full name"
            />

            <FormInput
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(value) =>
                updateField("email", value)
              }
              placeholder="employee@example.com"
            />

            <FormInput
              label="Phone"
              required
              value={form.phone}
              onChange={(value) =>
                updateField("phone", value)
              }
              placeholder="Enter phone number"
            />

            <FormSelect
              label="Gender"
              value={form.gender}
              onChange={(value) =>
                updateField(
                  "gender",
                  value as Gender
                )
              }
              options={[
                {
                  label: "Male",
                  value: "male",
                },
                {
                  label: "Female",
                  value: "female",
                },
                {
                  label: "Other",
                  value: "other",
                },
                {
                  label: "Prefer not to say",
                  value: "prefer_not_to_say",
                },
              ]}
            />

            <FormInput
              label="Date of Birth"
              type="date"
              value={form.dateOfBirth}
              onChange={(value) =>
                updateField(
                  "dateOfBirth",
                  value
                )
              }
            />

            <FormInput
              label="Date of Joining"
              type="date"
              required
              value={form.dateOfJoining}
              onChange={(value) =>
                updateField(
                  "dateOfJoining",
                  value
                )
              }
            />

            <div className="sm:col-span-2">
              <FormInput
                label={
                  mode === "edit"
                    ? "Password"
                    : "Password"
                }
                type="password"
                required={mode === "add"}
                value={form.password}
                onChange={(value) =>
                  updateField(
                    "password",
                    value
                  )
                }
                placeholder={
                  mode === "edit"
                    ? "Leave unchanged if not updating"
                    : "Create employee password"
                }
              />
            </div>
          </div>
        </FormSection>

        {/* Employment Information */}

        <FormSection
          title="Employment Information"
          description="Role, location and working configuration."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Role"
              required
              value={form.role}
              onChange={(value) =>
                updateField("role", value)
              }
              placeholder="e.g. Software Engineer"
            />

            <FormInput
              label="Location"
              required
              value={form.location}
              onChange={(value) =>
                updateField(
                  "location",
                  value
                )
              }
              placeholder="e.g. Mumbai"
            />

            <FormSelect
              label="Payment Basis"
              value={form.paymentBasis}
              onChange={(value) =>
                updateField(
                  "paymentBasis",
                  value as PaymentBasis
                )
              }
              options={[
                {
                  label: "Daily",
                  value: "daily",
                },
                {
                  label: "Weekly",
                  value: "weekly",
                },
                {
                  label: "Monthly",
                  value: "monthly",
                },
              ]}
            />

            <FormNumberInput
              label="Working Hours / Day"
              value={form.workingHours}
              min={0}
              step={0.5}
              onChange={(value) =>
                updateField(
                  "workingHours",
                  value
                )
              }
            />

            <FormNumberInput
              label="Working Days"
              value={form.workingDays}
              min={0}
              step={1}
              onChange={(value) =>
                updateField(
                  "workingDays",
                  value
                )
              }
            />
          </div>
        </FormSection>

        {/* Salary Information */}

        <FormSection
          title="Salary Information"
          description="Employee compensation details."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormNumberInput
              label="Basic Salary"
              value={form.basicSalary}
              min={0}
              step={0.01}
              onChange={(value) =>
                updateField(
                  "basicSalary",
                  value
                )
              }
            />

            <FormNumberInput
              label="HRA"
              value={form.hra}
              min={0}
              step={0.01}
              onChange={(value) =>
                updateField("hra", value)
              }
            />

            <FormNumberInput
              label="Allowances"
              value={form.allowances}
              min={0}
              step={0.01}
              onChange={(value) =>
                updateField(
                  "allowances",
                  value
                )
              }
            />

            <FormNumberInput
              label="Deductions"
              value={form.deductions}
              min={0}
              step={0.01}
              onChange={(value) =>
                updateField(
                  "deductions",
                  value
                )
              }
            />
          </div>

          <div className="mt-4 rounded-2xl border border-[#DFFF00]/30 bg-[#DFFF00]/10 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-[#68705D]">
              Estimated Net Salary
            </p>

            <p className="mt-1 text-2xl font-bold text-[#10130B]">
              ₹
              {formatMoney(
                Math.max(
                  0,
                  form.basicSalary +
                    form.hra +
                    form.allowances -
                    form.deductions
                )
              )}
            </p>

            <p className="mt-1 text-xs text-[#68705D]">
              Basic + HRA + Allowances −
              Deductions
            </p>
          </div>
        </FormSection>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-black/[0.06] pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl border border-black/[0.08] bg-white/70 px-5 text-sm font-semibold text-[#10130B] transition hover:bg-white"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="h-11 rounded-xl bg-[#DFFF00] px-6 text-sm font-bold text-[#10130B] shadow-[0_8px_30px_rgba(223,255,0,0.25)] transition hover:bg-[#F4FF3F]"
          >
            {mode === "add"
              ? "Create Employee"
              : "Save Changes"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ============================================================
   DELETE MODAL
============================================================ */

function DeleteEmployeeModal({
  employee,
  onCancel,
  onConfirm,
}: {
  employee: Employee;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalShell
      title="Delete Employee"
      description="This action cannot be undone."
      onClose={onCancel}
    >
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm leading-6 text-red-700">
          Are you sure you want to delete{" "}
          <strong>{employee.name}</strong>?
          The employee record will be removed
          from PeoplePay360.
        </p>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="h-11 rounded-xl border border-black/[0.08] bg-white/70 px-5 text-sm font-semibold text-[#10130B]"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onConfirm}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-bold text-white transition hover:bg-red-600"
        >
          <Trash2 size={16} />
          Delete Employee
        </button>
      </div>
    </ModalShell>
  );
}

/* ============================================================
   MODAL SHELL
============================================================ */

function ModalShell({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5">
      <div
        className="absolute inset-0 bg-[#10130B]/30 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-black/[0.08] bg-[#F7F7F2]/95 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] px-5 py-4 sm:px-7 sm:py-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#10130B] sm:text-2xl">
              {title}
            </h2>

            <p className="mt-1 text-sm text-[#68705D]">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/[0.06] bg-white/70 text-[#68705D] transition hover:bg-[#DFFF00] hover:text-[#10130B]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   FORM SECTION
============================================================ */

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4">
        <h3 className="text-sm font-bold text-[#10130B]">
          {title}
        </h3>

        <p className="mt-1 text-xs text-[#92988B]">
          {description}
        </p>
      </div>

      {children}
    </section>
  );
}

/* ============================================================
   FORM INPUT
============================================================ */

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[#68705D]">
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-black/[0.07] bg-white/70 px-3.5 text-sm text-[#10130B] outline-none transition placeholder:text-[#A0A59B] focus:border-[#DFFF00] focus:ring-4 focus:ring-[#DFFF00]/15"
      />
    </label>
  );
}

/* ============================================================
   FORM NUMBER INPUT
============================================================ */

function FormNumberInput({
  label,
  value,
  onChange,
  min = 0,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[#68705D]">
        {label}
      </span>

      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(event) =>
          onChange(
            Number(event.target.value)
          )
        }
        className="h-11 w-full rounded-xl border border-black/[0.07] bg-white/70 px-3.5 text-sm text-[#10130B] outline-none transition focus:border-[#DFFF00] focus:ring-4 focus:ring-[#DFFF00]/15"
      />
    </label>
  );
}

/* ============================================================
   FORM SELECT
============================================================ */

function FormSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {
    label: string;
    value: string;
  }[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[#68705D]">
        {label}
      </span>

      <div className="relative">
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="h-11 w-full appearance-none rounded-xl border border-black/[0.07] bg-white/70 px-3.5 pr-9 text-sm text-[#10130B] outline-none transition focus:border-[#DFFF00] focus:ring-4 focus:ring-[#DFFF00]/15"
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#68705D]"
        />
      </div>
    </label>
  );
}

/* ============================================================
   SMALL COMPONENTS
============================================================ */

function EmployeeAvatar({
  name,
}: {
  name: string;
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#DFFF00] text-sm font-bold text-[#10130B] shadow-[0_5px_20px_rgba(223,255,0,0.2)]">
      {initials || "?"}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: Employee["status"];
}) {
  const active = status === "active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-[#DFFF00]/30 text-[#4E5A00]"
          : "bg-black/[0.06] text-[#68705D]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active
            ? "bg-[#8DA000]"
            : "bg-[#8B9184]"
        }`}
      />

      {active ? "Active" : "Inactive"}
    </span>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: typeof Pencil;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
        danger
          ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
          : "border-black/[0.06] bg-white/70 text-[#68705D] hover:border-[#DFFF00] hover:bg-[#DFFF00] hover:text-[#10130B]"
      }`}
    >
      <Icon size={15} />
    </button>
  );
}

function InfoItem({
  icon: Icon,
  value,
}: {
  icon: typeof Mail;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-[#68705D]">
      <Icon size={14} className="shrink-0" />

      <span className="truncate text-xs">
        {value}
      </span>
    </div>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(value || 0);
}