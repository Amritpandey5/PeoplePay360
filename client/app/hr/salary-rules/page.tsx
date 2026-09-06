"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Edit3,
  FileCog,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import type { HRRole } from "@/lib/hr-permissions";
import {
  canCreate,
  canDelete,
  canUpdate,
} from "@/lib/hr-permissions";

import type {
  SalaryRule,
  SalaryRuleCalculation,
  SalaryRuleFrequency,
  SalaryRuleType,
} from "@/types/salary-rule";

import {
  createSalaryRule,
  deleteSalaryRule,
  getSalaryRules,
  subscribeToSalaryRuleChanges,
  updateSalaryRule,
} from "@/lib/salary-rule-storage";

const role: HRRole = "HR_PAYROLL_USER";
// Testing:
// HR_MANAGER
// HR_PAYROLL_USER
// HR_PAYROLL_MANAGER

type FormState = {
  name: string;
  code: string;
  description: string;
  type: SalaryRuleType;
  calculation: SalaryRuleCalculation;
  value: string;
  maximumCap: string;
  minimumSalary: string;
  frequency: SalaryRuleFrequency;
  isStatutory: boolean;
  status: "active" | "inactive";
  effectiveFrom: string;
  priority: string;
};

const emptyForm: FormState = {
  name: "",
  code: "",
  description: "",
  type: "earning",
  calculation: "fixed",
  value: "",
  maximumCap: "",
  minimumSalary: "",
  frequency: "monthly",
  isStatutory: false,
  status: "active",
  effectiveFrom: new Date()
    .toISOString()
    .split("T")[0],
  priority: "1",
};

export default function SalaryRulesPage() {
  const [rules, setRules] = useState<SalaryRule[]>(
    []
  );

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] = useState<
    "all" | SalaryRuleType
  >("all");

  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [modalOpen, setModalOpen] = useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [deleteId, setDeleteId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<FormState>(emptyForm);

  function loadRules() {
    setRules(getSalaryRules());
    setLoading(false);
  }

  useEffect(() => {
    loadRules();

    return subscribeToSalaryRuleChanges(() => {
      loadRules();
    });
  }, []);

  const filteredRules = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rules
      .filter((rule) => {
        const matchesSearch =
          !query ||
          rule.name
            .toLowerCase()
            .includes(query) ||
          rule.code
            .toLowerCase()
            .includes(query) ||
          rule.description
            .toLowerCase()
            .includes(query);

        const matchesType =
          typeFilter === "all" ||
          rule.type === typeFilter;

        const matchesStatus =
          statusFilter === "all" ||
          rule.status === statusFilter;

        return (
          matchesSearch &&
          matchesType &&
          matchesStatus
        );
      })
      .sort(
        (a, b) =>
          a.priority - b.priority
      );
  }, [
    rules,
    search,
    typeFilter,
    statusFilter,
  ]);

  const activeCount = rules.filter(
    (rule) => rule.status === "active"
  ).length;

  const statutoryCount = rules.filter(
    (rule) => rule.isStatutory
  ).length;

  const earningCount = rules.filter(
    (rule) => rule.type === "earning"
  ).length;

  const deductionCount = rules.filter(
    (rule) =>
      rule.type === "deduction" ||
      rule.type === "tax"
  ).length;

  function openCreateModal() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      effectiveFrom: new Date()
        .toISOString()
        .split("T")[0],
    });
    setModalOpen(true);
  }

  function openEditModal(rule: SalaryRule) {
    setEditingId(rule.id);

    setForm({
      name: rule.name,
      code: rule.code,
      description: rule.description,
      type: rule.type,
      calculation: rule.calculation,
      value: String(rule.value),
      maximumCap:
        rule.maximumCap === null
          ? ""
          : String(rule.maximumCap),
      minimumSalary:
        rule.minimumSalary === null
          ? ""
          : String(rule.minimumSalary),
      frequency: rule.frequency,
      isStatutory: rule.isStatutory,
      status: rule.status,
      effectiveFrom: rule.effectiveFrom,
      priority: String(rule.priority),
    });

    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
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

    const value = Number(form.value);

    if (
      Number.isNaN(value) ||
      value < 0
    ) {
      return;
    }

    const maximumCap =
      form.maximumCap.trim() === ""
        ? null
        : Number(form.maximumCap);

    const minimumSalary =
      form.minimumSalary.trim() === ""
        ? null
        : Number(form.minimumSalary);

    const priority =
      Number(form.priority) || 1;

    if (
      maximumCap !== null &&
      (Number.isNaN(maximumCap) ||
        maximumCap < 0)
    ) {
      return;
    }

    if (
      minimumSalary !== null &&
      (Number.isNaN(minimumSalary) ||
        minimumSalary < 0)
    ) {
      return;
    }

    const ruleData = {
      name: form.name.trim(),
      code: form.code
        .trim()
        .toUpperCase(),
      description:
        form.description.trim(),
      type: form.type,
      calculation: form.calculation,
      value,
      maximumCap,
      minimumSalary,
      frequency: form.frequency,
      isStatutory: form.isStatutory,
      status: form.status,
      effectiveFrom:
        form.effectiveFrom,
      priority,
    };

    if (editingId) {
      updateSalaryRule(
        editingId,
        ruleData
      );
    } else {
      createSalaryRule(ruleData);
    }

    closeModal();
    loadRules();
  }

  function confirmDelete() {
    if (!deleteId) {
      return;
    }

    deleteSalaryRule(deleteId);

    setDeleteId(null);
    loadRules();
  }

  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-[1600px]">

        {/* HEADER */}

        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#68705D]">
              <FileCog className="h-4 w-4" />
              Payroll
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Salary Rules
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68705D]">
              Configure earnings, deductions,
              taxes and employer contributions
              used during payroll calculation.
            </p>
          </div>

          {canCreate(
            role,
            "salaryRules"
          ) && (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#DFFF00] px-5 text-sm font-bold text-[#10130B] shadow-[0_10px_35px_rgba(223,255,0,0.25)] transition hover:scale-[1.02] hover:bg-[#F4FF3F]"
            >
              <Plus className="h-4 w-4" />
              New Rule
            </button>
          )}
        </div>

        {/* STATS */}

        <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Total Rules"
            value={rules.length}
            icon={
              <FileCog className="h-5 w-5" />
            }
          />

          <StatCard
            label="Active"
            value={activeCount}
            icon={
              <Check className="h-5 w-5" />
            }
          />

          <StatCard
            label="Earnings"
            value={earningCount}
            icon={
              <Plus className="h-5 w-5" />
            }
          />

          <StatCard
            label="Deductions / Tax"
            value={deductionCount}
            icon={
              <CalculatorIcon />
            }
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
                placeholder="Search salary rules..."
                className={inputClass + " pl-11"}
              />
            </div>

            <SelectFilter
              value={typeFilter}
              onChange={(value) =>
                setTypeFilter(
                  value as
                    | "all"
                    | SalaryRuleType
                )
              }
              options={[
                ["all", "All Types"],
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
                ["tax", "Tax"],
              ]}
            />

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
                [
                  "inactive",
                  "Inactive",
                ],
              ]}
            />
          </div>
        </div>

        {/* CONTENT */}

        {loading ? (
          <LoadingState />
        ) : filteredRules.length === 0 ? (
          <EmptyState
            hasFilters={
              Boolean(search) ||
              typeFilter !== "all" ||
              statusFilter !== "all"
            }
            canCreate={canCreate(
              role,
              "salaryRules"
            )}
            onCreate={
              openCreateModal
            }
          />
        ) : (
          <>
            {/* DESKTOP TABLE */}

            <div className="hidden overflow-hidden rounded-[28px] border border-black/[0.06] bg-white/65 shadow-[0_12px_50px_rgba(30,40,10,0.05)] backdrop-blur-xl lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                  <thead>
                    <tr className="border-b border-black/[0.06] text-left">
                      <TableHead>
                        Rule
                      </TableHead>

                      <TableHead>
                        Type
                      </TableHead>

                      <TableHead>
                        Calculation
                      </TableHead>

                      <TableHead>
                        Value
                      </TableHead>

                      <TableHead>
                        Frequency
                      </TableHead>

                      <TableHead>
                        Priority
                      </TableHead>

                      <TableHead>
                        Effective From
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
                    {filteredRules.map(
                      (rule) => (
                        <tr
                          key={rule.id}
                          className="border-b border-black/[0.04] last:border-0 hover:bg-[#DFFF00]/[0.04]"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#10130B] text-[#DFFF00]">
                                <FileCog className="h-5 w-5" />
                              </div>

                              <div>
                                <p className="font-semibold">
                                  {
                                    rule.name
                                  }
                                </p>

                                <div className="mt-0.5 flex items-center gap-2">
                                  <span className="text-xs text-[#68705D]">
                                    {
                                      rule.code
                                    }
                                  </span>

                                  {rule.isStatutory && (
                                    <span className="rounded-full bg-[#DFFF00]/50 px-2 py-0.5 text-[10px] font-bold">
                                      STATUTORY
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <RuleTypeBadge
                              type={
                                rule.type
                              }
                            />
                          </td>

                          <td className="px-6 py-5">
                            <span className="rounded-lg bg-black/[0.04] px-2.5 py-1 text-xs font-semibold">
                              {getCalculationLabel(
                                rule.calculation
                              )}
                            </span>
                          </td>

                          <td className="px-6 py-5 text-sm font-semibold">
                            {formatRuleValue(
                              rule
                            )}
                          </td>

                          <td className="px-6 py-5 text-sm capitalize">
                            {
                              rule.frequency
                            }
                          </td>

                          <td className="px-6 py-5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/[0.04] text-xs font-bold">
                              {
                                rule.priority
                              }
                            </span>
                          </td>

                          <td className="px-6 py-5 text-sm">
                            {formatDate(
                              rule.effectiveFrom
                            )}
                          </td>

                          <td className="px-6 py-5">
                            <StatusBadge
                              status={
                                rule.status
                              }
                            />
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              {canUpdate(
                                role,
                                "salaryRules"
                              ) && (
                                <ActionButton
                                  title="Edit"
                                  onClick={() =>
                                    openEditModal(
                                      rule
                                    )
                                  }
                                >
                                  <Edit3 className="h-4 w-4" />
                                </ActionButton>
                              )}

                              {canDelete(
                                role,
                                "salaryRules"
                              ) && (
                                <ActionButton
                                  title="Delete"
                                  danger
                                  onClick={() =>
                                    setDeleteId(
                                      rule.id
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
              {filteredRules.map(
                (rule) => (
                  <div
                    key={rule.id}
                    className="rounded-[24px] border border-black/[0.06] bg-white/70 p-4 shadow-[0_12px_40px_rgba(30,40,10,0.05)] backdrop-blur-xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#10130B] text-[#DFFF00]">
                          <FileCog className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {
                              rule.name
                            }
                          </p>

                          <p className="text-xs text-[#68705D]">
                            {rule.code}
                          </p>
                        </div>
                      </div>

                      <StatusBadge
                        status={
                          rule.status
                        }
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <RuleTypeBadge
                        type={rule.type}
                      />

                      {rule.isStatutory && (
                        <span className="rounded-full bg-[#DFFF00]/50 px-2.5 py-1 text-[10px] font-bold">
                          STATUTORY
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <InfoBox
                        label="Calculation"
                        value={getCalculationLabel(
                          rule.calculation
                        )}
                      />

                      <InfoBox
                        label="Value"
                        value={formatRuleValue(
                          rule
                        )}
                      />

                      <InfoBox
                        label="Priority"
                        value={String(
                          rule.priority
                        )}
                      />

                      <InfoBox
                        label="Frequency"
                        value={
                          rule.frequency
                        }
                      />
                    </div>

                    <div className="mt-3 rounded-xl bg-black/[0.025] p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#68705D]">
                        Effective From
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {formatDate(
                          rule.effectiveFrom
                        )}
                      </p>
                    </div>

                    {(canUpdate(
                      role,
                      "salaryRules"
                    ) ||
                      canDelete(
                        role,
                        "salaryRules"
                      )) && (
                      <div className="mt-4 flex gap-2 border-t border-black/[0.06] pt-4">
                        {canUpdate(
                          role,
                          "salaryRules"
                        ) && (
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                rule
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
                          "salaryRules"
                        ) && (
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteId(
                                rule.id
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

            <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4 sm:px-7">
              <div>
                <h2 className="text-lg font-bold">
                  {editingId
                    ? "Edit Salary Rule"
                    : "Create Salary Rule"}
                </h2>

                <p className="mt-1 text-xs text-[#68705D]">
                  Define how this payroll
                  rule should be calculated.
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
                  <Field label="Rule Name">
                    <input
                      required
                      value={form.name}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          name: event.target
                            .value,
                        })
                      }
                      placeholder="Basic Salary"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Rule Code">
                    <input
                      required
                      value={form.code}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          code: event.target
                            .value,
                        })
                      }
                      placeholder="BASIC"
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
                    placeholder="Describe how this salary rule works..."
                    className={`${inputClass} h-auto resize-none py-3`}
                  />
                </Field>

                {/* TYPE + CALCULATION */}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Rule Type">
                    <Select
                      value={form.type}
                      onChange={(value) =>
                        setForm({
                          ...form,
                          type: value as SalaryRuleType,
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
                        ["tax", "Tax"],
                      ]}
                    />
                  </Field>

                  <Field label="Calculation">
                    <Select
                      value={
                        form.calculation
                      }
                      onChange={(value) =>
                        setForm({
                          ...form,
                          calculation:
                            value as SalaryRuleCalculation,
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
                        [
                          "slab",
                          "Slab",
                        ],
                      ]}
                    />
                  </Field>
                </div>

                {/* VALUE + FREQUENCY */}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label={
                      form.calculation ===
                      "slab"
                        ? "Slab Value"
                        : form.calculation ===
                            "fixed"
                          ? "Fixed Amount"
                          : "Percentage / Value"
                    }
                  >
                    <input
                      required
                      min="0"
                      type="number"
                      step="0.01"
                      value={form.value}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          value:
                            event.target
                              .value,
                        })
                      }
                      placeholder="0"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Frequency">
                    <Select
                      value={
                        form.frequency
                      }
                      onChange={(value) =>
                        setForm({
                          ...form,
                          frequency:
                            value as SalaryRuleFrequency,
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
                </div>

                {/* CAPS */}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Minimum Salary">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        form.minimumSalary
                      }
                      onChange={(event) =>
                        setForm({
                          ...form,
                          minimumSalary:
                            event.target
                              .value,
                        })
                      }
                      placeholder="Leave empty for no minimum"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Maximum Cap">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        form.maximumCap
                      }
                      onChange={(event) =>
                        setForm({
                          ...form,
                          maximumCap:
                            event.target
                              .value,
                        })
                      }
                      placeholder="Leave empty for no cap"
                      className={inputClass}
                    />
                  </Field>
                </div>

                {/* EFFECTIVE + PRIORITY */}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Effective From">
                    <input
                      required
                      type="date"
                      value={
                        form.effectiveFrom
                      }
                      onChange={(event) =>
                        setForm({
                          ...form,
                          effectiveFrom:
                            event.target
                              .value,
                        })
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Priority">
                    <input
                      required
                      min="1"
                      type="number"
                      value={
                        form.priority
                      }
                      onChange={(event) =>
                        setForm({
                          ...form,
                          priority:
                            event.target
                              .value,
                        })
                      }
                      className={inputClass}
                    />

                    <p className="mt-1.5 text-xs text-[#68705D]">
                      Lower number runs first.
                    </p>
                  </Field>
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

                {/* STATUTORY */}

                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      isStatutory:
                        !form.isStatutory,
                    })
                  }
                  className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                    form.isStatutory
                      ? "border-[#DFFF00] bg-[#DFFF00]/20"
                      : "border-black/[0.06] bg-white/60"
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold">
                      Statutory Rule
                    </p>

                    <p className="mt-1 text-xs text-[#68705D]">
                      Mark this rule as a statutory
                      payroll component.
                    </p>
                  </div>

                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-lg border ${
                      form.isStatutory
                        ? "border-[#DFFF00] bg-[#DFFF00]"
                        : "border-black/10 bg-white"
                    }`}
                  >
                    {form.isStatutory && (
                      <Check className="h-4 w-4" />
                    )}
                  </div>
                </button>

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
                      : "Create Rule"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}

      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[28px] border border-black/[0.06] bg-[#F7F7F2] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.18)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Trash2 className="h-5 w-5" />
            </div>

            <h3 className="mt-5 text-lg font-bold">
              Delete salary rule?
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#68705D]">
              This will permanently remove
              the selected salary rule.
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
                onClick={confirmDelete}
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

/* ---------------- HELPERS ---------------- */

function getCalculationLabel(
  calculation: SalaryRuleCalculation
) {
  switch (calculation) {
    case "fixed":
      return "Fixed";

    case "percentage_basic":
      return "% Basic";

    case "percentage_gross":
      return "% Gross";

    case "percentage_ctc":
      return "% CTC";

    case "slab":
      return "Slab";

    default:
      return calculation;
  }
}

function formatRuleValue(
  rule: SalaryRule
) {
  if (
    rule.calculation ===
    "fixed"
  ) {
    return `₹${rule.value.toLocaleString(
      "en-IN"
    )}`;
  }

  if (
    rule.calculation ===
    "slab"
  ) {
    return `₹${rule.value.toLocaleString(
      "en-IN"
    )}`;
  }

  return `${rule.value}%`;
}

function formatDate(
  date: string
) {
  if (!date) {
    return "—";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

/* ---------------- UI ---------------- */

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

function RuleTypeBadge({
  type,
}: {
  type: SalaryRuleType;
}) {
  const label =
    type === "employer_contribution"
      ? "Employer Contribution"
      : type;

  return (
    <span className="inline-flex rounded-full bg-black/[0.04] px-2.5 py-1 text-xs font-bold capitalize">
      {label}
    </span>
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
    <div className="relative xl:w-52">
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
        Loading salary rules...
      </p>
    </div>
  );
}

function EmptyState({
  hasFilters,
  canCreate,
  onCreate,
}: {
  hasFilters: boolean;
  canCreate: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="rounded-[28px] border border-black/[0.06] bg-white/65 px-6 py-16 text-center shadow-[0_12px_50px_rgba(30,40,10,0.05)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#DFFF00]/70">
        <FileCog className="h-7 w-7" />
      </div>

      <h3 className="mt-5 text-lg font-bold">
        No salary rules found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#68705D]">
        {hasFilters
          ? "Try changing your search or filters."
          : "Create your first salary rule to configure payroll calculations."}
      </p>

      {!hasFilters &&
        canCreate && (
          <button
            type="button"
            onClick={onCreate}
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-[#DFFF00] px-4 text-sm font-bold"
          >
            <Plus className="h-4 w-4" />
            Create Rule
          </button>
        )}
    </div>
  );
}

function CalculatorIcon() {
  return (
    <div className="text-base font-bold">
      −
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-black/[0.06] bg-white/80 px-4 text-sm outline-none transition placeholder:text-[#8A9182] focus:border-[#DFFF00] focus:ring-4 focus:ring-[#DFFF00]/15";