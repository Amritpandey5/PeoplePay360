"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  RefreshCw,
  Plus,
  FileText,
  Clock3,
  CheckCircle2,
  Users,
  WalletCards,
  Eye,
  Pencil,
  Trash2,
  Lock,
  X,
  CalendarDays,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

import type { Payslip, PayslipStatus } from "@/types/payslip";
import type { PayRun } from "@/types/pay-run";
import type { HRRole } from "@/lib/hr-permissions";

import {
  canCreate,
  canDelete,
  canRead,
  canUpdate,
} from "@/lib/hr-permissions";

import {
  createPayslip,
  deletePayslip,
  getPayslips,
  subscribeToPayslipChanges,
  updatePayslip,
} from "@/lib/payslip-storage";

import {
  getPayRuns,
  subscribeToPayRunChanges,
} from "@/lib/payrun-storage";

type FilterStatus = "all" | PayslipStatus;

type EditForm = {
  basicSalary: string;
  earnings: string;
  deductions: string;
  employerContributions: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusLabel(status: PayslipStatus) {
  switch (status) {
    case "draft":
      return "Draft";

    case "generated":
      return "Generated";

    case "finalized":
      return "Finalized";
  }
}

function getStatusClasses(
  status: PayslipStatus
) {
  switch (status) {
    case "draft":
      return "bg-black/[0.05] text-[#68705D] border-black/[0.06]";

    case "generated":
      return "bg-[#DFFF00]/35 text-[#3C4500] border-[#DFFF00]/60";

    case "finalized":
      return "bg-[#10130B] text-white border-[#10130B]";

    default:
      return "";
  }
}

function calculateTotals(form: EditForm) {
  const basic = Number(form.basicSalary) || 0;
  const earnings = Number(form.earnings) || 0;
  const deductions = Number(form.deductions) || 0;
  const employerContributions =
    Number(form.employerContributions) || 0;

  const gross = basic + earnings;
  const net = gross - deductions;
  const employerCost =
    gross + employerContributions;

  return {
    basic,
    earnings,
    deductions,
    employerContributions,
    gross,
    net,
    employerCost,
  };
}

export default function PayslipsPage() {
  /*
   * TEMPORARY ROLE
   *
   * Change this later to the authenticated user's
   * actual HR role.
   */
  const role: HRRole = "HR_PAYROLL_USER";

  const hasReadPermission = canRead(
    role,
    "payslips"
  );

  const hasCreatePermission = canCreate(
    role,
    "payslips"
  );

  const hasUpdatePermission = canUpdate(
    role,
    "payslips"
  );

  const hasDeletePermission = canDelete(
    role,
    "payslips"
  );

  const [payslips, setPayslips] = useState<
    Payslip[]
  >([]);

  const [payRuns, setPayRuns] = useState<PayRun[]>(
    []
  );

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<FilterStatus>("all");

  const [selectedPayslip, setSelectedPayslip] =
    useState<Payslip | null>(null);

  const [showGenerateModal, setShowGenerateModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [selectedPayRunId, setSelectedPayRunId] =
    useState("");

  const [editingPayslip, setEditingPayslip] =
    useState<Payslip | null>(null);

  const [deletingPayslip, setDeletingPayslip] =
    useState<Payslip | null>(null);

  const [editForm, setEditForm] =
    useState<EditForm>({
      basicSalary: "",
      earnings: "",
      deductions: "",
      employerContributions: "",
    });

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState("");

  function loadData() {
    setPayslips(getPayslips());
    setPayRuns(getPayRuns());
    setLoading(false);
  }

  useEffect(() => {
    loadData();

    const unsubscribePayslips =
      subscribeToPayslipChanges(loadData);

    const unsubscribePayRuns =
      subscribeToPayRunChanges(loadData);

    return () => {
      unsubscribePayslips();
      unsubscribePayRuns();
    };
  }, []);

  const approvedPayRuns = useMemo(() => {
    return payRuns.filter(
      (payRun) => payRun.status === "approved"
    );
  }, [payRuns]);

  const filteredPayslips = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payslips.filter((payslip) => {
      const matchesSearch =
        !query ||
        payslip.employeeName
          .toLowerCase()
          .includes(query) ||
        payslip.id
          .toLowerCase()
          .includes(query) ||
        payslip.payRunId
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        payslip.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    payslips,
    search,
    statusFilter,
  ]);

  const stats = useMemo(() => {
    const generated = payslips.filter(
      (p) => p.status === "generated"
    ).length;

    const finalized = payslips.filter(
      (p) => p.status === "finalized"
    ).length;

    const draft = payslips.filter(
      (p) => p.status === "draft"
    ).length;

    const totalNet = payslips.reduce(
      (sum, payslip) =>
        sum + payslip.netSalary,
      0
    );

    return {
      total: payslips.length,
      generated,
      finalized,
      draft,
      totalNet,
    };
  }, [payslips]);

  function openEdit(payslip: Payslip) {
    if (!hasUpdatePermission) return;

    if (payslip.status === "finalized") {
      setError(
        "Finalized payslips cannot be edited."
      );
      return;
    }

    setEditingPayslip(payslip);

    setEditForm({
      basicSalary: String(
        payslip.basicSalary
      ),
      earnings: String(
        payslip.earnings
      ),
      deductions: String(
        payslip.deductions
      ),
      employerContributions: String(
        payslip.employerContributions
      ),
    });

    setError("");
    setShowEditModal(true);
  }

  async function handleGenerate() {
    if (!hasCreatePermission) {
      setError(
        "You do not have permission to generate payslips."
      );
      return;
    }

    if (!selectedPayRunId) {
      setError(
        "Please select an approved Payrun."
      );
      return;
    }

    const payRun = payRuns.find(
      (item) => item.id === selectedPayRunId
    );

    if (!payRun) {
      setError("Selected Payrun was not found.");
      return;
    }

    if (payRun.status !== "approved") {
      setError(
        "Payslips can only be generated from an approved Payrun."
      );
      return;
    }

    if (!payRun.employees.length) {
      setError(
        "This Payrun has no calculated employees."
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      const existingForRun =
        getPayslips().filter(
          (payslip) =>
            payslip.payRunId === payRun.id
        );

      const existingEmployeeIds =
        new Set(
          existingForRun.map(
            (payslip) =>
              payslip.employeeId
          )
        );

      let createdCount = 0;

      for (const employee of payRun.employees) {
        if (
          existingEmployeeIds.has(
            employee.employeeId
          )
        ) {
          continue;
        }

        createPayslip({
          payRunId: payRun.id,

          employeeId:
            employee.employeeId,

          employeeName:
            employee.employeeName,

          contractId:
            employee.contractId,

          salaryStructureId:
            employee.salaryStructureId,

          periodStart:
            payRun.periodStart,

          periodEnd:
            payRun.periodEnd,

          paymentDate:
            payRun.paymentDate,

          basicSalary:
            employee.basicSalary,

          earnings:
            employee.earnings,

          deductions:
            employee.deductions,

          employerContributions:
            employee.employerContributions,

          grossSalary:
            employee.grossSalary,

          netSalary:
            employee.netSalary,

          employerCost:
            employee.employerCost,

          status: "generated",

          generatedAt:
            new Date().toISOString(),
        });

        createdCount++;
      }

      if (createdCount === 0) {
        setError(
          "Payslips for all employees in this Payrun already exist."
        );
      } else {
        setShowGenerateModal(false);
        setSelectedPayRunId("");
      }

      loadData();
    } catch (err) {
      console.error(err);

      setError(
        "Something went wrong while generating payslips."
      );
    } finally {
      setBusy(false);
    }
  }

  function handleSaveEdit() {
    if (!hasUpdatePermission) return;

    if (!editingPayslip) return;

    if (
      editingPayslip.status ===
      "finalized"
    ) {
      setError(
        "Finalized payslips cannot be edited."
      );
      return;
    }

    const totals =
      calculateTotals(editForm);

    if (totals.net < 0) {
      setError(
        "Net salary cannot be negative."
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      const updated =
        updatePayslip(
          editingPayslip.id,
          {
            basicSalary:
              totals.basic,

            earnings:
              totals.earnings,

            deductions:
              totals.deductions,

            employerContributions:
              totals.employerContributions,

            grossSalary:
              totals.gross,

            netSalary:
              totals.net,

            employerCost:
              totals.employerCost,
          }
        );

      if (!updated) {
        throw new Error(
          "Payslip update failed"
        );
      }

      setShowEditModal(false);
      setEditingPayslip(null);

      loadData();
    } catch (err) {
      console.error(err);

      setError(
        "Unable to update payslip."
      );
    } finally {
      setBusy(false);
    }
  }

  function handleFinalize(
    payslip: Payslip
  ) {
    if (!hasUpdatePermission) return;

    if (payslip.status === "finalized") {
      return;
    }

    setBusy(true);
    setError("");

    try {
      updatePayslip(
        payslip.id,
        {
          status: "finalized",
          finalizedAt:
            new Date().toISOString(),
        }
      );

      setSelectedPayslip(null);
      loadData();
    } catch (err) {
      console.error(err);

      setError(
        "Unable to finalize payslip."
      );
    } finally {
      setBusy(false);
    }
  }

  function handleDelete() {
    if (!hasDeletePermission) return;

    if (!deletingPayslip) return;

    setBusy(true);
    setError("");

    try {
      const deleted =
        deletePayslip(
          deletingPayslip.id
        );

      if (!deleted) {
        throw new Error(
          "Delete failed"
        );
      }

      if (
        selectedPayslip?.id ===
        deletingPayslip.id
      ) {
        setSelectedPayslip(null);
      }

      setDeletingPayslip(null);
      setShowDeleteModal(false);

      loadData();
    } catch (err) {
      console.error(err);

      setError(
        "Unable to delete payslip."
      );
    } finally {
      setBusy(false);
    }
  }

  if (!hasReadPermission) {
    return (
      <div className="min-h-screen p-6 lg:p-10">
        <div className="mx-auto max-w-4xl rounded-[28px] border border-black/[0.06] bg-white/70 p-10 text-center shadow-[0_20px_60px_rgba(30,35,10,0.06)] backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#10130B] text-white">
            <Lock size={28} />
          </div>

          <h1 className="text-2xl font-black">
            Access Restricted
          </h1>

          <p className="mt-2 text-sm text-[#68705D]">
            You do not have permission to view
            payslips.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
      <div className="mx-auto max-w-[1500px]">

        {/* HEADER */}
        <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#68705D]">
              <span>Payroll</span>
              <ChevronRight size={14} />
              <span>Payslips</span>
            </div>

            <h1 className="text-4xl font-black tracking-[-0.04em] sm:text-5xl">
              Payslips
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-[#68705D] sm:text-base">
              Generate, review and finalize employee
              payslips from approved payroll runs.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={loadData}
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-black/[0.07] bg-white/75 px-4 text-sm font-semibold shadow-sm backdrop-blur-xl transition hover:bg-white"
            >
              <RefreshCw
                size={17}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
            </button>

            {/* IMPORTANT:
                ONLY PAYROLL MANAGER SEES THIS
            */}
            {hasCreatePermission && (
              <button
                onClick={() => {
                  setError("");
                  setSelectedPayRunId("");
                  setShowGenerateModal(true);
                }}
                className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#DFFF00] px-5 text-sm font-black text-[#10130B] shadow-[0_10px_30px_rgba(223,255,0,0.25)] transition hover:-translate-y-0.5 hover:bg-[#CFFF00]"
              >
                <Plus size={18} />
                Generate Payslips
              </button>
            )}
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>

            <button
              onClick={() => setError("")}
              className="ml-auto"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* STATS */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <StatCard
            icon={FileText}
            label="Total Payslips"
            value={String(stats.total)}
            description="All generated records"
          />

          <StatCard
            icon={Clock3}
            label="Generated"
            value={String(
              stats.generated
            )}
            description="Ready for review"
            accent
          />

          <StatCard
            icon={CheckCircle2}
            label="Finalized"
            value={String(
              stats.finalized
            )}
            description="Completed payslips"
          />

          <StatCard
            icon={Users}
            label="Draft"
            value={String(stats.draft)}
            description="Not finalized"
          />

          <StatCard
            icon={WalletCards}
            label="Total Net"
            value={formatCurrency(
              stats.totalNet
            )}
            description="Across all payslips"
          />
        </div>

        {/* FILTER BAR */}
        <div className="mb-5 rounded-[24px] border border-black/[0.06] bg-white/65 p-3 shadow-[0_15px_45px_rgba(30,35,10,0.05)] backdrop-blur-xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A9182]"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search by employee, payslip ID or PayRun..."
                className="h-12 w-full rounded-2xl border border-black/[0.06] bg-white/70 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#A0A69A] focus:border-[#DFFF00] focus:ring-4 focus:ring-[#DFFF00]/15"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">

              <span className="mr-1 hidden text-xs font-bold text-[#68705D] sm:block">
                Status
              </span>

              {(
                [
                  ["all", "All"],
                  ["draft", "Draft"],
                  [
                    "generated",
                    "Generated",
                  ],
                  [
                    "finalized",
                    "Finalized",
                  ],
                ] as [
                  FilterStatus,
                  string
                ][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() =>
                    setStatusFilter(value)
                  }
                  className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    statusFilter === value
                      ? "bg-[#10130B] text-white"
                      : "bg-black/[0.035] text-[#68705D] hover:bg-black/[0.06]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="rounded-[28px] border border-black/[0.06] bg-white/65 shadow-[0_20px_60px_rgba(30,35,10,0.05)] backdrop-blur-xl">

          {loading ? (
            <div className="p-16 text-center">
              <RefreshCw
                size={28}
                className="mx-auto animate-spin text-[#68705D]"
              />

              <p className="mt-3 text-sm text-[#68705D]">
                Loading payslips...
              </p>
            </div>
          ) : filteredPayslips.length === 0 ? (
            <EmptyState
              canGenerate={
                hasCreatePermission
              }
              onGenerate={() =>
                setShowGenerateModal(true)
              }
            />
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1050px]">
                  <thead>
                    <tr className="border-b border-black/[0.06] text-left">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#68705D]">
                        Payslip
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#68705D]">
                        Employee
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#68705D]">
                        Period
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#68705D]">
                        Gross
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#68705D]">
                        Net
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#68705D]">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#68705D]">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredPayslips.map(
                      (payslip) => (
                        <tr
                          key={payslip.id}
                          className="border-b border-black/[0.05] last:border-0 hover:bg-[#DFFF00]/[0.035]"
                        >
                          <td className="px-6 py-5">
                            <div className="font-bold">
                              {payslip.id}
                            </div>

                            <div className="mt-1 text-xs text-[#8A9182]">
                              {payslip.payRunId}
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <div className="font-semibold">
                              {
                                payslip.employeeName
                              }
                            </div>

                            <div className="mt-1 text-xs text-[#8A9182]">
                              {
                                payslip.employeeId
                              }
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm text-[#68705D]">
                            <div>
                              {formatDate(
                                payslip.periodStart
                              )}
                            </div>

                            <div className="text-xs">
                              to{" "}
                              {formatDate(
                                payslip.periodEnd
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-5 font-semibold">
                            {formatCurrency(
                              payslip.grossSalary
                            )}
                          </td>

                          <td className="px-6 py-5 font-black">
                            {formatCurrency(
                              payslip.netSalary
                            )}
                          </td>

                          <td className="px-6 py-5">
                            <StatusBadge
                              status={
                                payslip.status
                              }
                            />
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">

                              <ActionButton
                                title="View"
                                onClick={() =>
                                  setSelectedPayslip(
                                    payslip
                                  )
                                }
                              >
                                <Eye size={16} />
                              </ActionButton>

                              {/* ONLY MANAGER */}
                              {hasUpdatePermission &&
                                payslip.status !==
                                  "finalized" && (
                                  <ActionButton
                                    title="Edit"
                                    onClick={() =>
                                      openEdit(
                                        payslip
                                      )
                                    }
                                  >
                                    <Pencil
                                      size={16}
                                    />
                                  </ActionButton>
                                )}

                              {/* ONLY MANAGER */}
                              {hasDeletePermission && (
                                <ActionButton
                                  title="Delete"
                                  danger
                                  onClick={() => {
                                    setDeletingPayslip(
                                      payslip
                                    );
                                    setShowDeleteModal(
                                      true
                                    );
                                  }}
                                >
                                  <Trash2
                                    size={16}
                                  />
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

              {/* MOBILE CARDS */}
              <div className="grid gap-3 p-3 lg:hidden">
                {filteredPayslips.map(
                  (payslip) => (
                    <div
                      key={payslip.id}
                      className="rounded-2xl border border-black/[0.06] bg-white/70 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">

                        <div>
                          <div className="font-black">
                            {payslip.employeeName}
                          </div>

                          <div className="mt-1 text-xs text-[#8A9182]">
                            {payslip.id}
                          </div>
                        </div>

                        <StatusBadge
                          status={
                            payslip.status
                          }
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">

                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wide text-[#8A9182]">
                            Gross
                          </p>

                          <p className="mt-1 font-bold">
                            {formatCurrency(
                              payslip.grossSalary
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wide text-[#8A9182]">
                            Net
                          </p>

                          <p className="mt-1 font-black">
                            {formatCurrency(
                              payslip.netSalary
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wide text-[#8A9182]">
                            Period
                          </p>

                          <p className="mt-1 text-sm">
                            {formatDate(
                              payslip.periodStart
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wide text-[#8A9182]">
                            Payment
                          </p>

                          <p className="mt-1 text-sm">
                            {formatDate(
                              payslip.paymentDate
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">

                        <button
                          onClick={() =>
                            setSelectedPayslip(
                              payslip
                            )
                          }
                          className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-black/[0.04] text-sm font-bold"
                        >
                          <Eye size={16} />
                          View
                        </button>

                        {hasUpdatePermission &&
                          payslip.status !==
                            "finalized" && (
                            <button
                              onClick={() =>
                                openEdit(
                                  payslip
                                )
                              }
                              className="flex h-10 items-center justify-center rounded-xl bg-black/[0.04] px-4"
                            >
                              <Pencil
                                size={16}
                              />
                            </button>
                          )}

                        {hasDeletePermission && (
                          <button
                            onClick={() => {
                              setDeletingPayslip(
                                payslip
                              );
                              setShowDeleteModal(
                                true
                              );
                            }}
                            className="flex h-10 items-center justify-center rounded-xl bg-red-50 px-4 text-red-600"
                          >
                            <Trash2
                              size={16}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* GENERATE MODAL */}
      {showGenerateModal &&
        hasCreatePermission && (
          <Modal
            title="Generate Payslips"
            subtitle="Create payslips from an approved Payrun."
            onClose={() =>
              setShowGenerateModal(false)
            }
          >
            <div className="space-y-5">

              {approvedPayRuns.length === 0 ? (
                <div className="rounded-2xl border border-black/[0.06] bg-black/[0.025] p-5 text-center">
                  <CalendarDays
                    size={28}
                    className="mx-auto text-[#68705D]"
                  />

                  <p className="mt-3 font-bold">
                    No approved Payruns
                  </p>

                  <p className="mt-1 text-sm text-[#68705D]">
                    Approve a Payrun first before
                    generating payslips.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Approved Payrun
                    </label>

                    <select
                      value={
                        selectedPayRunId
                      }
                      onChange={(e) => {
                        setSelectedPayRunId(
                          e.target.value
                        );
                        setError("");
                      }}
                      className="h-12 w-full rounded-xl border border-black/[0.08] bg-white px-4 text-sm outline-none focus:border-[#DFFF00] focus:ring-4 focus:ring-[#DFFF00]/15"
                    >
                      <option value="">
                        Select an approved Payrun
                      </option>

                      {approvedPayRuns.map(
                        (payRun) => (
                          <option
                            key={payRun.id}
                            value={payRun.id}
                          >
                            {payRun.name} —{" "}
                            {formatDate(
                              payRun.periodStart
                            )}{" "}
                            to{" "}
                            {formatDate(
                              payRun.periodEnd
                            )}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {selectedPayRunId && (
                    <PayRunPreview
                      payRun={
                        approvedPayRuns.find(
                          (p) =>
                            p.id ===
                            selectedPayRunId
                        )!
                      }
                    />
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() =>
                        setShowGenerateModal(
                          false
                        )
                      }
                      className="h-11 flex-1 rounded-xl border border-black/[0.08] bg-white text-sm font-bold"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={
                        handleGenerate
                      }
                      disabled={
                        busy ||
                        !selectedPayRunId
                      }
                      className="h-11 flex-1 rounded-xl bg-[#DFFF00] text-sm font-black disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busy
                        ? "Generating..."
                        : "Generate"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </Modal>
        )}

      {/* EDIT MODAL */}
      {showEditModal &&
        editingPayslip &&
        hasUpdatePermission && (
          <Modal
            title="Edit Payslip"
            subtitle={`Update ${editingPayslip.id}`}
            onClose={() =>
              setShowEditModal(false)
            }
          >
            <div className="space-y-4">

              <div className="rounded-2xl bg-black/[0.025] p-4">
                <p className="font-black">
                  {
                    editingPayslip.employeeName
                  }
                </p>

                <p className="mt-1 text-xs text-[#68705D]">
                  {editingPayslip.payRunId}
                </p>
              </div>

              <MoneyInput
                label="Basic Salary"
                value={
                  editForm.basicSalary
                }
                onChange={(value) =>
                  setEditForm((prev) => ({
                    ...prev,
                    basicSalary: value,
                  }))
                }
              />

              <MoneyInput
                label="Earnings"
                value={
                  editForm.earnings
                }
                onChange={(value) =>
                  setEditForm((prev) => ({
                    ...prev,
                    earnings: value,
                  }))
                }
              />

              <MoneyInput
                label="Deductions"
                value={
                  editForm.deductions
                }
                onChange={(value) =>
                  setEditForm((prev) => ({
                    ...prev,
                    deductions: value,
                  }))
                }
              />

              <MoneyInput
                label="Employer Contributions"
                value={
                  editForm.employerContributions
                }
                onChange={(value) =>
                  setEditForm((prev) => ({
                    ...prev,
                    employerContributions:
                      value,
                  }))
                }
              />

              <div className="rounded-2xl border border-[#DFFF00]/40 bg-[#DFFF00]/15 p-4">
                <div className="flex justify-between text-sm">
                  <span>Gross Salary</span>

                  <strong>
                    {formatCurrency(
                      calculateTotals(
                        editForm
                      ).gross
                    )}
                  </strong>
                </div>

                <div className="mt-2 flex justify-between text-sm">
                  <span>Net Salary</span>

                  <strong>
                    {formatCurrency(
                      calculateTotals(
                        editForm
                      ).net
                    )}
                  </strong>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() =>
                    setShowEditModal(false)
                  }
                  className="h-11 flex-1 rounded-xl border border-black/[0.08] bg-white text-sm font-bold"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    handleSaveEdit
                  }
                  disabled={busy}
                  className="h-11 flex-1 rounded-xl bg-[#DFFF00] text-sm font-black disabled:opacity-50"
                >
                  {busy
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </div>
          </Modal>
        )}

      {/* DETAILS MODAL */}
      {selectedPayslip && (
        <Modal
          title="Payslip Details"
          subtitle={selectedPayslip.id}
          onClose={() =>
            setSelectedPayslip(null)
          }
          wide
        >
          <div className="space-y-5">

            <div className="flex flex-col gap-4 rounded-2xl bg-black/[0.025] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-black">
                  {
                    selectedPayslip.employeeName
                  }
                </h3>

                <p className="mt-1 text-sm text-[#68705D]">
                  Employee ID:{" "}
                  {
                    selectedPayslip.employeeId
                  }
                </p>
              </div>

              <StatusBadge
                status={
                  selectedPayslip.status
                }
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

              <DetailBox
                label="PayRun"
                value={
                  selectedPayslip.payRunId
                }
              />

              <DetailBox
                label="Contract"
                value={
                  selectedPayslip.contractId
                }
              />

              <DetailBox
                label="Salary Structure"
                value={
                  selectedPayslip.salaryStructureId
                }
              />

              <DetailBox
                label="Payment Date"
                value={formatDate(
                  selectedPayslip.paymentDate
                )}
              />
            </div>

            <div>
              <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-[#68705D]">
                Salary Breakdown
              </h3>

              <div className="overflow-hidden rounded-2xl border border-black/[0.06]">
                <SalaryRow
                  label="Basic Salary"
                  value={
                    selectedPayslip.basicSalary
                  }
                />

                <SalaryRow
                  label="Earnings"
                  value={
                    selectedPayslip.earnings
                  }
                />

                <SalaryRow
                  label="Gross Salary"
                  value={
                    selectedPayslip.grossSalary
                  }
                  strong
                />

                <SalaryRow
                  label="Deductions"
                  value={
                    selectedPayslip.deductions
                  }
                  negative
                />

                <SalaryRow
                  label="Net Salary"
                  value={
                    selectedPayslip.netSalary
                  }
                  strong
                  highlight
                />

                <SalaryRow
                  label="Employer Contributions"
                  value={
                    selectedPayslip.employerContributions
                  }
                />

                <SalaryRow
                  label="Employer Cost"
                  value={
                    selectedPayslip.employerCost
                  }
                  strong
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3">

              {hasUpdatePermission &&
                selectedPayslip.status !==
                  "finalized" && (
                  <>
                    <button
                      onClick={() =>
                        openEdit(
                          selectedPayslip
                        )
                      }
                      className="inline-flex h-11 items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 text-sm font-bold"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleFinalize(
                          selectedPayslip
                        )
                      }
                      disabled={busy}
                      className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#10130B] px-4 text-sm font-bold text-white"
                    >
                      <Lock size={16} />
                      Finalize
                    </button>
                  </>
                )}

              {hasDeletePermission && (
                <button
                  onClick={() => {
                    setDeletingPayslip(
                      selectedPayslip
                    );
                    setShowDeleteModal(
                      true
                    );
                  }}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-50 px-4 text-sm font-bold text-red-600"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal &&
        deletingPayslip &&
        hasDeletePermission && (
          <Modal
            title="Delete Payslip?"
            subtitle="This action cannot be undone."
            onClose={() =>
              setShowDeleteModal(
                false
              )
            }
          >
            <div className="space-y-5">

              <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                <p className="font-bold text-red-800">
                  {
                    deletingPayslip.employeeName
                  }
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {deletingPayslip.id}
                </p>
              </div>

              <p className="text-sm text-[#68705D]">
                Are you sure you want to permanently
                delete this payslip?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setShowDeleteModal(
                      false
                    )
                  }
                  className="h-11 flex-1 rounded-xl border border-black/[0.08] bg-white text-sm font-bold"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    handleDelete
                  }
                  disabled={busy}
                  className="h-11 flex-1 rounded-xl bg-red-600 text-sm font-black text-white disabled:opacity-50"
                >
                  {busy
                    ? "Deleting..."
                    : "Delete Payslip"}
                </button>
              </div>
            </div>
          </Modal>
        )}
    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  accent = false,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
  description: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[24px] border border-black/[0.06] bg-white/70 p-5 shadow-[0_15px_40px_rgba(30,35,10,0.045)] backdrop-blur-xl ${
        accent
          ? "bg-gradient-to-br from-white/80 to-[#DFFF00]/20"
          : ""
      }`}
    >
      {accent && (
        <div className="absolute right-5 top-5 h-3 w-3 rounded-full bg-[#DFFF00] shadow-[0_0_18px_rgba(223,255,0,0.9)]" />
      )}

      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-black/[0.04]">
        <Icon size={21} />
      </div>

      <p className="text-3xl font-black tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-sm font-bold">
        {label}
      </p>

      <p className="mt-1 text-xs text-[#68705D]">
        {description}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: PayslipStatus;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusClasses(
        status
      )}`}
    >
      {statusLabel(status)}
    </span>
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
      title={title}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
        danger
          ? "bg-red-50 text-red-600 hover:bg-red-100"
          : "bg-black/[0.035] hover:bg-[#DFFF00]/30"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({
  canGenerate,
  onGenerate,
}: {
  canGenerate: boolean;
  onGenerate: () => void;
}) {
  return (
    <div className="flex min-h-[380px] flex-col items-center justify-center p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#DFFF00]">
        <FileText size={28} />
      </div>

      <h2 className="mt-5 text-xl font-black">
        No payslips found
      </h2>

      <p className="mt-2 max-w-md text-sm text-[#68705D]">
        {canGenerate
          ? "Generate payslips from an approved Payrun to get started."
          : "Payslips generated from approved Payruns will appear here."}
      </p>

      {canGenerate && (
        <button
          onClick={onGenerate}
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#DFFF00] px-5 text-sm font-black"
        >
          <Plus size={18} />
          Generate Payslips
        </button>
      )}
    </div>
  );
}

function Modal({
  title,
  subtitle,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#10130B]/35 p-4 backdrop-blur-sm">
      <div
        className={`max-h-[90vh] w-full overflow-y-auto rounded-[28px] border border-black/[0.08] bg-[#F7F7F2] shadow-[0_30px_100px_rgba(0,0,0,0.2)] ${
          wide
            ? "max-w-4xl"
            : "max-w-lg"
        }`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-black/[0.06] bg-[#F7F7F2]/90 p-5 backdrop-blur-xl">
          <div>
            <h2 className="text-xl font-black">
              {title}
            </h2>

            {subtitle && (
              <p className="mt-1 text-sm text-[#68705D]">
                {subtitle}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/[0.04]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

function MoneyInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold">
        {label}
      </label>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#68705D]">
          ₹
        </span>

        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="h-12 w-full rounded-xl border border-black/[0.08] bg-white pl-9 pr-4 text-sm font-semibold outline-none focus:border-[#DFFF00] focus:ring-4 focus:ring-[#DFFF00]/15"
        />
      </div>
    </div>
  );
}

function DetailBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white/70 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A9182]">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-bold">
        {value}
      </p>
    </div>
  );
}

function SalaryRow({
  label,
  value,
  strong = false,
  negative = false,
  highlight = false,
}: {
  label: string;
  value: number;
  strong?: boolean;
  negative?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 ${
        highlight
          ? "bg-[#DFFF00]/20"
          : "bg-white/70"
      }`}
    >
      <span
        className={
          strong
            ? "font-black"
            : "text-sm text-[#68705D]"
        }
      >
        {label}
      </span>

      <span
        className={`${
          strong
            ? "font-black"
            : "font-semibold"
        } ${
          negative
            ? "text-red-600"
            : ""
        }`}
      >
        {negative ? "-" : ""}
        {formatCurrency(
          Math.abs(value)
        )}
      </span>
    </div>
  );
}

function PayRunPreview({
  payRun,
}: {
  payRun: PayRun;
}) {
  return (
    <div className="rounded-2xl border border-[#DFFF00]/40 bg-[#DFFF00]/10 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-black">
            {payRun.name}
          </p>

          <p className="mt-1 text-xs text-[#68705D]">
            {formatDate(
              payRun.periodStart
            )}{" "}
            →{" "}
            {formatDate(
              payRun.periodEnd
            )}
          </p>
        </div>

        <span className="rounded-full bg-[#10130B] px-3 py-1 text-xs font-bold text-white">
          Approved
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <p className="text-[11px] text-[#68705D]">
            Employees
          </p>

          <p className="font-black">
            {payRun.employees.length}
          </p>
        </div>

        <div>
          <p className="text-[11px] text-[#68705D]">
            Gross
          </p>

          <p className="font-black">
            {formatCurrency(
              payRun.totalGross
            )}
          </p>
        </div>

        <div>
          <p className="text-[11px] text-[#68705D]">
            Deductions
          </p>

          <p className="font-black">
            {formatCurrency(
              payRun.totalDeductions
            )}
          </p>
        </div>

        <div>
          <p className="text-[11px] text-[#68705D]">
            Net
          </p>

          <p className="font-black">
            {formatCurrency(
              payRun.totalNet
            )}
          </p>
        </div>
      </div>
    </div>
  );
}