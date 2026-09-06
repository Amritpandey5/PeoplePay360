"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Edit3,
  Layers3,
  Plus,
  Search,
  Trash2,
  Users,
  X,
  Calculator,
} from "lucide-react";

import type { Employee } from "@/types/employee";
import type {
  SalaryCalculationType,
  SalaryComponent,
  SalaryComponentType,
  SalaryFrequency,
  SalaryStructure,
} from "@/types/salary-structure";

import type { HRRole } from "@/lib/hr-permissions";

import {
  canCreate,
  canDelete,
  canUpdate,
} from "@/lib/hr-permissions";

import {
  createSalaryStructure,
  deleteSalaryStructure,
  getSalaryStructures,
  subscribeToSalaryStructureChanges,
  updateSalaryStructure,
} from "@/lib/salary-structure-storage";

import { getEmployees } from "@/lib/employee-storage";

const role: HRRole = "HR_PAYROLL_USER";
// Change to "HR_PAYROLL_MANAGER" when testing full CRUD.

type FormState = {
  name: string;
  code: string;
  description: string;
  frequency: SalaryFrequency;
  annualCtc: string;
  components: SalaryComponent[];
  status: "active" | "inactive";
  employeeIds: string[];
};

const emptyForm: FormState = {
  name: "",
  code: "",
  description: "",
  frequency: "monthly",
  annualCtc: "",
  components: [],
  status: "active",
  employeeIds: [],
};

export default function SalaryStructuresPage() {
  const [structures, setStructures] = useState<
    SalaryStructure[]
  >([]);

  const [employees, setEmployees] = useState<Employee[]>(
    []
  );

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [frequencyFilter, setFrequencyFilter] =
    useState<"all" | SalaryFrequency>("all");

  const [modalOpen, setModalOpen] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(
    null
  );

  const [deleteId, setDeleteId] = useState<string | null>(
    null
  );

  const [form, setForm] = useState<FormState>(emptyForm);

  function loadData() {
    setStructures(getSalaryStructures());
    setEmployees(getEmployees());
    setLoading(false);
  }

  useEffect(() => {
    loadData();

    return subscribeToSalaryStructureChanges(() => {
      loadData();
    });
  }, []);

  const filteredStructures = useMemo(() => {
    const query = search.trim().toLowerCase();

    return structures.filter((structure) => {
      const matchesSearch =
        !query ||
        structure.name.toLowerCase().includes(query) ||
        structure.code.toLowerCase().includes(query) ||
        structure.description
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        structure.status === statusFilter;

      const matchesFrequency =
        frequencyFilter === "all" ||
        structure.frequency === frequencyFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesFrequency
      );
    });
  }, [
    structures,
    search,
    statusFilter,
    frequencyFilter,
  ]);

  const activeCount = structures.filter(
    (item) => item.status === "active"
  ).length;

  const inactiveCount = structures.filter(
    (item) => item.status === "inactive"
  ).length;

  const assignedEmployeeCount = new Set(
    structures.flatMap(
      (structure) => structure.employeeIds
    )
  ).size;

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(
    structure: SalaryStructure
  ) {
    setEditingId(structure.id);

    setForm({
      name: structure.name,
      code: structure.code,
      description: structure.description,
      frequency: structure.frequency,
      annualCtc: String(structure.annualCtc),
      components: structure.components.map(
        (component) => ({
          ...component,
        })
      ),
      status: structure.status,
      employeeIds: [
        ...structure.employeeIds,
      ],
    });

    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function addComponent() {
    const component: SalaryComponent = {
      id: `COMP-${Date.now()}`,
      name: "",
      type: "earning",
      calculationType: "fixed",
      value: 0,
      isStatutory: false,
    };

    setForm((current) => ({
      ...current,
      components: [
        ...current.components,
        component,
      ],
    }));
  }

  function updateComponent(
    id: string,
    updates: Partial<SalaryComponent>
  ) {
    setForm((current) => ({
      ...current,
      components:
        current.components.map(
          (component) =>
            component.id === id
              ? {
                  ...component,
                  ...updates,
                }
              : component
        ),
    }));
  }

  function removeComponent(id: string) {
    setForm((current) => ({
      ...current,
      components:
        current.components.filter(
          (component) =>
            component.id !== id
        ),
    }));
  }

  function toggleEmployee(
    employeeId: string
  ) {
    setForm((current) => {
      const exists =
        current.employeeIds.includes(
          employeeId
        );

      return {
        ...current,
        employeeIds: exists
          ? current.employeeIds.filter(
              (id) =>
                id !== employeeId
            )
          : [
              ...current.employeeIds,
              employeeId,
            ],
      };
    });
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    if (!form.code.trim()) {
      return;
    }

    const annualCtc = Number(
      form.annualCtc
    );

    if (
      Number.isNaN(annualCtc) ||
      annualCtc < 0
    ) {
      return;
    }

    const structureData = {
      name: form.name.trim(),
      code: form.code
        .trim()
        .toUpperCase(),
      description:
        form.description.trim(),
      frequency: form.frequency,
      annualCtc,
      components:
        form.components,
      status: form.status,
      employeeIds:
        form.employeeIds,
    };

    if (editingId) {
      updateSalaryStructure(
        editingId,
        structureData
      );
    } else {
      createSalaryStructure(
        structureData
      );
    }

    closeModal();
    loadData();
  }

  function confirmDelete() {
    if (!deleteId) {
      return;
    }

    deleteSalaryStructure(deleteId);

    setDeleteId(null);
    loadData();
  }

  function getEmployeeName(
    employeeId: string
  ) {
    return (
      employees.find(
        (employee) =>
          employee.id === employeeId
      )?.name ?? "Unknown employee"
    );
  }

  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-[1600px]">

        {/* HEADER */}

        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#68705D]">
              <Layers3 className="h-4 w-4" />
              Payroll
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Salary Structures
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68705D]">
              Manage salary structures,
              components, CTC and employee
              assignments.
            </p>
          </div>

          {canCreate(
            role,
            "salaryStructures"
          ) && (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#DFFF00] px-5 text-sm font-bold text-[#10130B] shadow-[0_10px_35px_rgba(223,255,0,0.25)] transition hover:scale-[1.02] hover:bg-[#F4FF3F]"
            >
              <Plus className="h-4 w-4" />
              New Structure
            </button>
          )}
        </div>

        {/* STATS */}

        <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={
              <Layers3 className="h-5 w-5" />
            }
            label="Total Structures"
            value={structures.length}
          />

          <StatCard
            icon={
              <Check className="h-5 w-5" />
            }
            label="Active"
            value={activeCount}
          />

          <StatCard
            icon={
              <X className="h-5 w-5" />
            }
            label="Inactive"
            value={inactiveCount}
          />

          <StatCard
            icon={
              <Users className="h-5 w-5" />
            }
            label="Assigned Employees"
            value={assignedEmployeeCount}
          />
        </div>

        {/* FILTERS */}

        <div className="mb-5 rounded-[24px] border border-black/[0.06] bg-white/65 p-3 shadow-[0_12px_50px_rgba(30,40,10,0.05)] backdrop-blur-xl sm:p-4">
          <div className="flex flex-col gap-3 xl:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#68705D]" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search salary structures..."
                className="h-11 w-full rounded-xl border border-black/[0.06] bg-white/80 pl-11 pr-4 text-sm outline-none placeholder:text-[#8A9182] focus:border-[#DFFF00] focus:ring-4 focus:ring-[#DFFF00]/15"
              />
            </div>

            <SelectFilter
              value={statusFilter}
              onChange={(value) =>
                setStatusFilter(
                  value as
                    | "all"
                    | "active"
                    | "inactive"
                )
              }
              options={[
                ["all", "All Status"],
                ["active", "Active"],
                ["inactive", "Inactive"],
              ]}
            />

            <SelectFilter
              value={frequencyFilter}
              onChange={(value) =>
                setFrequencyFilter(
                  value as
                    | "all"
                    | SalaryFrequency
                )
              }
              options={[
                ["all", "All Frequencies"],
                ["monthly", "Monthly"],
                ["weekly", "Weekly"],
                ["daily", "Daily"],
                ["yearly", "Yearly"],
              ]}
            />
          </div>
        </div>

        {/* CONTENT */}

        {loading ? (
          <LoadingState />
        ) : filteredStructures.length === 0 ? (
          <EmptyState
            canCreate={canCreate(
              role,
              "salaryStructures"
            )}
            hasFilters={
              Boolean(search) ||
              statusFilter !== "all" ||
              frequencyFilter !== "all"
            }
            onCreate={
              openCreateModal
            }
          />
        ) : (
          <>
            {/* DESKTOP */}

            <div className="hidden overflow-hidden rounded-[28px] border border-black/[0.06] bg-white/65 shadow-[0_12px_50px_rgba(30,40,10,0.05)] backdrop-blur-xl lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px]">
                  <thead>
                    <tr className="border-b border-black/[0.06] text-left">
                      <TableHead>
                        Structure
                      </TableHead>
                      <TableHead>
                        Frequency
                      </TableHead>
                      <TableHead>
                        Annual CTC
                      </TableHead>
                      <TableHead>
                        Components
                      </TableHead>
                      <TableHead>
                        Employees
                      </TableHead>
                      <TableHead>
                        Status
                      </TableHead>
                      <TableHead align="right">
                        Actions
                      </TableHead>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredStructures.map(
                      (structure) => (
                        <tr
                          key={
                            structure.id
                          }
                          className="border-b border-black/[0.04] last:border-0 hover:bg-[#DFFF00]/[0.04]"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#10130B] text-[#DFFF00]">
                                <Layers3 className="h-5 w-5" />
                              </div>

                              <div>
                                <p className="font-semibold">
                                  {
                                    structure.name
                                  }
                                </p>

                                <p className="mt-0.5 text-xs text-[#68705D]">
                                  {
                                    structure.code
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <FrequencyBadge
                              frequency={
                                structure.frequency
                              }
                            />
                          </td>

                          <td className="px-6 py-5 text-sm font-semibold">
                            ₹
                            {structure.annualCtc.toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          <td className="px-6 py-5 text-sm">
                            {
                              structure
                                .components
                                .length
                            }
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex flex-wrap gap-1">
                              {structure
                                .employeeIds
                                .slice(0, 2)
                                .map(
                                  (
                                    employeeId
                                  ) => (
                                    <span
                                      key={
                                        employeeId
                                      }
                                      className="rounded-lg bg-black/[0.04] px-2 py-1 text-xs font-medium"
                                    >
                                      {getEmployeeName(
                                        employeeId
                                      )}
                                    </span>
                                  )
                                )}

                              {structure
                                .employeeIds
                                .length >
                                2 && (
                                <span className="rounded-lg bg-[#DFFF00]/40 px-2 py-1 text-xs font-bold">
                                  +
                                  {structure
                                    .employeeIds
                                    .length -
                                    2}
                                </span>
                              )}

                              {structure
                                .employeeIds
                                .length ===
                                0 && (
                                <span className="text-xs text-[#68705D]">
                                  None
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <StatusBadge
                              status={
                                structure.status
                              }
                            />
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              {canUpdate(
                                role,
                                "salaryStructures"
                              ) && (
                                <ActionButton
                                  title="Edit"
                                  onClick={() =>
                                    openEditModal(
                                      structure
                                    )
                                  }
                                >
                                  <Edit3 className="h-4 w-4" />
                                </ActionButton>
                              )}

                              {canDelete(
                                role,
                                "salaryStructures"
                              ) && (
                                <ActionButton
                                  title="Delete"
                                  danger
                                  onClick={() =>
                                    setDeleteId(
                                      structure.id
                                    )
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </ActionButton>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MOBILE */}

            <div className="space-y-3 lg:hidden">
              {filteredStructures.map(
                (structure) => (
                  <div
                    key={
                      structure.id
                    }
                    className="rounded-[24px] border border-black/[0.06] bg-white/70 p-4 shadow-[0_12px_40px_rgba(30,40,10,0.05)] backdrop-blur-xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#10130B] text-[#DFFF00]">
                          <Layers3 className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {
                              structure.name
                            }
                          </p>

                          <p className="text-xs text-[#68705D]">
                            {
                              structure.code
                            }
                          </p>
                        </div>
                      </div>

                      <StatusBadge
                        status={
                          structure.status
                        }
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <InfoBox
                        label="Frequency"
                        value={
                          structure.frequency
                        }
                      />

                      <InfoBox
                        label="Annual CTC"
                        value={`₹${structure.annualCtc.toLocaleString(
                          "en-IN"
                        )}`}
                      />

                      <InfoBox
                        label="Components"
                        value={String(
                          structure
                            .components
                            .length
                        )}
                      />

                      <InfoBox
                        label="Employees"
                        value={String(
                          structure
                            .employeeIds
                            .length
                        )}
                      />
                    </div>

                    {(canUpdate(
                      role,
                      "salaryStructures"
                    ) ||
                      canDelete(
                        role,
                        "salaryStructures"
                      )) && (
                      <div className="mt-4 flex gap-2 border-t border-black/[0.06] pt-4">
                        {canUpdate(
                          role,
                          "salaryStructures"
                        ) && (
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                structure
                              )
                            }
                            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-black/[0.04] text-sm font-semibold"
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit
                          </button>
                        )}

                        {canDelete(
                          role,
                          "salaryStructures"
                        ) && (
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteId(
                                structure.id
                              )
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-md">
          <div className="max-h-[94vh] w-full max-w-3xl overflow-hidden rounded-[30px] border border-black/[0.06] bg-[#F7F7F2]/95 shadow-[0_30px_100px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between border-b border-black/[0.06] bg-[#F7F7F2]/95 px-5 py-4 backdrop-blur-xl sm:px-7">
              <div>
                <h2 className="text-lg font-bold">
                  {editingId
                    ? "Edit Salary Structure"
                    : "Create Salary Structure"}
                </h2>

                <p className="mt-1 text-xs text-[#68705D]">
                  Configure CTC and salary
                  components.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/[0.04]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="max-h-[calc(94vh-80px)] overflow-y-auto p-5 sm:p-7"
            >
              <div className="space-y-6">

                {/* BASIC INFO */}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Structure Name">
                    <input
                      required
                      value={form.name}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          name: event
                            .target
                            .value,
                        })
                      }
                      placeholder="Standard Monthly Salary"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Code">
                    <input
                      required
                      value={form.code}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          code: event
                            .target
                            .value,
                        })
                      }
                      placeholder="SAL-STD-MONTHLY"
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field label="Description">
                  <textarea
                    value={
                      form.description
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        description:
                          event.target
                            .value,
                      })
                    }
                    rows={3}
                    placeholder="Describe this salary structure..."
                    className={`${inputClass} h-auto resize-none py-3`}
                  />
                </Field>

                {/* FREQUENCY + CTC */}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Salary Frequency">
                    <Select
                      value={
                        form.frequency
                      }
                      onChange={(value) =>
                        setForm({
                          ...form,
                          frequency:
                            value as SalaryFrequency,
                        })
                      }
                      options={[
                        [
                          "monthly",
                          "Monthly",
                        ],
                        [
                          "weekly",
                          "Weekly",
                        ],
                        [
                          "daily",
                          "Daily",
                        ],
                        [
                          "yearly",
                          "Yearly",
                        ],
                      ]}
                    />
                  </Field>

                  <Field label="Annual CTC">
                    <input
                      required
                      min="0"
                      type="number"
                      value={
                        form.annualCtc
                      }
                      onChange={(event) =>
                        setForm({
                          ...form,
                          annualCtc:
                            event
                              .target
                              .value,
                        })
                      }
                      placeholder="600000"
                      className={inputClass}
                    />
                  </Field>
                </div>

                {/* COMPONENTS */}

                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold">
                        Salary Components
                      </h3>

                      <p className="mt-1 text-xs text-[#68705D]">
                        Add earnings,
                        deductions and
                        employer
                        contributions.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={
                        addComponent
                      }
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#DFFF00] px-3 text-xs font-bold"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Component
                    </button>
                  </div>

                  {form.components.length ===
                  0 ? (
                    <div className="rounded-2xl border border-dashed border-black/10 bg-white/45 px-5 py-8 text-center">
                      <Calculator className="mx-auto h-6 w-6 text-[#68705D]" />

                      <p className="mt-3 text-sm font-semibold">
                        No components added
                      </p>

                      <p className="mt-1 text-xs text-[#68705D]">
                        Add salary components
                        to build this
                        structure.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {form.components.map(
                        (component) => (
                          <ComponentEditor
                            key={
                              component.id
                            }
                            component={
                              component
                            }
                            onChange={(
                              updates
                            ) =>
                              updateComponent(
                                component.id,
                                updates
                              )
                            }
                            onRemove={() =>
                              removeComponent(
                                component.id
                              )
                            }
                          />
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* EMPLOYEES */}

                <div>
                  <div className="mb-3">
                    <h3 className="text-sm font-bold">
                      Assign Employees
                    </h3>

                    <p className="mt-1 text-xs text-[#68705D]">
                      Select employees who
                      use this salary
                      structure.
                    </p>
                  </div>

                  <div className="max-h-56 overflow-y-auto rounded-2xl border border-black/[0.06] bg-white/70 p-2">
                    {employees.length ===
                    0 ? (
                      <p className="px-4 py-8 text-center text-sm text-[#68705D]">
                        No employees
                        available.
                      </p>
                    ) : (
                      employees.map(
                        (employee) => {
                          const selected =
                            form.employeeIds.includes(
                              employee.id
                            );

                          return (
                            <button
                              key={
                                employee.id
                              }
                              type="button"
                              onClick={() =>
                                toggleEmployee(
                                  employee.id
                                )
                              }
                              className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${
                                selected
                                  ? "bg-[#DFFF00]/30"
                                  : "hover:bg-black/[0.03]"
                              }`}
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">
                                  {
                                    employee.name
                                  }
                                </p>

                                <p className="truncate text-xs text-[#68705D]">
                                  {
                                    employee.email
                                  }
                                </p>
                              </div>

                              <div
                                className={`ml-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                  selected
                                    ? "border-[#DFFF00] bg-[#DFFF00]"
                                    : "border-black/10 bg-white"
                                }`}
                              >
                                {selected && (
                                  <Check className="h-3.5 w-3.5" />
                                )}
                              </div>
                            </button>
                          );
                        }
                      )
                    )}
                  </div>

                  <p className="mt-2 text-xs text-[#68705D]">
                    {form.employeeIds.length}{" "}
                    employee
                    {form.employeeIds.length !==
                    1
                      ? "s"
                      : ""}{" "}
                    selected
                  </p>
                </div>

                {/* STATUS */}

                <Field label="Status">
                  <Select
                    value={form.status}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        status:
                          value as
                            | "active"
                            | "inactive",
                      })
                    }
                    options={[
                      [
                        "active",
                        "Active",
                      ],
                      [
                        "inactive",
                        "Inactive",
                      ],
                    ]}
                  />
                </Field>

                {/* ACTIONS */}

                <div className="flex flex-col-reverse gap-3 border-t border-black/[0.06] pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="h-11 rounded-xl bg-black/[0.04] px-5 text-sm font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="h-11 rounded-xl bg-[#DFFF00] px-6 text-sm font-bold text-[#10130B]"
                  >
                    {editingId
                      ? "Save Changes"
                      : "Create Structure"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}

      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[28px] border border-black/[0.06] bg-[#F7F7F2] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.18)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Trash2 className="h-5 w-5" />
            </div>

            <h3 className="mt-5 text-lg font-bold">
              Delete salary structure?
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#68705D]">
              This will permanently
              remove the selected salary
              structure.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteId(null)
                }
                className="h-11 flex-1 rounded-xl bg-black/[0.04] text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  confirmDelete
                }
                className="h-11 flex-1 rounded-xl bg-red-600 text-sm font-bold text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- COMPONENT EDITOR ---------------- */

function ComponentEditor({
  component,
  onChange,
  onRemove,
}: {
  component: SalaryComponent;
  onChange: (
    updates: Partial<SalaryComponent>
  ) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white/70 p-4">
      <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1.4fr_100px_auto] lg:items-end">

        <Field label="Component Name">
          <input
            value={component.name}
            onChange={(event) =>
              onChange({
                name: event.target.value,
              })
            }
            placeholder="Basic Salary"
            className={inputClass}
          />
        </Field>

        <Field label="Type">
          <Select
            value={component.type}
            onChange={(value) =>
              onChange({
                type:
                  value as SalaryComponentType,
              })
            }
            options={[
              [
                "earning",
                "Earning",
              ],
              [
                "deduction",
                "Deduction",
              ],
              [
                "employer_contribution",
                "Employer Contribution",
              ],
            ]}
          />
        </Field>

        <Field label="Calculation">
          <Select
            value={
              component.calculationType
            }
            onChange={(value) =>
              onChange({
                calculationType:
                  value as SalaryCalculationType,
              })
            }
            options={[
              [
                "fixed",
                "Fixed",
              ],
              [
                "percentage_basic",
                "% of Basic",
              ],
              [
                "percentage_gross",
                "% of Gross",
              ],
              [
                "percentage_ctc",
                "% of CTC",
              ],
            ]}
          />
        </Field>

        <Field label="Value">
          <input
            type="number"
            min="0"
            value={component.value}
            onChange={(event) =>
              onChange({
                value:
                  Number(
                    event.target.value
                  ) || 0,
              })
            }
            className={inputClass}
          />
        </Field>

        <button
          type="button"
          onClick={onRemove}
          className="flex h-11 w-full items-center justify-center rounded-xl bg-red-50 text-red-600 lg:w-11"
          title="Remove component"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-xs font-semibold">
        <input
          type="checkbox"
          checked={
            component.isStatutory
          }
          onChange={(event) =>
            onChange({
              isStatutory:
                event.target.checked,
            })
          }
          className="h-4 w-4 accent-[#DFFF00]"
        />
        Statutory component
      </label>
    </div>
  );
}

/* ---------------- SMALL COMPONENTS ---------------- */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[22px] border border-black/[0.06] bg-white/65 p-4 shadow-[0_10px_35px_rgba(30,40,10,0.04)] backdrop-blur-xl sm:p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DFFF00]/60">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-[#68705D]">
            {label}
          </p>

          <p className="mt-0.5 text-xl font-bold">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "active" | "inactive";
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
        status === "active"
          ? "bg-[#DFFF00]/45 text-[#384000]"
          : "bg-black/[0.05] text-[#68705D]"
      }`}
    >
      {status === "active"
        ? "Active"
        : "Inactive"}
    </span>
  );
}

function FrequencyBadge({
  frequency,
}: {
  frequency: SalaryFrequency;
}) {
  return (
    <span className="inline-flex rounded-full bg-black/[0.04] px-2.5 py-1 text-xs font-bold capitalize">
      {frequency}
    </span>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-black/[0.025] p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#68705D]">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-semibold capitalize">
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">
        {label}
      </label>

      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className={`${inputClass} appearance-none pr-10`}
      >
        {options.map(
          ([optionValue, label]) => (
            <option
              key={optionValue}
              value={optionValue}
            >
              {label}
            </option>
          )
        )}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#68705D]" />
    </div>
  );
}

function SelectFilter({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <div className="relative xl:w-48">
      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className={`${inputClass} appearance-none pr-10`}
      >
        {options.map(
          ([optionValue, label]) => (
            <option
              key={optionValue}
              value={optionValue}
            >
              {label}
            </option>
          )
        )}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#68705D]" />
    </div>
  );
}

function TableHead({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#68705D] ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function ActionButton({
  children,
  onClick,
  title,
  danger = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-xl border border-black/[0.06] bg-white transition ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "hover:border-[#DFFF00] hover:bg-[#DFFF00]/20"
      }`}
    >
      {children}
    </button>
  );
}

function LoadingState() {
  return (
    <div className="rounded-[28px] border border-black/[0.06] bg-white/65 px-6 py-16 text-center shadow-[0_12px_50px_rgba(30,40,10,0.05)] backdrop-blur-xl">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-[#10130B]" />

      <p className="mt-4 text-sm text-[#68705D]">
        Loading salary structures...
      </p>
    </div>
  );
}

function EmptyState({
  canCreate,
  hasFilters,
  onCreate,
}: {
  canCreate: boolean;
  hasFilters: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="rounded-[28px] border border-black/[0.06] bg-white/65 px-6 py-16 text-center shadow-[0_12px_50px_rgba(30,40,10,0.05)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#DFFF00]/70">
        <Layers3 className="h-7 w-7" />
      </div>

      <h3 className="mt-5 text-lg font-bold">
        No salary structures found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#68705D]">
        {hasFilters
          ? "Try changing your search or filters."
          : "Create your first salary structure to configure employee compensation."}
      </p>

      {!hasFilters &&
        canCreate && (
          <button
            type="button"
            onClick={onCreate}
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-[#DFFF00] px-4 text-sm font-bold"
          >
            <Plus className="h-4 w-4" />
            Create Structure
          </button>
        )}
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-black/[0.06] bg-white/80 px-4 text-sm outline-none transition placeholder:text-[#8A9182] focus:border-[#DFFF00] focus:ring-4 focus:ring-[#DFFF00]/15";