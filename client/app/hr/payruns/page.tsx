"use client";

import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Eye,
  FileText,
  Lock,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Trash2,
  Users,
  X,
  Zap,
} from "lucide-react";

import type { Employee } from "@/types/employee";
import type { Contract } from "@/types/contract";
import type { SalaryStructure } from "@/types/salary-structure";
import type { SalaryRule } from "@/types/salary-rule";
import type {
  PayRun,
  PayRunEmployee,
  PayRunStatus,
} from "@/types/pay-run";

import {
  createPayRun,
  deletePayRun,
  getPayRuns,
  subscribeToPayRunChanges,
  updatePayRun,
} from "@/lib/payrun-storage";

import {
  getEmployees,
  subscribeToDataChanges,
} from "@/lib/employee-storage";

import {
  getContracts,
  subscribeToContractChanges,
} from "@/lib/contract-storage";

import {
  getSalaryStructures,
  subscribeToSalaryStructureChanges,
} from "@/lib/salary-structure-storage";

import {
  getSalaryRules,
  subscribeToSalaryRuleChanges,
} from "@/lib/salary-rule-storage";

import {
  calculateEmployeePayroll,
  calculatePayRunTotals,
} from "@/lib/payroll-calculation";

import type { HRRole } from "@/lib/hr-permissions";

import {
  canCreate,
  canDelete,
  canRead,
  canUpdate,
} from "@/lib/hr-permissions";

import HRPageHeader from "@/components/hr/HRPageHeader";
import HRGlassCard from "@/components/hr/HRGlassCard";
import HRStatCard from "@/components/hr/HRStatCard";
import HREmptyState from "@/components/hr/HREmptyState";

/* =========================================================
   Helpers
========================================================= */

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value: string) {
  if (!value) return "—";

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

function statusLabel(status: PayRunStatus) {
  switch (status) {
    case "draft":
      return "Draft";

    case "processing":
      return "Processing";

    case "review":
      return "Review";

    case "approved":
      return "Approved";

    case "locked":
      return "Locked";

    default:
      return status;
  }
}

function statusClasses(status: PayRunStatus) {
  switch (status) {
    case "draft":
      return "bg-black/5 text-black/60";

    case "processing":
      return "bg-blue-100 text-blue-700";

    case "review":
      return "bg-amber-100 text-amber-700";

    case "approved":
      return "bg-[#DFFF00]/40 text-[#10130B]";

    case "locked":
      return "bg-emerald-100 text-emerald-700";

    default:
      return "bg-black/5 text-black/60";
  }
}

function frequencyLabel(
  frequency: PayRun["frequency"]
) {
  return (
    frequency.charAt(0).toUpperCase() +
    frequency.slice(1)
  );
}

function getDefaultDates(
  frequency: PayRun["frequency"]
) {
  const today = new Date();

  if (frequency === "monthly") {
    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    const end = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );

    return {
      periodStart: start
        .toISOString()
        .split("T")[0],

      periodEnd: end
        .toISOString()
        .split("T")[0],

      paymentDate: new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        1
      )
        .toISOString()
        .split("T")[0],
    };
  }

  if (frequency === "weekly") {
    const day =
      today.getDay();

    const diff =
      day === 0 ? 6 : day - 1;

    const start = new Date(today);

    start.setDate(
      today.getDate() - diff
    );

    const end = new Date(start);

    end.setDate(
      start.getDate() + 6
    );

    return {
      periodStart: start
        .toISOString()
        .split("T")[0],

      periodEnd: end
        .toISOString()
        .split("T")[0],

      paymentDate: end
        .toISOString()
        .split("T")[0],
    };
  }

  const date = today
    .toISOString()
    .split("T")[0];

  return {
    periodStart: date,
    periodEnd: date,
    paymentDate: date,
  };
}

/* =========================================================
   Page
========================================================= */

export default function PayrunsPage() {
  /*
   * Temporary role.
   *
   * Replace this with the authenticated
   * user's real HR role later.
   */
  const role: HRRole =
    "HR_PAYROLL_USER";

  const canView = canRead(
    role,
    "payruns"
  );

  const canManage = canCreate(
    role,
    "payruns"
  );

  const canEdit = canUpdate(
    role,
    "payruns"
  );

  const canRemove = canDelete(
    role,
    "payruns"
  );

  /* =========================================================
     Data
  ========================================================= */

  const [payRuns, setPayRuns] =
    useState<PayRun[]>([]);

  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [contracts, setContracts] =
    useState<Contract[]>([]);

  const [
    salaryStructures,
    setSalaryStructures,
  ] = useState<SalaryStructure[]>([]);

  const [salaryRules, setSalaryRules] =
    useState<SalaryRule[]>([]);

  /* =========================================================
     Filters
  ========================================================= */

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<
      "all" | PayRunStatus
    >("all");

  const [frequencyFilter, setFrequencyFilter] =
    useState<
      "all" | PayRun["frequency"]
    >("all");

  /* =========================================================
     Modals
  ========================================================= */

  const [showCreate, setShowCreate] =
    useState(false);

  const [selectedPayRun, setSelectedPayRun] =
    useState<PayRun | null>(null);

  /* =========================================================
     Menu / Loading / Message
  ========================================================= */

  const [showMenu, setShowMenu] =
    useState<string | null>(null);

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /* =========================================================
     Create Form
  ========================================================= */

  const defaultDates =
    getDefaultDates("monthly");

  const [form, setForm] = useState({
    name: "",
    periodStart:
      defaultDates.periodStart,
    periodEnd:
      defaultDates.periodEnd,
    paymentDate:
      defaultDates.paymentDate,
    frequency:
      "monthly" as PayRun["frequency"],
    employeeIds: [] as string[],
  });

  /* =========================================================
     Load
  ========================================================= */

  function loadAll() {
    setPayRuns(getPayRuns());
    setEmployees(getEmployees());
    setContracts(getContracts());
    setSalaryStructures(
      getSalaryStructures()
    );
    setSalaryRules(getSalaryRules());
  }

  useEffect(() => {
    loadAll();

    const unsubscribePayRuns =
      subscribeToPayRunChanges(() => {
        setPayRuns(getPayRuns());
      });

    const unsubscribeEmployees =
      subscribeToDataChanges(() => {
        setEmployees(getEmployees());
      });

    const unsubscribeContracts =
      subscribeToContractChanges(() => {
        setContracts(
          getContracts()
        );
      });

    const unsubscribeStructures =
      subscribeToSalaryStructureChanges(
        () => {
          setSalaryStructures(
            getSalaryStructures()
          );
        }
      );

    const unsubscribeRules =
      subscribeToSalaryRuleChanges(
        () => {
          setSalaryRules(
            getSalaryRules()
          );
        }
      );

    return () => {
      unsubscribePayRuns();
      unsubscribeEmployees();
      unsubscribeContracts();
      unsubscribeStructures();
      unsubscribeRules();
    };
  }, []);

  /* =========================================================
     Maps
  ========================================================= */

  const employeeMap = useMemo(() => {
    const map = new Map<
      string,
      Employee
    >();

    employees.forEach(
      (employee) => {
        map.set(
          employee.id,
          employee
        );
      }
    );

    return map;
  }, [employees]);

  const contractMap = useMemo(() => {
    const map = new Map<
      string,
      Contract
    >();

    contracts.forEach(
      (contract) => {
        map.set(
          contract.id,
          contract
        );
      }
    );

    return map;
  }, [contracts]);

  const structureMap = useMemo(() => {
    const map = new Map<
      string,
      SalaryStructure
    >();

    salaryStructures.forEach(
      (structure) => {
        map.set(
          structure.id,
          structure
        );
      }
    );

    return map;
  }, [salaryStructures]);

  /* =========================================================
     Filtered Payruns
  ========================================================= */

  const filteredPayRuns = useMemo(() => {
    const query =
      search
        .trim()
        .toLowerCase();

    return payRuns.filter(
      (payRun) => {
        const matchesSearch =
          !query ||
          payRun.name
            .toLowerCase()
            .includes(query) ||
          payRun.id
            .toLowerCase()
            .includes(query);

        const matchesStatus =
          statusFilter === "all" ||
          payRun.status ===
            statusFilter;

        const matchesFrequency =
          frequencyFilter ===
            "all" ||
          payRun.frequency ===
            frequencyFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesFrequency
        );
      }
    );
  }, [
    payRuns,
    search,
    statusFilter,
    frequencyFilter,
  ]);

  /* =========================================================
     Stats
  ========================================================= */

  const stats = useMemo(() => {
    const total =
      payRuns.length;

    const draft =
      payRuns.filter(
        (p) =>
          p.status === "draft"
      ).length;

    const processing =
      payRuns.filter(
        (p) =>
          p.status ===
          "processing"
      ).length;

    const review =
      payRuns.filter(
        (p) =>
          p.status === "review"
      ).length;

    const approved =
      payRuns.filter(
        (p) =>
          p.status ===
          "approved"
      ).length;

    const locked =
      payRuns.filter(
        (p) =>
          p.status === "locked"
      ).length;

    const totalNet =
      payRuns.reduce(
        (sum, payRun) =>
          sum + payRun.totalNet,
        0
      );

    return {
      total,
      draft,
      processing,
      review,
      approved,
      locked,
      totalNet,
    };
  }, [payRuns]);

  /* =========================================================
     Form helpers
  ========================================================= */

  function resetForm() {
    const dates =
      getDefaultDates(
        "monthly"
      );

    setForm({
      name: "",
      periodStart:
        dates.periodStart,
      periodEnd:
        dates.periodEnd,
      paymentDate:
        dates.paymentDate,
      frequency: "monthly",
      employeeIds: [],
    });

    setError("");
  }

  function handleFrequencyChange(
    frequency: PayRun["frequency"]
  ) {
    const dates =
      getDefaultDates(
        frequency
      );

    setForm(
      (previous) => ({
        ...previous,
        frequency,
        periodStart:
          dates.periodStart,
        periodEnd:
          dates.periodEnd,
        paymentDate:
          dates.paymentDate,
      })
    );
  }

  function toggleEmployee(
    employeeId: string
  ) {
    setForm(
      (previous) => {
        const exists =
          previous.employeeIds.includes(
            employeeId
          );

        return {
          ...previous,
          employeeIds: exists
            ? previous.employeeIds.filter(
                (id) =>
                  id !== employeeId
              )
            : [
                ...previous.employeeIds,
                employeeId,
              ],
        };
      }
    );
  }

  function selectAllEmployees() {
    setForm(
      (previous) => ({
        ...previous,
        employeeIds:
          employees
            .filter(
              (employee) =>
                employee.status ===
                "active"
            )
            .map(
              (employee) =>
                employee.id
            ),
      })
    );
  }

  function clearEmployees() {
    setForm(
      (previous) => ({
        ...previous,
        employeeIds: [],
      })
    );
  }

  /* =========================================================
     Contract Resolution
  ========================================================= */

  function getContractForPayRun(
    employeeId: string,
    periodStart: string,
    periodEnd: string
  ): Contract | null {
    const payrollStart =
      new Date(
        periodStart
      );

    const payrollEnd =
      new Date(
        periodEnd
      );

    const employeeContracts =
      contracts
        .filter(
          (contract) =>
            contract.employeeId ===
            employeeId
        )
        .filter(
          (contract) => {
            const contractStart =
              new Date(
                contract.startDate
              );

            const contractEnd =
              new Date(
                contract.endDate
              );

            return (
              contractStart <=
                payrollEnd &&
              contractEnd >=
                payrollStart
            );
          }
        )
        .sort(
          (a, b) =>
            new Date(
              b.startDate
            ).getTime() -
            new Date(
              a.startDate
            ).getTime()
        );

    return (
      employeeContracts[0] ??
      null
    );
  }

  /* =========================================================
     Salary Structure Resolution
  ========================================================= */

  function getSalaryStructureForEmployee(
    employeeId: string
  ): SalaryStructure | null {
    const activeStructures =
      salaryStructures.filter(
        (structure) =>
          structure.status ===
            "active" &&
          structure.employeeIds.includes(
            employeeId
          )
      );

    if (
      activeStructures.length ===
      0
    ) {
      return null;
    }

    return (
      activeStructures[0] ??
      null
    );
  }

  /* =========================================================
     Create Payrun
  ========================================================= */

  function handleCreatePayRun() {
    if (!canManage) {
      setError(
        "You do not have permission to create payruns."
      );
      return;
    }

    if (
      !form.name.trim()
    ) {
      setError(
        "Please enter a payrun name."
      );
      return;
    }

    if (
      !form.periodStart ||
      !form.periodEnd ||
      !form.paymentDate
    ) {
      setError(
        "Please complete all dates."
      );
      return;
    }

    if (
      new Date(
        form.periodStart
      ) >
      new Date(
        form.periodEnd
      )
    ) {
      setError(
        "Period start cannot be after period end."
      );
      return;
    }

    if (
      form.employeeIds.length ===
      0
    ) {
      setError(
        "Select at least one employee."
      );
      return;
    }

    const selectedEmployees =
      employees.filter(
        (employee) =>
          form.employeeIds.includes(
            employee.id
          )
      );

    const inactiveEmployees =
      selectedEmployees.filter(
        (employee) =>
          employee.status !==
          "active"
      );

    if (
      inactiveEmployees.length >
      0
    ) {
      setError(
        "Inactive employees cannot be added to a new payrun."
      );
      return;
    }

    /*
     * Validate contracts before creating.
     */
    const missingContracts =
      selectedEmployees.filter(
        (employee) =>
          !getContractForPayRun(
            employee.id,
            form.periodStart,
            form.periodEnd
          )
      );

    if (
      missingContracts.length >
      0
    ) {
      setError(
        `Missing active contract for: ${missingContracts
          .map(
            (employee) =>
              employee.name
          )
          .join(", ")}`
      );

      return;
    }

    /*
     * Validate salary structures.
     */
    const missingStructures =
      selectedEmployees.filter(
        (employee) =>
          !getSalaryStructureForEmployee(
            employee.id
          )
      );

    if (
      missingStructures.length >
      0
    ) {
      setError(
        `Missing active salary structure for: ${missingStructures
          .map(
            (employee) =>
              employee.name
          )
          .join(", ")}`
      );

      return;
    }

    const now =
      new Date().toISOString();

    /*
     * Create preview employees.
     *
     * Actual payroll calculation
     * happens when Process is clicked.
     */
    const previewEmployees: PayRunEmployee[] =
      selectedEmployees.map(
        (employee) => {
          const contract =
            getContractForPayRun(
              employee.id,
              form.periodStart,
              form.periodEnd
            );

          const structure =
            getSalaryStructureForEmployee(
              employee.id
            );

          const basicSalary =
            calculateBasicSalaryPreview(
              employee,
              structure,
              form.frequency
            );

          return {
            employeeId:
              employee.id,

            employeeName:
              employee.name,

            contractId:
              contract?.id || "",

            salaryStructureId:
              structure?.id || "",

            basicSalary,

            earnings: 0,

            deductions: 0,

            employerContributions: 0,

            grossSalary:
              basicSalary,

            netSalary:
              basicSalary,

            employerCost:
              basicSalary,

            status: "pending",
          };
        }
      );

    const totals =
      calculatePayRunTotals(
        previewEmployees
      );

    createPayRun({
      name: form.name.trim(),

      periodStart:
        form.periodStart,

      periodEnd:
        form.periodEnd,

      paymentDate:
        form.paymentDate,

      frequency:
        form.frequency,

      employeeIds:
        form.employeeIds,

      employees:
        previewEmployees,

      totalBasic:
        totals.basic,

      totalEarnings:
        totals.earnings,

      totalGross:
        totals.gross,

      totalDeductions:
        totals.deductions,

      totalNet:
        totals.net,

      totalEmployerContributions:
        totals.employerContributions,

      totalEmployerCost:
        totals.employerCost,

      status: "draft",

      createdAt: now,
    });

    setMessage(
      "Payrun created successfully."
    );

    setShowCreate(false);

    resetForm();

    loadAll();
  }

  /* =========================================================
     Process Payroll
  ========================================================= */

  function handleProcessPayRun(
    payRun: PayRun
  ) {
    if (!canEdit) {
      setMessage(
        "You do not have permission to process payruns."
      );

      return;
    }

    if (
      payRun.status !==
      "draft"
    ) {
      setMessage(
        "Only draft payruns can be processed."
      );

      return;
    }

    setProcessingId(
      payRun.id
    );

    setError("");

    try {
      const calculatedEmployees: PayRunEmployee[] =
        [];

      const missingContracts: string[] =
        [];

      const missingStructures: string[] =
        [];

      payRun.employeeIds.forEach(
        (employeeId) => {
          const employee =
            employeeMap.get(
              employeeId
            );

          if (!employee) {
            return;
          }

          const contract =
            getContractForPayRun(
              employee.id,
              payRun.periodStart,
              payRun.periodEnd
            );

          if (!contract) {
            missingContracts.push(
              employee.name
            );

            return;
          }

          const structure =
            getSalaryStructureForEmployee(
              employee.id
            );

          if (!structure) {
            missingStructures.push(
              employee.name
            );

            return;
          }

          const result =
            calculateEmployeePayroll(
              {
                employee,

                contractId:
                  contract.id,

                salaryStructure:
                  structure,

                salaryRules:
                  salaryRules,

                payRunFrequency:
                  payRun.frequency,
              }
            );

          calculatedEmployees.push(
            result.employee
          );
        }
      );

      if (
        missingContracts.length >
        0
      ) {
        setMessage(
          `Cannot process. Missing contract for: ${missingContracts.join(
            ", "
          )}`
        );

        return;
      }

      if (
        missingStructures.length >
        0
      ) {
        setMessage(
          `Cannot process. Missing salary structure for: ${missingStructures.join(
            ", "
          )}`
        );

        return;
      }

      if (
        calculatedEmployees.length ===
        0
      ) {
        setMessage(
          "No employees could be calculated."
        );

        return;
      }

      const totals =
        calculatePayRunTotals(
          calculatedEmployees
        );

      updatePayRun(
        payRun.id,
        {
          employees:
            calculatedEmployees,

          totalBasic:
            totals.basic,

          totalEarnings:
            totals.earnings,

          totalGross:
            totals.gross,

          totalDeductions:
            totals.deductions,

          totalNet:
            totals.net,

          totalEmployerContributions:
            totals.employerContributions,

          totalEmployerCost:
            totals.employerCost,

          status:
            "processing",
        }
      );

      setMessage(
        "Payroll calculated successfully."
      );

      setSelectedPayRun(
        null
      );

      setShowMenu(null);

      loadAll();
    } catch (error) {
      console.error(
        "Payroll processing failed:",
        error
      );

      setMessage(
        "Failed to process payroll."
      );
    } finally {
      setProcessingId(null);
    }
  }

  /* =========================================================
     Processing → Review
  ========================================================= */

  function handleMoveToReview(
    payRun: PayRun
  ) {
    if (!canEdit) {
      setMessage(
        "You do not have permission to update payruns."
      );

      return;
    }

    if (
      payRun.status !==
      "processing"
    ) {
      return;
    }

    if (
      payRun.employees.length ===
      0
    ) {
      setMessage(
        "This payrun has no calculated employees."
      );

      return;
    }

    updatePayRun(
      payRun.id,
      {
        status: "review",
      }
    );

    setMessage(
      "Payrun moved to review."
    );

    setSelectedPayRun(
      null
    );

    setShowMenu(null);

    loadAll();
  }

  /* =========================================================
     Review → Approved
  ========================================================= */

  function handleApprove(
    payRun: PayRun
  ) {
    if (!canEdit) {
      setMessage(
        "You do not have permission to approve payruns."
      );

      return;
    }

    if (
      payRun.status !==
      "review"
    ) {
      return;
    }

    updatePayRun(
      payRun.id,
      {
        status: "approved",
        employees:
          payRun.employees.map(
            (employee) => ({
              ...employee,
              status:
                "approved",
            })
          ),
      }
    );

    setMessage(
      "Payrun approved successfully."
    );

    setSelectedPayRun(
      null
    );

    setShowMenu(null);

    loadAll();
  }

  /* =========================================================
     Approved → Locked
  ========================================================= */

  function handleLock(
    payRun: PayRun
  ) {
    /*
     * Only payroll manager can lock
     * payroll.
     */
    if (
      role !==
      "HR_PAYROLL_MANAGER"
    ) {
      setMessage(
        "Only HR Payroll Manager can lock a payrun."
      );

      return;
    }

    if (
      payRun.status !==
      "approved"
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Lock ${payRun.name}? Locked payruns should not be changed.`
      );

    if (!confirmed) {
      return;
    }

    updatePayRun(
      payRun.id,
      {
        status: "locked",
      }
    );

    setMessage(
      "Payrun locked successfully."
    );

    setSelectedPayRun(
      null
    );

    setShowMenu(null);

    loadAll();
  }

  /* =========================================================
     Delete
  ========================================================= */

  function handleDelete(
    payRun: PayRun
  ) {
    if (!canRemove) {
      setMessage(
        "You do not have permission to delete payruns."
      );

      return;
    }

    if (
      payRun.status !==
      "draft"
    ) {
      setMessage(
        "Only draft payruns can be deleted."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Delete ${payRun.name}?`
      );

    if (!confirmed) {
      return;
    }

    deletePayRun(
      payRun.id
    );

    setMessage(
      "Payrun deleted successfully."
    );

    setSelectedPayRun(
      null
    );

    setShowMenu(null);

    loadAll();
  }

  /* =========================================================
     Employee helpers
  ========================================================= */

  function getEmployeeStructure(
    employeeId: string
  ) {
    return getSalaryStructureForEmployee(
      employeeId
    );
  }

  function getEmployeeContract(
    employeeId: string,
    payRun: PayRun
  ) {
    return getContractForPayRun(
      employeeId,
      payRun.periodStart,
      payRun.periodEnd
    );
  }

  /* =========================================================
     Access denied
  ========================================================= */

  if (!canView) {
    return (
      <div className="min-h-screen p-5 sm:p-6 lg:p-8">
        <HRPageHeader
          title="Payruns"
          description="Process and manage employee payroll."
        />

        <HRGlassCard className="mt-6">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-black/5">
              <Lock
                size={28}
                className="text-black/40"
              />
            </div>

            <h2 className="text-lg font-black">
              Access restricted
            </h2>

            <p className="mt-2 max-w-md text-sm text-[#68705D]">
              Your HR role does not have
              access to Payruns.
            </p>
          </div>
        </HRGlassCard>
      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <HRPageHeader
        title="Payruns"
        description="Calculate, review and approve employee payroll."
      />

      {/* Message */}
      {message && (
        <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-[#DFFF00]/50 bg-[#DFFF00]/20 px-4 py-3 text-sm font-semibold">
          <div className="flex items-center gap-2">
            <Check size={17} />

            <span>
              {message}
            </span>
          </div>

          <button
            onClick={() =>
              setMessage("")
            }
            className="rounded-lg p-1 hover:bg-black/5"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-5 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <div className="flex items-start gap-2">
            <AlertCircle
              size={17}
              className="mt-0.5 shrink-0"
            />

            <span>
              {error}
            </span>
          </div>

          <button
            onClick={() =>
              setError("")
            }
            className="rounded-lg p-1 hover:bg-red-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* =====================================================
          Stats
      ===================================================== */}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <HRStatCard
          title="Total Payruns"
          value={stats.total}
          icon={FileText}
        />

        <HRStatCard
          title="Draft"
          value={stats.draft}
          icon={FileText}
        />

        <HRStatCard
          title="In Review"
          value={stats.review}
          icon={Clock3}
        />

        <HRStatCard
          title="Approved"
          value={stats.approved}
          icon={Check}
        />

        <HRStatCard
          title="Total Net Payroll"
          value={formatCurrency(
            stats.totalNet
          )}
          icon={CircleDollarSign}
        />
      </div>

      {/* =====================================================
          Toolbar
      ===================================================== */}

      <HRGlassCard className="mt-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#68705D]"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search payrun..."
              className="h-11 w-full rounded-xl border border-black/[0.07] bg-white/70 pl-11 pr-4 text-sm outline-none transition placeholder:text-black/35 focus:border-[#DFFF00] focus:ring-4 focus:ring-[#DFFF00]/15"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "all"
                    | PayRunStatus
                )
              }
              className="h-11 rounded-xl border border-black/[0.07] bg-white/70 px-4 text-sm outline-none focus:border-[#DFFF00]"
            >
              <option value="all">
                All statuses
              </option>

              <option value="draft">
                Draft
              </option>

              <option value="processing">
                Processing
              </option>

              <option value="review">
                Review
              </option>

              <option value="approved">
                Approved
              </option>

              <option value="locked">
                Locked
              </option>
            </select>

            <select
              value={
                frequencyFilter
              }
              onChange={(event) =>
                setFrequencyFilter(
                  event.target.value as
                    | "all"
                    | PayRun["frequency"]
                )
              }
              className="h-11 rounded-xl border border-black/[0.07] bg-white/70 px-4 text-sm outline-none focus:border-[#DFFF00]"
            >
              <option value="all">
                All frequencies
              </option>

              <option value="monthly">
                Monthly
              </option>

              <option value="weekly">
                Weekly
              </option>

              <option value="daily">
                Daily
              </option>

              <option value="yearly">
                Yearly
              </option>
            </select>

            {canManage && (
              <button
                onClick={() => {
                  resetForm();
                  setShowCreate(true);
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#10130B] px-5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5"
              >
                <Plus size={17} />

                New Payrun
              </button>
            )}
          </div>
        </div>
      </HRGlassCard>

      {/* =====================================================
          Desktop Table
      ===================================================== */}

      <HRGlassCard className="mt-5 hidden overflow-hidden lg:block">
        {filteredPayRuns.length ===
        0 ? (
          <HREmptyState
            title="No payruns found"
            description={
              search ||
              statusFilter !==
                "all" ||
              frequencyFilter !==
                "all"
                ? "Try changing your search or filters."
                : "Create your first payrun to start processing payroll."
            }
            icon={FileText}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="border-b border-black/[0.06] text-left text-xs uppercase tracking-wider text-[#68705D]">
                  <th className="px-6 py-4 font-semibold">
                    Payrun
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Period
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Frequency
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Employees
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Gross
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Deductions
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Net Pay
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredPayRuns.map(
                  (payRun) => (
                    <tr
                      key={payRun.id}
                      className="border-b border-black/[0.045] transition hover:bg-white/60"
                    >
                      <td className="px-6 py-5">
                        <div className="font-black">
                          {payRun.name}
                        </div>

                        <div className="mt-1 text-xs text-[#68705D]">
                          {payRun.id}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="text-sm font-semibold">
                          {formatDate(
                            payRun.periodStart
                          )}
                        </div>

                        <div className="mt-1 text-xs text-[#68705D]">
                          to{" "}
                          {formatDate(
                            payRun.periodEnd
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-lg bg-black/5 px-3 py-1.5 text-xs font-bold">
                          {frequencyLabel(
                            payRun.frequency
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#DFFF00]/30">
                            <Users
                              size={15}
                            />
                          </div>

                          <span className="font-bold">
                            {
                              payRun
                                .employeeIds
                                .length
                            }
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5 font-semibold">
                        {formatCurrency(
                          payRun.totalGross
                        )}
                      </td>

                      <td className="px-6 py-5 text-red-600">
                        {formatCurrency(
                          payRun.totalDeductions
                        )}
                      </td>

                      <td className="px-6 py-5 font-black">
                        {formatCurrency(
                          payRun.totalNet
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${statusClasses(
                            payRun.status
                          )}`}
                        >
                          {statusLabel(
                            payRun.status
                          )}
                        </span>
                      </td>

                      <td className="relative px-6 py-5 text-right">
                        <button
                          onClick={() =>
                            setShowMenu(
                              showMenu ===
                                payRun.id
                                ? null
                                : payRun.id
                            )
                          }
                          className="rounded-xl p-2 hover:bg-black/5"
                        >
                          <MoreHorizontal
                            size={19}
                          />
                        </button>

                        {showMenu ===
                          payRun.id && (
                          <PayRunMenu
                            payRun={
                              payRun
                            }
                            canEdit={
                              canEdit
                            }
                            canRemove={
                              canRemove
                            }
                            processing={
                              processingId ===
                              payRun.id
                            }
                            onView={() => {
                              setSelectedPayRun(
                                payRun
                              );

                              setShowMenu(
                                null
                              );
                            }}
                            onProcess={() => {
                              setShowMenu(
                                null
                              );

                              handleProcessPayRun(
                                payRun
                              );
                            }}
                            onReview={() => {
                              setShowMenu(
                                null
                              );

                              handleMoveToReview(
                                payRun
                              );
                            }}
                            onApprove={() => {
                              setShowMenu(
                                null
                              );

                              handleApprove(
                                payRun
                              );
                            }}
                            onLock={() => {
                              setShowMenu(
                                null
                              );

                              handleLock(
                                payRun
                              );
                            }}
                            onDelete={() => {
                              setShowMenu(
                                null
                              );

                              handleDelete(
                                payRun
                              );
                            }}
                            role={
                              role
                            }
                          />
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </HRGlassCard>

      {/* =====================================================
          Mobile Cards
      ===================================================== */}

      <div className="mt-5 space-y-3 lg:hidden">
        {filteredPayRuns.length ===
        0 ? (
          <HRGlassCard>
            <HREmptyState
              title="No payruns found"
              description="Create a payrun to begin."
              icon={FileText}
            />
          </HRGlassCard>
        ) : (
          filteredPayRuns.map(
            (payRun) => (
              <HRGlassCard
                key={payRun.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-black">
                      {payRun.name}
                    </div>

                    <div className="mt-1 text-xs text-[#68705D]">
                      {payRun.id}
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${statusClasses(
                      payRun.status
                    )}`}
                  >
                    {statusLabel(
                      payRun.status
                    )}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <MobileStat
                    label="Employees"
                    value={String(
                      payRun
                        .employeeIds
                        .length
                    )}
                  />

                  <MobileStat
                    label="Frequency"
                    value={frequencyLabel(
                      payRun.frequency
                    )}
                  />

                  <MobileStat
                    label="Gross"
                    value={formatCurrency(
                      payRun.totalGross
                    )}
                  />

                  <MobileStat
                    label="Net Pay"
                    value={formatCurrency(
                      payRun.totalNet
                    )}
                    highlight
                  />
                </div>

                <div className="mt-5 border-t border-black/[0.06] pt-4">
                  <div className="text-xs text-[#68705D]">
                    {formatDate(
                      payRun.periodStart
                    )}
                    {" → "}
                    {formatDate(
                      payRun.periodEnd
                    )}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() =>
                        setSelectedPayRun(
                          payRun
                        )
                      }
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-black/5 px-3 py-2.5 text-xs font-bold"
                    >
                      <Eye
                        size={15}
                      />

                      View
                    </button>

                    {payRun.status ===
                      "draft" &&
                      canEdit && (
                        <button
                          onClick={() =>
                            handleProcessPayRun(
                              payRun
                            )
                          }
                          disabled={
                            processingId ===
                            payRun.id
                          }
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#10130B] px-3 py-2.5 text-xs font-bold text-white disabled:opacity-40"
                        >
                          {processingId ===
                          payRun.id ? (
                            "Processing..."
                          ) : (
                            <>
                              <Play
                                size={
                                  14
                                }
                              />

                              Process
                            </>
                          )}
                        </button>
                      )}

                    {payRun.status ===
                      "processing" &&
                      canEdit && (
                        <button
                          onClick={() =>
                            handleMoveToReview(
                              payRun
                            )
                          }
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#DFFF00] px-3 py-2.5 text-xs font-bold"
                        >
                          Review
                        </button>
                      )}

                    {payRun.status ===
                      "review" &&
                      canEdit && (
                        <button
                          onClick={() =>
                            handleApprove(
                              payRun
                            )
                          }
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#DFFF00] px-3 py-2.5 text-xs font-bold"
                        >
                          <Check
                            size={14}
                          />

                          Approve
                        </button>
                      )}
                  </div>
                </div>
              </HRGlassCard>
            )
          )
        )}
      </div>

      {/* =====================================================
          CREATE PAYRUN MODAL
      ===================================================== */}

      {showCreate && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/30 p-4 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center py-8">
            <div className="w-full max-w-3xl rounded-3xl border border-black/[0.07] bg-white/95 shadow-2xl">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-black/[0.06] p-6">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DFFF00]">
                      <Zap
                        size={20}
                      />
                    </div>

                    <div>
                      <h2 className="text-xl font-black">
                        Create Payrun
                      </h2>

                      <p className="mt-1 text-xs text-[#68705D]">
                        Configure a new payroll period.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setShowCreate(
                      false
                    )
                  }
                  className="rounded-xl p-2 hover:bg-black/5"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-6 p-6">
                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                    <div className="flex items-start gap-2">
                      <AlertCircle
                        size={17}
                        className="mt-0.5 shrink-0"
                      />

                      <span>
                        {error}
                      </span>
                    </div>
                  </div>
                )}

                {/* Name + Frequency */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Payrun Name
                    </label>

                    <input
                      value={
                        form.name
                      }
                      onChange={(
                        event
                      ) =>
                        setForm(
                          (
                            previous
                          ) => ({
                            ...previous,
                            name: event
                              .target
                              .value,
                          })
                        )
                      }
                      placeholder="e.g. September 2026 Payroll"
                      className="h-12 w-full rounded-xl border border-black/[0.08] bg-white px-4 text-sm outline-none focus:border-[#DFFF00] focus:ring-4 focus:ring-[#DFFF00]/15"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Frequency
                    </label>

                    <select
                      value={
                        form.frequency
                      }
                      onChange={(
                        event
                      ) =>
                        handleFrequencyChange(
                          event
                            .target
                            .value as PayRun["frequency"]
                        )
                      }
                      className="h-12 w-full rounded-xl border border-black/[0.08] bg-white px-4 text-sm outline-none focus:border-[#DFFF00]"
                    >
                      <option value="monthly">
                        Monthly
                      </option>

                      <option value="weekly">
                        Weekly
                      </option>

                      <option value="daily">
                        Daily
                      </option>

                      <option value="yearly">
                        Yearly
                      </option>
                    </select>
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <div className="mb-3 text-sm font-black">
                    Payroll Period
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <DateInput
                      label="Period Start"
                      value={
                        form.periodStart
                      }
                      onChange={(
                        value
                      ) =>
                        setForm(
                          (
                            previous
                          ) => ({
                            ...previous,
                            periodStart:
                              value,
                          })
                        )
                      }
                    />

                    <DateInput
                      label="Period End"
                      value={
                        form.periodEnd
                      }
                      onChange={(
                        value
                      ) =>
                        setForm(
                          (
                            previous
                          ) => ({
                            ...previous,
                            periodEnd:
                              value,
                          })
                        )
                      }
                    />

                    <DateInput
                      label="Payment Date"
                      value={
                        form.paymentDate
                      }
                      onChange={(
                        value
                      ) =>
                        setForm(
                          (
                            previous
                          ) => ({
                            ...previous,
                            paymentDate:
                              value,
                          })
                        )
                      }
                    />
                  </div>
                </div>

                {/* Employees */}
                <div>
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-black">
                        Employees
                      </div>

                      <div className="mt-1 text-xs text-[#68705D]">
                        Select employees to include in this payrun.
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={
                          selectAllEmployees
                        }
                        className="rounded-lg bg-black/5 px-3 py-1.5 text-xs font-bold hover:bg-black/10"
                      >
                        Select All
                      </button>

                      <button
                        type="button"
                        onClick={
                          clearEmployees
                        }
                        className="rounded-lg bg-black/5 px-3 py-1.5 text-xs font-bold hover:bg-black/10"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto rounded-2xl border border-black/[0.07] bg-black/[0.015]">
                    {employees.filter(
                      (employee) =>
                        employee.status ===
                        "active"
                    ).length ===
                    0 ? (
                      <div className="p-8 text-center text-sm text-[#68705D]">
                        No active employees available.
                      </div>
                    ) : (
                      <div className="divide-y divide-black/[0.05]">
                        {employees
                          .filter(
                            (
                              employee
                            ) =>
                              employee.status ===
                              "active"
                          )
                          .map(
                            (
                              employee
                            ) => {
                              const selected =
                                form.employeeIds.includes(
                                  employee.id
                                );

                              const structure =
                                getEmployeeStructure(
                                  employee.id
                                );

                              const contract =
                                getContractForPayRun(
                                  employee.id,
                                  form.periodStart,
                                  form.periodEnd
                                );

                              return (
                                <button
                                  type="button"
                                  key={
                                    employee.id
                                  }
                                  onClick={() =>
                                    toggleEmployee(
                                      employee.id
                                    )
                                  }
                                  className={`flex w-full items-center gap-4 px-4 py-3 text-left transition ${
                                    selected
                                      ? "bg-[#DFFF00]/15"
                                      : "hover:bg-white/70"
                                  }`}
                                >
                                  <div
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                      selected
                                        ? "border-[#10130B] bg-[#DFFF00]"
                                        : "border-black/20 bg-white"
                                    }`}
                                  >
                                    {selected && (
                                      <Check
                                        size={
                                          14
                                        }
                                      />
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-bold">
                                      {
                                        employee.name
                                      }
                                    </div>

                                    <div className="mt-1 truncate text-xs text-[#68705D]">
                                      {
                                        employee.email
                                      }
                                    </div>
                                  </div>

                                  <div className="hidden shrink-0 text-right sm:block">
                                    <div
                                      className={`text-[11px] font-bold ${
                                        contract
                                          ? "text-emerald-600"
                                          : "text-red-500"
                                      }`}
                                    >
                                      {contract
                                        ? "Contract ✓"
                                        : "No Contract"}
                                    </div>

                                    <div
                                      className={`mt-1 text-[11px] font-bold ${
                                        structure
                                          ? "text-emerald-600"
                                          : "text-red-500"
                                      }`}
                                    >
                                      {structure
                                        ? "Structure ✓"
                                        : "No Structure"}
                                    </div>
                                  </div>
                                </button>
                              );
                            }
                          )}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-[#68705D]">
                    <span>
                      {
                        form
                          .employeeIds
                          .length
                      }{" "}
                      employee
                      {form.employeeIds
                        .length !==
                      1
                        ? "s"
                        : ""}{" "}
                      selected
                    </span>

                    <span>
                      Active employees:{" "}
                      {
                        employees.filter(
                          (
                            employee
                          ) =>
                            employee.status ===
                            "active"
                        ).length
                      }
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="rounded-2xl border border-[#DFFF00]/40 bg-[#DFFF00]/10 p-4">
                  <div className="flex gap-3">
                    <AlertCircle
                      size={18}
                      className="mt-0.5 shrink-0"
                    />

                    <div className="text-xs leading-5 text-[#4f553f]">
                      Each selected employee must have an active
                      contract covering the payroll period and an
                      active salary structure assigned to them.
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-black/[0.06] p-6 sm:flex-row sm:justify-end">
                <button
                  onClick={() =>
                    setShowCreate(
                      false
                    )
                  }
                  className="h-11 rounded-xl border border-black/[0.08] px-5 text-sm font-bold hover:bg-black/5"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    handleCreatePayRun
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#10130B] px-5 text-sm font-black text-white"
                >
                  <Plus size={17} />

                  Create Payrun
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedPayRun && (
        <PayRunDetailsModal
          payRun={
            selectedPayRun
          }
          employeeMap={
            employeeMap
          }
          contractMap={
            contractMap
          }
          structureMap={
            structureMap
          }
          canEdit={
            canEdit
          }
          canRemove={
            canRemove
          }
          processing={
            processingId ===
            selectedPayRun.id
          }
          role={role}
          onClose={() =>
            setSelectedPayRun(
              null
            )
          }
          onProcess={() =>
            handleProcessPayRun(
              selectedPayRun
            )
          }
          onReview={() =>
            handleMoveToReview(
              selectedPayRun
            )
          }
          onApprove={() =>
            handleApprove(
              selectedPayRun
            )
          }
          onLock={() =>
            handleLock(
              selectedPayRun
            )
          }
          onDelete={() =>
            handleDelete(
              selectedPayRun
            )
          }
        />
      )}
    </div>
  );
}

/* =========================================================
   Basic Salary Preview
========================================================= */

function calculateBasicSalaryPreview(
  employee: Employee,
  structure:
    | SalaryStructure
    | null,
  frequency: PayRun["frequency"]
) {
  if (structure) {
    const basicComponent =
      structure.components.find(
        (component) =>
          component.name
            .trim()
            .toLowerCase() ===
            "basic" &&
          component.type ===
            "earning"
      );

    if (basicComponent) {
      if (
        basicComponent.calculationType ===
        "fixed"
      ) {
        if (
          structure.frequency ===
          frequency
        ) {
          return basicComponent.value;
        }

        if (
          structure.frequency ===
          "yearly"
        ) {
          if (
            frequency ===
            "monthly"
          ) {
            return (
              basicComponent.value /
              12
            );
          }

          if (
            frequency ===
            "weekly"
          ) {
            return (
              basicComponent.value /
              52
            );
          }

          if (
            frequency ===
            "daily"
          ) {
            return (
              basicComponent.value /
              365
            );
          }
        }

        if (
          structure.frequency ===
          "monthly"
        ) {
          if (
            frequency ===
            "yearly"
          ) {
            return (
              basicComponent.value *
              12
            );
          }

          if (
            frequency ===
            "weekly"
          ) {
            return (
              (basicComponent.value *
                12) /
              52
            );
          }

          if (
            frequency ===
            "daily"
          ) {
            return (
              (basicComponent.value *
                12) /
              365
            );
          }
        }

        if (
          structure.frequency ===
          "weekly"
        ) {
          if (
            frequency ===
            "monthly"
          ) {
            return (
              (basicComponent.value *
                52) /
              12
            );
          }

          if (
            frequency ===
            "yearly"
          ) {
            return (
              basicComponent.value *
              52
            );
          }

          if (
            frequency ===
            "daily"
          ) {
            return (
              basicComponent.value /
              7
            );
          }
        }

        if (
          structure.frequency ===
          "daily"
        ) {
          if (
            frequency ===
            "monthly"
          ) {
            return (
              (basicComponent.value *
                365) /
              12
            );
          }

          if (
            frequency ===
            "weekly"
          ) {
            return (
              basicComponent.value *
              7
            );
          }

          if (
            frequency ===
            "yearly"
          ) {
            return (
              basicComponent.value *
              365
            );
          }
        }
      }
    }
  }

  /*
   * Fallback to employee basic salary.
   */
  const employeeBasis =
    employee.paymentBasis;

  if (
    employeeBasis ===
    frequency
  ) {
    return employee.basicSalary;
  }

  if (
    employeeBasis ===
    "monthly"
  ) {
    if (
      frequency ===
      "yearly"
    ) {
      return (
        employee.basicSalary *
        12
      );
    }

    if (
      frequency ===
      "weekly"
    ) {
      return (
        (employee.basicSalary *
          12) /
        52
      );
    }

    if (
      frequency ===
      "daily"
    ) {
      return (
        (employee.basicSalary *
          12) /
        365
      );
    }
  }

  if (
    employeeBasis ===
    "weekly"
  ) {
    if (
      frequency ===
      "monthly"
    ) {
      return (
        (employee.basicSalary *
          52) /
        12
      );
    }

    if (
      frequency ===
      "yearly"
    ) {
      return (
        employee.basicSalary *
        52
      );
    }

    if (
      frequency ===
      "daily"
    ) {
      return (
        employee.basicSalary /
        7
      );
    }
  }

  if (
    employeeBasis ===
    "daily"
  ) {
    if (
      frequency ===
      "monthly"
    ) {
      return (
        (employee.basicSalary *
          365) /
        12
      );
    }

    if (
      frequency ===
      "weekly"
    ) {
      return (
        employee.basicSalary *
        7
      );
    }

    if (
      frequency ===
      "yearly"
    ) {
      return (
        employee.basicSalary *
        365
      );
    }
  }

  return employee.basicSalary;
}

/* =========================================================
   Payrun Menu
========================================================= */

function PayRunMenu({
  payRun,
  canEdit,
  canRemove,
  processing,
  onView,
  onProcess,
  onReview,
  onApprove,
  onLock,
  onDelete,
  role,
}: {
  payRun: PayRun;
  canEdit: boolean;
  canRemove: boolean;
  processing: boolean;
  onView: () => void;
  onProcess: () => void;
  onReview: () => void;
  onApprove: () => void;
  onLock: () => void;
  onDelete: () => void;
  role: HRRole;
}) {
  return (
    <div className="absolute right-6 top-14 z-30 w-52 rounded-2xl border border-black/[0.07] bg-white p-2 text-left shadow-2xl">
      <MenuButton
        icon={Eye}
        label="View Details"
        onClick={onView}
      />

      {canEdit &&
        payRun.status ===
          "draft" && (
          <MenuButton
            icon={Play}
            label={
              processing
                ? "Processing..."
                : "Process Payroll"
            }
            disabled={
              processing
            }
            onClick={
              onProcess
            }
          />
        )}

      {canEdit &&
        payRun.status ===
          "processing" && (
          <MenuButton
            icon={Clock3}
            label="Move to Review"
            onClick={onReview}
          />
        )}

      {canEdit &&
        payRun.status ===
          "review" && (
          <MenuButton
            icon={Check}
            label="Approve Payrun"
            onClick={onApprove}
          />
        )}

      {role ===
        "HR_PAYROLL_MANAGER" &&
        payRun.status ===
          "approved" && (
          <MenuButton
            icon={Lock}
            label="Lock Payrun"
            onClick={onLock}
          />
        )}

      {canRemove &&
        payRun.status ===
          "draft" && (
          <MenuButton
            icon={Trash2}
            label="Delete"
            danger
            onClick={onDelete}
          />
        )}
    </div>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
  disabled = false,
}: {
  icon: typeof Eye;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "hover:bg-black/5"
      } ${
        disabled
          ? "cursor-not-allowed opacity-40"
          : ""
      }`}
    >
      <Icon size={16} />

      {label}
    </button>
  );
}

/* =========================================================
   Mobile Stat
========================================================= */

function MobileStat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-3 ${
        highlight
          ? "bg-[#DFFF00]/20"
          : "bg-black/[0.025]"
      }`}
    >
      <div className="text-[10px] uppercase tracking-wider text-[#68705D]">
        {label}
      </div>

      <div className="mt-1 text-sm font-black">
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   Date Input
========================================================= */

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-[#68705D]">
        {label}
      </label>

      <input
        type="date"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="h-11 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-sm outline-none focus:border-[#DFFF00] focus:ring-4 focus:ring-[#DFFF00]/15"
      />
    </div>
  );
}

/* =========================================================
   Details Modal
========================================================= */

function PayRunDetailsModal({
  payRun,
  employeeMap,
  contractMap,
  structureMap,
  canEdit,
  canRemove,
  processing,
  role,
  onClose,
  onProcess,
  onReview,
  onApprove,
  onLock,
  onDelete,
}: {
  payRun: PayRun;
  employeeMap: Map<
    string,
    Employee
  >;
  contractMap: Map<
    string,
    Contract
  >;
  structureMap: Map<
    string,
    SalaryStructure
  >;
  canEdit: boolean;
  canRemove: boolean;
  processing: boolean;
  role: HRRole;
  onClose: () => void;
  onProcess: () => void;
  onReview: () => void;
  onApprove: () => void;
  onLock: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/30 p-4 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center py-8">
        <div className="w-full max-w-5xl rounded-3xl border border-black/[0.07] bg-white/95 shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-black/[0.06] p-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DFFF00]">
                  <FileText
                    size={20}
                  />
                </div>

                <div>
                  <h2 className="text-xl font-black">
                    {payRun.name}
                  </h2>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#68705D]">
                    <span>
                      {payRun.id}
                    </span>

                    <span>
                      •
                    </span>

                    <span>
                      {frequencyLabel(
                        payRun.frequency
                      )}
                    </span>

                    <span>
                      •
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-1 font-bold ${statusClasses(
                        payRun.status
                      )}`}
                    >
                      {statusLabel(
                        payRun.status
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 hover:bg-black/5"
            >
              <X size={18} />
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-3 border-b border-black/[0.06] p-6 sm:grid-cols-3 lg:grid-cols-6">
            <SummaryItem
              label="Employees"
              value={String(
                payRun.employeeIds
                  .length
              )}
            />

            <SummaryItem
              label="Basic"
              value={formatCurrency(
                payRun.totalBasic
              )}
            />

            <SummaryItem
              label="Earnings"
              value={formatCurrency(
                payRun.totalEarnings
              )}
            />

            <SummaryItem
              label="Gross"
              value={formatCurrency(
                payRun.totalGross
              )}
            />

            <SummaryItem
              label="Deductions"
              value={formatCurrency(
                payRun.totalDeductions
              )}
            />

            <SummaryItem
              label="Net Pay"
              value={formatCurrency(
                payRun.totalNet
              )}
              highlight
            />
          </div>

          {/* Dates */}
          <div className="grid gap-4 border-b border-black/[0.06] p-6 sm:grid-cols-3">
            <InfoBox
              label="Period Start"
              value={formatDate(
                payRun.periodStart
              )}
            />

            <InfoBox
              label="Period End"
              value={formatDate(
                payRun.periodEnd
              )}
            />

            <InfoBox
              label="Payment Date"
              value={formatDate(
                payRun.paymentDate
              )}
            />
          </div>

          {/* Employee table */}
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-black">
                  Payroll Employees
                </h3>

                <p className="mt-1 text-xs text-[#68705D]">
                  Employee-level payroll calculation.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-black/[0.06]">
              {payRun.employees
                .length === 0 ? (
                <div className="p-8 text-center text-sm text-[#68705D]">
                  No employees in this payrun.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px]">
                    <thead>
                      <tr className="border-b border-black/[0.06] bg-black/[0.025] text-left text-[11px] uppercase tracking-wider text-[#68705D]">
                        <th className="px-4 py-3">
                          Employee
                        </th>

                        <th className="px-4 py-3">
                          Contract
                        </th>

                        <th className="px-4 py-3">
                          Structure
                        </th>

                        <th className="px-4 py-3">
                          Basic
                        </th>

                        <th className="px-4 py-3">
                          Earnings
                        </th>

                        <th className="px-4 py-3">
                          Deductions
                        </th>

                        <th className="px-4 py-3">
                          Gross
                        </th>

                        <th className="px-4 py-3">
                          Net
                        </th>

                        <th className="px-4 py-3">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {payRun.employees.map(
                        (
                          payrollEmployee
                        ) => {
                          const employee =
                            employeeMap.get(
                              payrollEmployee.employeeId
                            );

                          const contract =
                            contractMap.get(
                              payrollEmployee.contractId
                            );

                          const structure =
                            structureMap.get(
                              payrollEmployee.salaryStructureId
                            );

                          return (
                            <tr
                              key={
                                payrollEmployee.employeeId
                              }
                              className="border-b border-black/[0.045] last:border-0"
                            >
                              <td className="px-4 py-4">
                                <div className="font-bold">
                                  {
                                    payrollEmployee.employeeName
                                  }
                                </div>

                                <div className="mt-1 text-[11px] text-[#68705D]">
                                  {
                                    employee?.email
                                  }
                                </div>
                              </td>

                              <td className="px-4 py-4">
                                <div className="text-xs font-semibold">
                                  {contract
                                    ? contract.jobTitle
                                    : payrollEmployee.contractId ||
                                      "—"}
                                </div>

                                {contract && (
                                  <div className="mt-1 text-[10px] text-[#68705D]">
                                    {
                                      contract.id
                                    }
                                  </div>
                                )}
                              </td>

                              <td className="px-4 py-4">
                                <div className="text-xs font-semibold">
                                  {structure
                                    ? structure.name
                                    : payrollEmployee.salaryStructureId ||
                                      "—"}
                                </div>

                                {structure && (
                                  <div className="mt-1 text-[10px] text-[#68705D]">
                                    {
                                      structure.code
                                    }
                                  </div>
                                )}
                              </td>

                              <td className="px-4 py-4 text-xs font-semibold">
                                {formatCurrency(
                                  payrollEmployee.basicSalary
                                )}
                              </td>

                              <td className="px-4 py-4 text-xs font-semibold">
                                {formatCurrency(
                                  payrollEmployee.earnings
                                )}
                              </td>

                              <td className="px-4 py-4 text-xs font-semibold text-red-600">
                                {formatCurrency(
                                  payrollEmployee.deductions
                                )}
                              </td>

                              <td className="px-4 py-4 text-xs font-black">
                                {formatCurrency(
                                  payrollEmployee.grossSalary
                                )}
                              </td>

                              <td className="px-4 py-4 text-xs font-black">
                                {formatCurrency(
                                  payrollEmployee.netSalary
                                )}
                              </td>

                              <td className="px-4 py-4">
                                <span className="rounded-full bg-black/5 px-2.5 py-1 text-[10px] font-bold">
                                  {
                                    payrollEmployee.status
                                  }
                                </span>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Employer Cost */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <SummaryItem
                label="Employer Contributions"
                value={formatCurrency(
                  payRun.totalEmployerContributions
                )}
              />

              <SummaryItem
                label="Total Employer Cost"
                value={formatCurrency(
                  payRun.totalEmployerCost
                )}
                highlight
              />
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              {canRemove &&
                payRun.status ===
                  "draft" && (
                  <button
                    onClick={
                      onDelete
                    }
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-bold text-red-600 hover:bg-red-50"
                  >
                    <Trash2
                      size={16}
                    />

                    Delete
                  </button>
                )}

              {canEdit &&
                payRun.status ===
                  "draft" && (
                  <button
                    onClick={
                      onProcess
                    }
                    disabled={
                      processing
                    }
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#10130B] px-4 text-sm font-bold text-white disabled:opacity-40"
                  >
                    <Play
                      size={16}
                    />

                    {processing
                      ? "Processing..."
                      : "Process Payroll"}
                  </button>
                )}

              {canEdit &&
                payRun.status ===
                  "processing" && (
                  <button
                    onClick={
                      onReview
                    }
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#DFFF00] px-4 text-sm font-bold"
                  >
                    <Clock3
                      size={16}
                    />

                    Move to Review
                  </button>
                )}

              {canEdit &&
                payRun.status ===
                  "review" && (
                  <button
                    onClick={
                      onApprove
                    }
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#DFFF00] px-4 text-sm font-bold"
                  >
                    <Check
                      size={16}
                    />

                    Approve Payrun
                  </button>
                )}

              {role ===
                "HR_PAYROLL_MANAGER" &&
                payRun.status ===
                  "approved" && (
                  <button
                    onClick={
                      onLock
                    }
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#10130B] px-4 text-sm font-bold text-white"
                  >
                    <Lock
                      size={16}
                    />

                    Lock Payrun
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Summary Item
========================================================= */

function SummaryItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 ${
        highlight
          ? "bg-[#DFFF00]/25"
          : "bg-black/[0.025]"
      }`}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[#68705D]">
        {label}
      </div>

      <div className="mt-1 text-sm font-black">
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   Info Box
========================================================= */

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-black/[0.02] p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[#68705D]">
        {label}
      </div>

      <div className="mt-1 text-sm font-black">
        {value}
      </div>
    </div>
  );
}