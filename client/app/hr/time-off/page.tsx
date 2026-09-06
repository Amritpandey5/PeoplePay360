"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Edit3,
  Filter,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
  WalletCards,
  BriefcaseBusiness,
  RefreshCw,
} from "lucide-react";

import type {
  LeaveBalance,
  LeaveRequest,
  LeaveStatus,
  LeaveType,
} from "@/types/time-off";
import type { Employee } from "@/types/employee";

import {
  createLeaveRequest,
  createLeaveType,
  deleteLeaveType,
  getLeaveBalances,
  getLeaveRequests,
  getLeaveTypes,
  saveLeaveBalance,
  updateLeaveRequest,
  updateLeaveType,
} from "@/lib/time-off-storage";

import {
  getEmployees,
  subscribeToDataChanges,
} from "@/lib/employee-storage";

import {
  canApprove,
  canCreate,
  canDelete,
  canRefuse,
  canUpdate,
} from "@/lib/hr-permissions";

import type { HRRole } from "@/lib/hr-permissions";

import HRPageHeader from "@/components/hr/HRPageHeader";
import HRStatCard from "@/components/hr/HRStatCard";
import HRGlassCard from "@/components/hr/HRGlassCard";
import HREmptyState from "@/components/hr/HREmptyState";

type Tab = "requests" | "types" | "balances";

const ROLE: HRRole = "HR_MANAGER";

const statusConfig: Record<
  LeaveStatus,
  {
    label: string;
    className: string;
  }
> = {
  pending: {
    label: "Pending",
    className:
      "bg-amber-100 text-amber-800 border-amber-200",
  },
  approved: {
    label: "Approved",
    className:
      "bg-lime-100 text-lime-800 border-lime-200",
  },
  rejected: {
    label: "Rejected",
    className:
      "bg-red-100 text-red-700 border-red-200",
  },
  cancelled: {
    label: "Cancelled",
    className:
      "bg-gray-100 text-gray-700 border-gray-200",
  },
};

function formatDate(value?: string) {
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

function calculateDays(
  fromDate: string,
  toDate: string
) {
  if (!fromDate || !toDate) return 0;

  const from = new Date(`${fromDate}T00:00:00`);
  const to = new Date(`${toDate}T00:00:00`);

  if (
    Number.isNaN(from.getTime()) ||
    Number.isNaN(to.getTime()) ||
    to < from
  ) {
    return 0;
  }

  return (
    Math.floor(
      (to.getTime() - from.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1
  );
}

function getInitialRequestForm() {
  return {
    employeeId: "",
    leaveTypeId: "",
    fromDate: "",
    toDate: "",
    reason: "",
  };
}

function getInitialLeaveTypeForm() {
  return {
    name: "",
    code: "",
    description: "",
    isPaid: true,
    annualAllocation: 0,
    carryForward: false,
    maxConsecutiveDays: "",
    status: "active" as "active" | "inactive",
  };
}

export default function TimeOffPage() {
  const [activeTab, setActiveTab] =
    useState<Tab>("requests");

  const [employees, setEmployees] = useState<
    Employee[]
  >([]);

  const [requests, setRequests] = useState<
    LeaveRequest[]
  >([]);

  const [leaveTypes, setLeaveTypes] = useState<
    LeaveType[]
  >([]);

  const [balances, setBalances] = useState<
    LeaveBalance[]
  >([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<LeaveStatus | "all">("all");
  const [employeeFilter, setEmployeeFilter] =
    useState("all");
  const [leaveTypeFilter, setLeaveTypeFilter] =
    useState("all");

  const [showRequestModal, setShowRequestModal] =
    useState(false);

  const [showTypeModal, setShowTypeModal] =
    useState(false);

  const [editingTypeId, setEditingTypeId] =
    useState<string | null>(null);

  const [requestForm, setRequestForm] = useState(
    getInitialRequestForm()
  );

  const [leaveTypeForm, setLeaveTypeForm] =
    useState(getInitialLeaveTypeForm());

  const [reviewRequest, setReviewRequest] =
    useState<LeaveRequest | null>(null);

  const [rejectionReason, setRejectionReason] =
    useState("");

  const [deleteType, setDeleteType] =
    useState<LeaveType | null>(null);

  const [showFilters, setShowFilters] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadData = () => {
    try {
      setError("");

      const employeeData = getEmployees();
      const requestData = getLeaveRequests();
      const typeData = getLeaveTypes();
      const balanceData = getLeaveBalances();

      setEmployees(
        Array.isArray(employeeData)
          ? employeeData
          : []
      );

      setRequests(
        Array.isArray(requestData)
          ? requestData
          : []
      );

      setLeaveTypes(
        Array.isArray(typeData)
          ? typeData
          : []
      );

      setBalances(
        Array.isArray(balanceData)
          ? balanceData
          : []
      );
    } catch {
      setError(
        "Unable to load Time Off data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const unsubscribe =
      subscribeToDataChanges(() => {
        loadData();
      });

    return unsubscribe;
  }, []);

  const employeeMap = useMemo(() => {
    return new Map(
      employees.map((employee) => [
        employee.id,
        employee,
      ])
    );
  }, [employees]);

  const leaveTypeMap = useMemo(() => {
    return new Map(
      leaveTypes.map((type) => [
        type.id,
        type,
      ])
    );
  }, [leaveTypes]);

  const activeLeaveTypes = useMemo(
    () =>
      leaveTypes.filter(
        (type) => type.status === "active"
      ),
    [leaveTypes]
  );

  const filteredRequests = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return requests
      .filter((request) => {
        if (
          statusFilter !== "all" &&
          request.status !== statusFilter
        ) {
          return false;
        }

        if (
          employeeFilter !== "all" &&
          request.employeeId !== employeeFilter
        ) {
          return false;
        }

        if (
          leaveTypeFilter !== "all" &&
          request.leaveTypeId !== leaveTypeFilter
        ) {
          return false;
        }

        if (!query) return true;

        const employee =
          employeeMap.get(request.employeeId);

        const leaveType =
          leaveTypeMap.get(request.leaveTypeId);

        const searchable = [
          request.id,
          request.reason,
          request.status,
          employee?.name,
          employee?.email,
          leaveType?.name,
          leaveType?.code,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      })
      .sort(
        (a, b) =>
          new Date(b.requestedAt).getTime() -
          new Date(a.requestedAt).getTime()
      );
  }, [
    requests,
    search,
    statusFilter,
    employeeFilter,
    leaveTypeFilter,
    employeeMap,
    leaveTypeMap,
  ]);

  const pendingRequests = requests.filter(
    (request) =>
      request.status === "pending"
  ).length;

  const approvedRequests = requests.filter(
    (request) =>
      request.status === "approved"
  ).length;

  const rejectedRequests = requests.filter(
    (request) =>
      request.status === "rejected"
  ).length;

  const totalPendingDays = requests
    .filter(
      (request) =>
        request.status === "pending"
    )
    .reduce(
      (total, request) =>
        total + request.totalDays,
      0
    );

  const openCreateRequest = () => {
    setRequestForm(
      getInitialRequestForm()
    );
    setShowRequestModal(true);
  };

  const openCreateType = () => {
    setEditingTypeId(null);
    setLeaveTypeForm(
      getInitialLeaveTypeForm()
    );
    setShowTypeModal(true);
  };

  const openEditType = (
    leaveType: LeaveType
  ) => {
    setEditingTypeId(leaveType.id);

    setLeaveTypeForm({
      name: leaveType.name,
      code: leaveType.code,
      description: leaveType.description,
      isPaid: leaveType.isPaid,
      annualAllocation:
        leaveType.annualAllocation,
      carryForward:
        leaveType.carryForward,
      maxConsecutiveDays:
        leaveType.maxConsecutiveDays === null
          ? ""
          : String(
              leaveType.maxConsecutiveDays
            ),
      status: leaveType.status,
    });

    setShowTypeModal(true);
  };

  const handleCreateRequest = () => {
    if (
      !requestForm.employeeId ||
      !requestForm.leaveTypeId ||
      !requestForm.fromDate ||
      !requestForm.toDate
    ) {
      setError(
        "Please complete all required leave request fields."
      );
      return;
    }

    const totalDays = calculateDays(
      requestForm.fromDate,
      requestForm.toDate
    );

    if (totalDays <= 0) {
      setError(
        "Please select a valid date range."
      );
      return;
    }

    try {
      createLeaveRequest({
        employeeId:
          requestForm.employeeId,
        leaveTypeId:
          requestForm.leaveTypeId,
        fromDate:
          requestForm.fromDate,
        toDate:
          requestForm.toDate,
        totalDays,
        reason:
          requestForm.reason.trim(),
        status: "pending",
      });

      setShowRequestModal(false);
      setRequestForm(
        getInitialRequestForm()
      );
      loadData();
    } catch {
      setError(
        "Unable to create leave request."
      );
    }
  };

  const handleSaveLeaveType = () => {
    if (
      !leaveTypeForm.name.trim() ||
      !leaveTypeForm.code.trim()
    ) {
      setError(
        "Leave type name and code are required."
      );
      return;
    }

    const annualAllocation = Number(
      leaveTypeForm.annualAllocation
    );

    if (
      Number.isNaN(annualAllocation) ||
      annualAllocation < 0
    ) {
      setError(
        "Annual allocation must be a valid number."
      );
      return;
    }

    const maxConsecutiveDays =
      leaveTypeForm.maxConsecutiveDays === ""
        ? null
        : Number(
            leaveTypeForm.maxConsecutiveDays
          );

    if (
      maxConsecutiveDays !== null &&
      (Number.isNaN(maxConsecutiveDays) ||
        maxConsecutiveDays <= 0)
    ) {
      setError(
        "Maximum consecutive days must be greater than zero."
      );
      return;
    }

    try {
      const payload = {
        name: leaveTypeForm.name.trim(),
        code: leaveTypeForm.code
          .trim()
          .toUpperCase(),
        description:
          leaveTypeForm.description.trim(),
        isPaid: leaveTypeForm.isPaid,
        annualAllocation,
        carryForward:
          leaveTypeForm.carryForward,
        maxConsecutiveDays,
        status: leaveTypeForm.status,
      };

      if (editingTypeId) {
        updateLeaveType(
          editingTypeId,
          payload
        );
      } else {
        createLeaveType(payload);
      }

      setShowTypeModal(false);
      setEditingTypeId(null);
      setLeaveTypeForm(
        getInitialLeaveTypeForm()
      );
      loadData();
    } catch {
      setError(
        "Unable to save leave type."
      );
    }
  };

  const handleDeleteLeaveType = () => {
    if (!deleteType) return;

    try {
      deleteLeaveType(deleteType.id);
      setDeleteType(null);
      loadData();
    } catch {
      setError(
        "Unable to delete leave type."
      );
    }
  };

  const approveRequest = (
    request: LeaveRequest
  ) => {
    if (!canApprove(ROLE, "timeOff")) {
      return;
    }

    try {
      updateLeaveRequest(
        request.id,
        {
          status: "approved",
          reviewedAt:
            new Date().toISOString(),
          reviewedBy: "HR Manager",
          rejectionReason: undefined,
        }
      );

      loadData();
    } catch {
      setError(
        "Unable to approve request."
      );
    }
  };

  const openRejectModal = (
    request: LeaveRequest
  ) => {
    setReviewRequest(request);
    setRejectionReason("");
  };

  const rejectRequest = () => {
    if (!reviewRequest) return;

    if (
      !canRefuse(ROLE, "timeOff")
    ) {
      return;
    }

    try {
      updateLeaveRequest(
        reviewRequest.id,
        {
          status: "rejected",
          reviewedAt:
            new Date().toISOString(),
          reviewedBy: "HR Manager",
          rejectionReason:
            rejectionReason.trim() ||
            undefined,
        }
      );

      setReviewRequest(null);
      setRejectionReason("");
      loadData();
    } catch {
      setError(
        "Unable to reject request."
      );
    }
  };

  const deleteRequest = (
    request: LeaveRequest
  ) => {
    if (!canDelete(ROLE, "timeOff")) {
      return;
    }

    try {
      const remaining =
        requests.filter(
          (item) =>
            item.id !== request.id
        );

      localStorage.setItem(
        "peoplepay360_leave_requests",
        JSON.stringify(remaining)
      );

      window.dispatchEvent(
        new Event(
          "peoplepay360-leave-requests-updated"
        )
      );

      loadData();
    } catch {
      setError(
        "Unable to delete leave request."
      );
    }
  };

  const initializeBalance = (
    employeeId: string,
    leaveType: LeaveType
  ) => {
    const year =
      new Date().getFullYear();

    const existing = balances.find(
      (balance) =>
        balance.employeeId ===
          employeeId &&
        balance.leaveTypeId ===
          leaveType.id &&
        balance.year === year
    );

    if (existing) return;

    saveLeaveBalance({
      id: `LB-${employeeId}-${leaveType.id}-${year}`,
      employeeId,
      leaveTypeId: leaveType.id,
      allocatedDays:
        leaveType.annualAllocation,
      usedDays: 0,
      pendingDays: 0,
      remainingDays:
        leaveType.annualAllocation,
      year,
    });
  };

  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <HRPageHeader
          title="Time Off"
          description="Manage leave requests, leave types and employee balances."
          action={
            activeTab === "requests" &&
            canCreate(ROLE, "timeOff")
              ? {
                  label: "New Request",
                  onClick:
                    openCreateRequest,
                  icon: Plus,
                }
              : activeTab === "types" &&
                canCreate(
                  ROLE,
                  "timeOff"
                )
              ? {
                  label: "New Leave Type",
                  onClick:
                    openCreateType,
                  icon: Plus,
                }
              : undefined
          }
        />

        {error && (
          <div className="mb-5 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 hover:bg-red-100"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <HRStatCard
            title="Total Requests"
            value={requests.length}
            icon={CalendarDays}
          />

          <HRStatCard
            title="Pending"
            value={pendingRequests}
            icon={Clock3}
          />

          <HRStatCard
            title="Approved"
            value={approvedRequests}
            icon={Check}
          />

          <HRStatCard
            title="Pending Days"
            value={totalPendingDays}
            icon={WalletCards}
          />
        </div>

        <div className="mt-6">
          <HRGlassCard className="overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-black/[0.06] p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["requests", "Leave Requests"],
                    ["types", "Leave Types"],
                    ["balances", "Balances"],
                  ] as const
                ).map(
                  ([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setActiveTab(value)
                      }
                      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                        activeTab === value
                          ? "bg-[#DFFF00] text-[#10130B] shadow-[0_8px_25px_rgba(223,255,0,0.25)]"
                          : "bg-black/[0.035] text-[#68705D] hover:bg-black/[0.06]"
                      }`}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>

              {activeTab === "requests" && (
                <button
                  type="button"
                  onClick={() =>
                    setShowFilters(
                      !showFilters
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/[0.07] bg-white/70 px-4 py-2.5 text-sm font-semibold text-[#10130B] transition hover:bg-white"
                >
                  <Filter size={16} />
                  Filters
                  <ChevronDown
                    size={15}
                    className={
                      showFilters
                        ? "rotate-180 transition"
                        : "transition"
                    }
                  />
                </button>
              )}
            </div>

            {activeTab === "requests" && (
              <>
                <div className="border-b border-black/[0.06] p-4">
                  <div className="flex flex-col gap-3 lg:flex-row">
                    <div className="relative flex-1">
                      <Search
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#68705D]"
                      />

                      <input
                        value={search}
                        onChange={(event) =>
                          setSearch(
                            event.target.value
                          )
                        }
                        placeholder="Search employee, leave type, reason..."
                        className="h-11 w-full rounded-xl border border-black/[0.07] bg-white/70 pl-10 pr-4 text-sm outline-none transition placeholder:text-[#9AA091] focus:border-[#B7FF00] focus:ring-4 focus:ring-[#DFFF00]/15"
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(event) =>
                        setStatusFilter(
                          event.target
                            .value as
                            | LeaveStatus
                            | "all"
                        )
                      }
                      className="h-11 rounded-xl border border-black/[0.07] bg-white/70 px-3 text-sm outline-none focus:border-[#B7FF00]"
                    >
                      <option value="all">
                        All Statuses
                      </option>
                      <option value="pending">
                        Pending
                      </option>
                      <option value="approved">
                        Approved
                      </option>
                      <option value="rejected">
                        Rejected
                      </option>
                      <option value="cancelled">
                        Cancelled
                      </option>
                    </select>
                  </div>

                  {showFilters && (
                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                      <select
                        value={
                          employeeFilter
                        }
                        onChange={(event) =>
                          setEmployeeFilter(
                            event.target
                              .value
                          )
                        }
                        className="h-11 rounded-xl border border-black/[0.07] bg-white/70 px-3 text-sm outline-none focus:border-[#B7FF00]"
                      >
                        <option value="all">
                          All Employees
                        </option>

                        {employees.map(
                          (employee) => (
                            <option
                              key={
                                employee.id
                              }
                              value={
                                employee.id
                              }
                            >
                              {employee.name}
                            </option>
                          )
                        )}
                      </select>

                      <select
                        value={
                          leaveTypeFilter
                        }
                        onChange={(event) =>
                          setLeaveTypeFilter(
                            event.target
                              .value
                          )
                        }
                        className="h-11 rounded-xl border border-black/[0.07] bg-white/70 px-3 text-sm outline-none focus:border-[#B7FF00]"
                      >
                        <option value="all">
                          All Leave Types
                        </option>

                        {leaveTypes.map(
                          (type) => (
                            <option
                              key={type.id}
                              value={
                                type.id
                              }
                            >
                              {type.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  )}
                </div>

                {loading ? (
                  <div className="flex min-h-[300px] items-center justify-center">
                    <RefreshCw
                      className="animate-spin text-[#68705D]"
                    />
                  </div>
                ) : filteredRequests.length ===
                  0 ? (
                  <div className="p-6">
                    <HREmptyState
                      title="No leave requests"
                      description={
                        requests.length ===
                        0
                          ? "No leave requests have been created yet."
                          : "No requests match your current filters."
                      }
                      action={
                        requests.length ===
                          0 &&
                        canCreate(
                          ROLE,
                          "timeOff"
                        )
                          ? {
                              label:
                                "Create Request",
                              onClick:
                                openCreateRequest,
                            }
                          : undefined
                      }
                    />
                  </div>
                ) : (
                  <>
                    <div className="hidden overflow-x-auto lg:block">
                      <table className="w-full min-w-[1100px] text-left">
                        <thead>
                          <tr className="border-b border-black/[0.06] bg-black/[0.015] text-xs uppercase tracking-wider text-[#68705D]">
                            <th className="px-5 py-4">
                              Employee
                            </th>
                            <th className="px-5 py-4">
                              Leave Type
                            </th>
                            <th className="px-5 py-4">
                              Duration
                            </th>
                            <th className="px-5 py-4">
                              Days
                            </th>
                            <th className="px-5 py-4">
                              Reason
                            </th>
                            <th className="px-5 py-4">
                              Status
                            </th>
                            <th className="px-5 py-4 text-right">
                              Actions
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredRequests.map(
                            (request) => {
                              const employee =
                                employeeMap.get(
                                  request.employeeId
                                );

                              const type =
                                leaveTypeMap.get(
                                  request.leaveTypeId
                                );

                              const status =
                                statusConfig[
                                  request
                                    .status
                                ];

                              return (
                                <tr
                                  key={
                                    request.id
                                  }
                                  className="border-b border-black/[0.045] transition hover:bg-[#DFFF00]/[0.045]"
                                >
                                  <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DFFF00]/30">
                                        <UserRound
                                          size={17}
                                        />
                                      </div>

                                      <div>
                                        <p className="font-semibold text-[#10130B]">
                                          {employee?.name ||
                                            "Unknown employee"}
                                        </p>
                                        <p className="text-xs text-[#68705D]">
                                          {employee?.email ||
                                            request.employeeId}
                                        </p>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="px-5 py-4">
                                    <div>
                                      <p className="font-semibold">
                                        {type?.name ||
                                          "Unknown"}
                                      </p>
                                      <p className="text-xs text-[#68705D]">
                                        {type?.code ||
                                          "—"}
                                      </p>
                                    </div>
                                  </td>

                                  <td className="px-5 py-4 text-sm">
                                    <p>
                                      {formatDate(
                                        request.fromDate
                                      )}
                                    </p>
                                    <p className="text-xs text-[#68705D]">
                                      to{" "}
                                      {formatDate(
                                        request.toDate
                                      )}
                                    </p>
                                  </td>

                                  <td className="px-5 py-4">
                                    <span className="font-bold">
                                      {
                                        request.totalDays
                                      }
                                    </span>
                                  </td>

                                  <td className="max-w-[220px] px-5 py-4">
                                    <p className="truncate text-sm text-[#68705D]">
                                      {request.reason ||
                                        "No reason provided"}
                                    </p>
                                  </td>

                                  <td className="px-5 py-4">
                                    <span
                                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}
                                    >
                                      {
                                        status.label
                                      }
                                    </span>
                                  </td>

                                  <td className="px-5 py-4">
                                    <div className="flex justify-end gap-2">
                                      {request.status ===
                                        "pending" &&
                                        canApprove(
                                          ROLE,
                                          "timeOff"
                                        ) && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              approveRequest(
                                                request
                                              )
                                            }
                                            title="Approve"
                                            className="rounded-lg bg-[#DFFF00] p-2 text-[#10130B] transition hover:scale-105"
                                          >
                                            <Check
                                              size={
                                                15
                                              }
                                            />
                                          </button>
                                        )}

                                      {request.status ===
                                        "pending" &&
                                        canRefuse(
                                          ROLE,
                                          "timeOff"
                                        ) && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              openRejectModal(
                                                request
                                              )
                                            }
                                            title="Reject"
                                            className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                                          >
                                            <X
                                              size={
                                                15
                                              }
                                            />
                                          </button>
                                        )}

                                      {canDelete(
                                        ROLE,
                                        "timeOff"
                                      ) && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            deleteRequest(
                                              request
                                            )
                                          }
                                          title="Delete"
                                          className="rounded-lg bg-black/[0.04] p-2 text-[#68705D] transition hover:bg-red-50 hover:text-red-600"
                                        >
                                          <Trash2
                                            size={
                                              15
                                            }
                                          />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="space-y-3 p-4 lg:hidden">
                      {filteredRequests.map(
                        (request) => {
                          const employee =
                            employeeMap.get(
                              request.employeeId
                            );

                          const type =
                            leaveTypeMap.get(
                              request.leaveTypeId
                            );

                          const status =
                            statusConfig[
                              request.status
                            ];

                          return (
                            <div
                              key={
                                request.id
                              }
                              className="rounded-2xl border border-black/[0.06] bg-white/60 p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DFFF00]/30">
                                    <UserRound
                                      size={17}
                                    />
                                  </div>

                                  <div>
                                    <p className="font-semibold">
                                      {employee?.name ||
                                        "Unknown employee"}
                                    </p>

                                    <p className="text-xs text-[#68705D]">
                                      {type?.name ||
                                        "Unknown leave type"}
                                    </p>
                                  </div>
                                </div>

                                <span
                                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}
                                >
                                  {
                                    status.label
                                  }
                                </span>
                              </div>

                              <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="rounded-xl bg-black/[0.025] p-3">
                                  <p className="text-[11px] uppercase tracking-wide text-[#68705D]">
                                    From
                                  </p>
                                  <p className="mt-1 text-sm font-semibold">
                                    {formatDate(
                                      request.fromDate
                                    )}
                                  </p>
                                </div>

                                <div className="rounded-xl bg-black/[0.025] p-3">
                                  <p className="text-[11px] uppercase tracking-wide text-[#68705D]">
                                    To
                                  </p>
                                  <p className="mt-1 text-sm font-semibold">
                                    {formatDate(
                                      request.toDate
                                    )}
                                  </p>
                                </div>

                                <div className="rounded-xl bg-black/[0.025] p-3">
                                  <p className="text-[11px] uppercase tracking-wide text-[#68705D]">
                                    Days
                                  </p>
                                  <p className="mt-1 text-sm font-bold">
                                    {
                                      request.totalDays
                                    }
                                  </p>
                                </div>

                                <div className="rounded-xl bg-black/[0.025] p-3">
                                  <p className="text-[11px] uppercase tracking-wide text-[#68705D]">
                                    Requested
                                  </p>
                                  <p className="mt-1 text-sm font-semibold">
                                    {formatDate(
                                      request.requestedAt
                                    )}
                                  </p>
                                </div>
                              </div>

                              {request.reason && (
                                <div className="mt-3 rounded-xl bg-black/[0.025] p-3">
                                  <p className="text-[11px] uppercase tracking-wide text-[#68705D]">
                                    Reason
                                  </p>
                                  <p className="mt-1 text-sm text-[#10130B]">
                                    {
                                      request.reason
                                    }
                                  </p>
                                </div>
                              )}

                              {request.status ===
                                "rejected" &&
                                request.rejectionReason && (
                                  <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                                    <p className="font-semibold">
                                      Rejection reason
                                    </p>
                                    <p className="mt-1">
                                      {
                                        request.rejectionReason
                                      }
                                    </p>
                                  </div>
                                )}

                              <div className="mt-4 flex gap-2">
                                {request.status ===
                                  "pending" &&
                                  canApprove(
                                    ROLE,
                                    "timeOff"
                                  ) && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        approveRequest(
                                          request
                                        )
                                      }
                                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#DFFF00] px-3 py-2.5 text-sm font-bold"
                                    >
                                      <Check
                                        size={
                                          16
                                        }
                                      />
                                      Approve
                                    </button>
                                  )}

                                {request.status ===
                                  "pending" &&
                                  canRefuse(
                                    ROLE,
                                    "timeOff"
                                  ) && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        openRejectModal(
                                          request
                                        )
                                      }
                                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-bold text-red-600"
                                    >
                                      <X
                                        size={
                                          16
                                        }
                                      />
                                      Reject
                                    </button>
                                  )}

                                {canDelete(
                                  ROLE,
                                  "timeOff"
                                ) && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      deleteRequest(
                                        request
                                      )
                                    }
                                    className="rounded-xl bg-black/[0.04] px-3 py-2.5 text-[#68705D]"
                                  >
                                    <Trash2
                                      size={
                                        16
                                      }
                                    />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            {activeTab === "types" && (
              <div className="p-4">
                {leaveTypes.length === 0 ? (
                  <HREmptyState
                    title="No leave types"
                    description="Create your first leave type to start managing employee time off."
                    action={
                      canCreate(
                        ROLE,
                        "timeOff"
                      )
                        ? {
                            label:
                              "Create Leave Type",
                            onClick:
                              openCreateType,
                          }
                        : undefined
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {leaveTypes.map(
                      (type) => (
                        <div
                          key={type.id}
                          className="group rounded-2xl border border-black/[0.06] bg-white/60 p-5 transition hover:-translate-y-0.5 hover:shadow-[0_15px_40px_rgba(16,19,11,0.06)]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold">
                                  {type.name}
                                </h3>

                                <span className="rounded-md bg-[#DFFF00]/50 px-2 py-0.5 text-[10px] font-bold">
                                  {type.code}
                                </span>
                              </div>

                              <p className="mt-1 text-xs text-[#68705D]">
                                {type.description ||
                                  "No description"}
                              </p>
                            </div>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                type.status ===
                                "active"
                                  ? "bg-lime-100 text-lime-800"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {type.status}
                            </span>
                          </div>

                          <div className="mt-5 grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-black/[0.025] p-3">
                              <p className="text-[10px] uppercase tracking-wide text-[#68705D]">
                                Allocation
                              </p>
                              <p className="mt-1 text-lg font-bold">
                                {
                                  type.annualAllocation
                                }{" "}
                                <span className="text-xs font-medium text-[#68705D]">
                                  days
                                </span>
                              </p>
                            </div>

                            <div className="rounded-xl bg-black/[0.025] p-3">
                              <p className="text-[10px] uppercase tracking-wide text-[#68705D]">
                                Paid
                              </p>
                              <p className="mt-1 text-lg font-bold">
                                {type.isPaid
                                  ? "Yes"
                                  : "No"}
                              </p>
                            </div>

                            <div className="rounded-xl bg-black/[0.025] p-3">
                              <p className="text-[10px] uppercase tracking-wide text-[#68705D]">
                                Carry Forward
                              </p>
                              <p className="mt-1 text-sm font-bold">
                                {type.carryForward
                                  ? "Enabled"
                                  : "Disabled"}
                              </p>
                            </div>

                            <div className="rounded-xl bg-black/[0.025] p-3">
                              <p className="text-[10px] uppercase tracking-wide text-[#68705D]">
                                Max Consecutive
                              </p>
                              <p className="mt-1 text-sm font-bold">
                                {type.maxConsecutiveDays ??
                                  "Unlimited"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 flex gap-2 border-t border-black/[0.05] pt-4">
                            {canUpdate(
                              ROLE,
                              "timeOff"
                            ) && (
                              <button
                                type="button"
                                onClick={() =>
                                  openEditType(
                                    type
                                  )
                                }
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black/[0.035] px-3 py-2.5 text-sm font-semibold hover:bg-black/[0.06]"
                              >
                                <Edit3
                                  size={15}
                                />
                                Edit
                              </button>
                            )}

                            {canDelete(
                              ROLE,
                              "timeOff"
                            ) && (
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteType(
                                    type
                                  )
                                }
                                className="rounded-xl bg-red-50 px-3 py-2.5 text-red-600 hover:bg-red-100"
                              >
                                <Trash2
                                  size={15}
                                />
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "balances" && (
              <div className="p-4">
                {balances.length === 0 ? (
                  <HREmptyState
                    title="No leave balances"
                    description="Leave balances will appear here when they are created for employees."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] text-left">
                      <thead>
                        <tr className="border-b border-black/[0.06] text-xs uppercase tracking-wider text-[#68705D]">
                          <th className="px-4 py-4">
                            Employee
                          </th>
                          <th className="px-4 py-4">
                            Leave Type
                          </th>
                          <th className="px-4 py-4">
                            Year
                          </th>
                          <th className="px-4 py-4">
                            Allocated
                          </th>
                          <th className="px-4 py-4">
                            Used
                          </th>
                          <th className="px-4 py-4">
                            Pending
                          </th>
                          <th className="px-4 py-4">
                            Remaining
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {balances.map(
                          (balance) => {
                            const employee =
                              employeeMap.get(
                                balance.employeeId
                              );

                            const type =
                              leaveTypeMap.get(
                                balance.leaveTypeId
                              );

                            return (
                              <tr
                                key={
                                  balance.id
                                }
                                className="border-b border-black/[0.045] hover:bg-black/[0.015]"
                              >
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#DFFF00]/30">
                                      <UserRound
                                        size={
                                          15
                                        }
                                      />
                                    </div>
                                    <span className="font-semibold">
                                      {employee?.name ||
                                        "Unknown"}
                                    </span>
                                  </div>
                                </td>

                                <td className="px-4 py-4">
                                  <span className="font-medium">
                                    {type?.name ||
                                      "Unknown"}
                                  </span>
                                </td>

                                <td className="px-4 py-4 text-sm">
                                  {balance.year}
                                </td>

                                <td className="px-4 py-4 font-semibold">
                                  {
                                    balance.allocatedDays
                                  }
                                </td>

                                <td className="px-4 py-4">
                                  {
                                    balance.usedDays
                                  }
                                </td>

                                <td className="px-4 py-4">
                                  {
                                    balance.pendingDays
                                  }
                                </td>

                                <td className="px-4 py-4">
                                  <span className="rounded-lg bg-[#DFFF00]/40 px-2.5 py-1 font-bold">
                                    {
                                      balance.remainingDays
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
            )}
          </HRGlassCard>
        </div>
      </div>

      {/* CREATE LEAVE REQUEST MODAL */}
      {showRequestModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#10130B]/30 p-4 backdrop-blur-md">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/70 bg-[#F7F7F2]/95 p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#68705D]">
                  Time Off
                </p>
                <h2 className="mt-1 text-2xl font-black">
                  New Leave Request
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowRequestModal(false)
                }
                className="rounded-xl bg-black/[0.04] p-2 hover:bg-black/[0.08]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Employee *
                </span>

                <select
                  value={
                    requestForm.employeeId
                  }
                  onChange={(event) =>
                    setRequestForm(
                      (current) => ({
                        ...current,
                        employeeId:
                          event.target
                            .value,
                      })
                    )
                  }
                  className="h-12 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-sm outline-none focus:border-[#B7FF00] focus:ring-4 focus:ring-[#DFFF00]/15"
                >
                  <option value="">
                    Select employee
                  </option>

                  {employees.map(
                    (employee) => (
                      <option
                        key={
                          employee.id
                        }
                        value={
                          employee.id
                        }
                      >
                        {employee.name}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Leave Type *
                </span>

                <select
                  value={
                    requestForm.leaveTypeId
                  }
                  onChange={(event) =>
                    setRequestForm(
                      (current) => ({
                        ...current,
                        leaveTypeId:
                          event.target
                            .value,
                      })
                    )
                  }
                  className="h-12 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-sm outline-none focus:border-[#B7FF00] focus:ring-4 focus:ring-[#DFFF00]/15"
                >
                  <option value="">
                    Select leave type
                  </option>

                  {activeLeaveTypes.map(
                    (type) => (
                      <option
                        key={type.id}
                        value={
                          type.id
                        }
                      >
                        {type.name}
                        {type.isPaid
                          ? " · Paid"
                          : " · Unpaid"}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  From Date *
                </span>

                <input
                  type="date"
                  value={
                    requestForm.fromDate
                  }
                  onChange={(event) =>
                    setRequestForm(
                      (current) => ({
                        ...current,
                        fromDate:
                          event.target
                            .value,
                      })
                    )
                  }
                  className="h-12 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-sm outline-none focus:border-[#B7FF00] focus:ring-4 focus:ring-[#DFFF00]/15"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  To Date *
                </span>

                <input
                  type="date"
                  min={
                    requestForm.fromDate ||
                    undefined
                  }
                  value={
                    requestForm.toDate
                  }
                  onChange={(event) =>
                    setRequestForm(
                      (current) => ({
                        ...current,
                        toDate:
                          event.target
                            .value,
                      })
                    )
                  }
                  className="h-12 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-sm outline-none focus:border-[#B7FF00] focus:ring-4 focus:ring-[#DFFF00]/15"
                />
              </label>

              <div className="rounded-xl bg-[#DFFF00]/30 p-4 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    Total Days
                  </span>

                  <span className="text-2xl font-black">
                    {calculateDays(
                      requestForm.fromDate,
                      requestForm.toDate
                    )}
                  </span>
                </div>
              </div>

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold">
                  Reason
                </span>

                <textarea
                  value={
                    requestForm.reason
                  }
                  onChange={(event) =>
                    setRequestForm(
                      (current) => ({
                        ...current,
                        reason:
                          event.target
                            .value,
                      })
                    )
                  }
                  rows={4}
                  placeholder="Enter reason for leave..."
                  className="w-full resize-none rounded-xl border border-black/[0.08] bg-white px-3 py-3 text-sm outline-none focus:border-[#B7FF00] focus:ring-4 focus:ring-[#DFFF00]/15"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setShowRequestModal(false)
                }
                className="rounded-xl border border-black/[0.07] px-5 py-3 text-sm font-semibold hover:bg-black/[0.04]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleCreateRequest
                }
                className="rounded-xl bg-[#DFFF00] px-5 py-3 text-sm font-black shadow-[0_8px_25px_rgba(223,255,0,0.25)] hover:brightness-95"
              >
                Create Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEAVE TYPE MODAL */}
      {showTypeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#10130B]/30 p-4 backdrop-blur-md">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/70 bg-[#F7F7F2]/95 p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#68705D]">
                  Configuration
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  {editingTypeId
                    ? "Edit Leave Type"
                    : "New Leave Type"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowTypeModal(false)
                }
                className="rounded-xl bg-black/[0.04] p-2"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-semibold">
                  Name *
                </span>

                <input
                  value={
                    leaveTypeForm.name
                  }
                  onChange={(event) =>
                    setLeaveTypeForm(
                      (current) => ({
                        ...current,
                        name: event.target
                          .value,
                      })
                    )
                  }
                  placeholder="Annual Leave"
                  className="h-12 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-sm outline-none focus:border-[#B7FF00]"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold">
                  Code *
                </span>

                <input
                  value={
                    leaveTypeForm.code
                  }
                  onChange={(event) =>
                    setLeaveTypeForm(
                      (current) => ({
                        ...current,
                        code: event.target
                          .value
                          .toUpperCase(),
                      })
                    )
                  }
                  placeholder="AL"
                  className="h-12 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-sm uppercase outline-none focus:border-[#B7FF00]"
                />
              </label>

              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold">
                  Description
                </span>

                <textarea
                  value={
                    leaveTypeForm.description
                  }
                  onChange={(event) =>
                    setLeaveTypeForm(
                      (current) => ({
                        ...current,
                        description:
                          event.target
                            .value,
                      })
                    )
                  }
                  rows={3}
                  placeholder="Describe this leave type..."
                  className="w-full resize-none rounded-xl border border-black/[0.08] bg-white px-3 py-3 text-sm outline-none focus:border-[#B7FF00]"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold">
                  Annual Allocation
                </span>

                <input
                  type="number"
                  min="0"
                  value={
                    leaveTypeForm.annualAllocation
                  }
                  onChange={(event) =>
                    setLeaveTypeForm(
                      (current) => ({
                        ...current,
                        annualAllocation:
                          Number(
                            event.target
                              .value
                          ),
                      })
                    )
                  }
                  className="h-12 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-sm outline-none focus:border-[#B7FF00]"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold">
                  Max Consecutive Days
                </span>

                <input
                  type="number"
                  min="1"
                  value={
                    leaveTypeForm.maxConsecutiveDays
                  }
                  onChange={(event) =>
                    setLeaveTypeForm(
                      (current) => ({
                        ...current,
                        maxConsecutiveDays:
                          event.target
                            .value,
                      })
                    )
                  }
                  placeholder="Unlimited"
                  className="h-12 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-sm outline-none focus:border-[#B7FF00]"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-black/[0.07] bg-white/70 p-4">
                <div>
                  <p className="text-sm font-semibold">
                    Paid Leave
                  </p>
                  <p className="text-xs text-[#68705D]">
                    Salary continues during leave
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={
                    leaveTypeForm.isPaid
                  }
                  onChange={(event) =>
                    setLeaveTypeForm(
                      (current) => ({
                        ...current,
                        isPaid:
                          event.target
                            .checked,
                      })
                    )
                  }
                  className="h-5 w-5 accent-[#DFFF00]"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-black/[0.07] bg-white/70 p-4">
                <div>
                  <p className="text-sm font-semibold">
                    Carry Forward
                  </p>
                  <p className="text-xs text-[#68705D]">
                    Allow unused days to carry forward
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={
                    leaveTypeForm.carryForward
                  }
                  onChange={(event) =>
                    setLeaveTypeForm(
                      (current) => ({
                        ...current,
                        carryForward:
                          event.target
                            .checked,
                      })
                    )
                  }
                  className="h-5 w-5 accent-[#DFFF00]"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold">
                  Status
                </span>

                <select
                  value={
                    leaveTypeForm.status
                  }
                  onChange={(event) =>
                    setLeaveTypeForm(
                      (current) => ({
                        ...current,
                        status: event.target
                          .value as
                          | "active"
                          | "inactive",
                      })
                    )
                  }
                  className="h-12 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-sm outline-none focus:border-[#B7FF00]"
                >
                  <option value="active">
                    Active
                  </option>
                  <option value="inactive">
                    Inactive
                  </option>
                </select>
              </label>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setShowTypeModal(false)
                }
                className="rounded-xl border border-black/[0.07] px-5 py-3 text-sm font-semibold hover:bg-black/[0.04]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleSaveLeaveType
                }
                className="rounded-xl bg-[#DFFF00] px-5 py-3 text-sm font-black shadow-[0_8px_25px_rgba(223,255,0,0.25)]"
              >
                {editingTypeId
                  ? "Save Changes"
                  : "Create Leave Type"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {reviewRequest && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#10130B]/30 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-white/70 bg-[#F7F7F2]/95 p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-500">
                  Review Request
                </p>

                <h2 className="mt-1 text-xl font-black">
                  Reject Leave Request
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setReviewRequest(null)
                }
                className="rounded-xl bg-black/[0.04] p-2"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 rounded-2xl bg-black/[0.025] p-4">
              <p className="font-semibold">
                {employeeMap.get(
                  reviewRequest.employeeId
                )?.name ||
                  "Unknown employee"}
              </p>

              <p className="mt-1 text-sm text-[#68705D]">
                {leaveTypeMap.get(
                  reviewRequest.leaveTypeId
                )?.name ||
                  "Unknown leave type"}{" "}
                ·{" "}
                {
                  reviewRequest.totalDays
                }{" "}
                days
              </p>
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold">
                Rejection Reason
              </span>

              <textarea
                value={
                  rejectionReason
                }
                onChange={(event) =>
                  setRejectionReason(
                    event.target.value
                  )
                }
                rows={4}
                placeholder="Enter reason for rejecting this request..."
                className="w-full resize-none rounded-xl border border-black/[0.08] bg-white px-3 py-3 text-sm outline-none focus:border-red-300 focus:ring-4 focus:ring-red-100"
              />
            </label>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setReviewRequest(null)
                }
                className="flex-1 rounded-xl border border-black/[0.07] px-4 py-3 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={rejectRequest}
                className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-bold text-white hover:bg-red-600"
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE LEAVE TYPE MODAL */}
      {deleteType && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#10130B]/30 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-white/70 bg-[#F7F7F2]/95 p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Trash2 size={20} />
            </div>

            <h2 className="mt-4 text-xl font-black">
              Delete Leave Type?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#68705D]">
              You are about to delete{" "}
              <span className="font-bold text-[#10130B]">
                {deleteType.name}
              </span>
              . This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteType(null)
                }
                className="flex-1 rounded-xl border border-black/[0.07] px-4 py-3 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleDeleteLeaveType
                }
                className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-bold text-white hover:bg-red-600"
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