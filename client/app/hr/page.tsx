"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  FileText,
  Users,
  WalletCards,
} from "lucide-react";

import HRPageHeader from "@/components/hr/HRPageHeader";
import HRStatCard from "@/components/hr/HRStatCard";
import HRGlassCard from "@/components/hr/HRGlassCard";
import HREmptyState from "@/components/hr/HREmptyState";
import HRPermissionBadge from "@/components/hr/HRPermissionBadge";

import {
  getEmployees,
  subscribeToDataChanges,
} from "@/lib/employee-storage";

import type { Employee } from "@/types/employee";
import type { HRRole } from "@/lib/hr-permissions";
import {
  isPayrollRole,
  isPayrollManager,
} from "@/lib/hr-helpers";

export default function HRDashboardPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Temporary role until authentication/session is connected.
  const role: HRRole = "HR_MANAGER";

  useEffect(() => {
    let mounted = true;

    const loadEmployees = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getEmployees();

        if (mounted) {
          setEmployees(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load employees:", err);

        if (mounted) {
          setError("Unable to load employee data.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadEmployees();

    const unsubscribe = subscribeToDataChanges(() => {
      loadEmployees();
    });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  const employeeStats = useMemo(() => {
    const total = employees.length;

    /*
     * Employee type implementations can differ between projects.
     * Keep status detection defensive so the dashboard does not crash
     * if some employee records do not contain a status field.
     */
    const active = employees.filter((employee) => {
      const status = String(
        (employee as Employee & { status?: string }).status ?? ""
      ).toLowerCase();

      return (
        status === "active" ||
        status === "employed" ||
        status === "working"
      );
    }).length;

    const inactive = total - active;

    return {
      total,
      active,
      inactive,
    };
  }, [employees]);

  const recentEmployees = useMemo(() => {
    return employees.slice(0, 5);
  }, [employees]);

  const getEmployeeName = (employee: Employee) => {
    const item = employee as Employee & {
      firstName?: string;
      lastName?: string;
      name?: string;
      fullName?: string;
    };

    if (item.fullName) return item.fullName;

    if (item.firstName || item.lastName) {
      return [item.firstName, item.lastName]
        .filter(Boolean)
        .join(" ");
    }

    if (item.name) return item.name;

    return "Unnamed employee";
  };

  const getEmployeeRole = (employee: Employee) => {
    const item = employee as Employee & {
      designation?: string;
      position?: string;
      role?: string;
      jobTitle?: string;
    };

    return (
      item.designation ||
      item.position ||
      item.jobTitle ||
      item.role ||
      "Employee"
    );
  };

  const getEmployeeStatus = (employee: Employee) => {
    const status = String(
      (employee as Employee & { status?: string }).status ?? ""
    ).toLowerCase();

    if (
      status === "active" ||
      status === "employed" ||
      status === "working"
    ) {
      return "Active";
    }

    if (status) {
      return status.charAt(0).toUpperCase() + status.slice(1);
    }

    return "-";
  };

  return (
    <div className="relative min-h-screen">
      <div className="mx-auto w-full max-w-[1600px] px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
        <HRPageHeader
          eyebrow="PeoplePay360 HR"
          title="HR Workspace"
          description="A real-time overview of your workforce and HR operations."
        />

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/10 bg-red-500/5 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Main workforce statistics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <HRStatCard
            label="Total Employees"
            value={loading ? "-" : employeeStats.total}
            description="Employees in your HR records"
            icon={Users}
            accent="lime"
          />

          <HRStatCard
            label="Active Employees"
            value={loading ? "-" : employeeStats.active}
            description="Currently active workforce"
            icon={Activity}
            accent="yellow"
          />

          <HRStatCard
            label="Other Status"
            value={loading ? "-" : employeeStats.inactive}
            description="Non-active employee records"
            icon={BriefcaseBusiness}
            accent="dark"
          />

          <HRStatCard
            label="HR Operations"
            value="Live"
            description="Connected to employee records"
            icon={Clock3}
            accent="lime"
          />
        </section>

        {/* Workforce pulse + quick modules */}
        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <HRGlassCard className="relative overflow-hidden p-6 sm:p-7">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#DFFF00]/15 blur-[90px]" />

            <div className="relative">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#68705D]">
                    Workforce Pulse
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#10130B]">
                    Your workforce at a glance
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-[#68705D]">
                    Keep track of the people records currently available in
                    PeoplePay360.
                  </p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#10130B] text-[#DFFF00]">
                  <Users className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-black/[0.05] bg-white/55 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#68705D]">
                    Workforce
                  </p>
                  <p className="mt-2 text-2xl font-black text-[#10130B]">
                    {loading ? "-" : employeeStats.total}
                  </p>
                </div>

                <div className="rounded-2xl border border-black/[0.05] bg-white/55 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#68705D]">
                    Active
                  </p>
                  <p className="mt-2 text-2xl font-black text-[#10130B]">
                    {loading ? "-" : employeeStats.active}
                  </p>
                </div>

                <div className="col-span-2 rounded-2xl border border-black/[0.05] bg-white/55 p-4 sm:col-span-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#68705D]">
                    Status
                  </p>
                  <p className="mt-2 text-2xl font-black text-[#10130B]">
                    Live
                  </p>
                </div>
              </div>
            </div>
          </HRGlassCard>

          <HRGlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#68705D]">
                  Access
                </p>
                <h2 className="mt-2 text-xl font-black tracking-tight">
                  Your workspace
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DFFF00]">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-[#10130B] p-5 text-white">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#DFFF00]">
                Current role
              </p>

              <p className="mt-2 text-lg font-black">
                {role === "HR_MANAGER"
                  ? "HR Manager"
                  : role === "HR_PAYROLL_USER"
                    ? "HR Payroll User"
                    : "HR Payroll Manager"}
              </p>

              <p className="mt-2 text-xs leading-5 text-white/60">
                Access is controlled by the HR permission system.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <HRPermissionBadge variant="write">
                HR Operations
              </HRPermissionBadge>

              {isPayrollRole(role) && (
                <HRPermissionBadge variant="read">
                  Payroll
                </HRPermissionBadge>
              )}

              {isPayrollManager(role) && (
                <HRPermissionBadge variant="admin">
                  Payroll Admin
                </HRPermissionBadge>
              )}
            </div>
          </HRGlassCard>
        </section>

        {/* Recent employees */}
        <section className="mt-6">
          <HRGlassCard className="overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-black/[0.06] p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#68705D]">
                  Workforce
                </p>

                <h2 className="mt-1 text-xl font-black tracking-tight">
                  Recent employees
                </h2>
              </div>

              <a
                href="/hr/employees"
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-black/[0.04] px-4 py-2.5 text-xs font-bold text-[#10130B] transition hover:bg-[#DFFF00]"
              >
                View employees
                <Users className="h-4 w-4" />
              </a>
            </div>

            {loading ? (
              <div className="p-8">
                <div className="h-16 animate-pulse rounded-2xl bg-black/[0.04]" />
                <div className="mt-3 h-16 animate-pulse rounded-2xl bg-black/[0.04]" />
                <div className="mt-3 h-16 animate-pulse rounded-2xl bg-black/[0.04]" />
              </div>
            ) : recentEmployees.length === 0 ? (
              <div className="p-5 sm:p-6">
                <HREmptyState
                  icon={Users}
                  title="No employees yet"
                  description="Employee records will appear here once they are added to PeoplePay360."
                />
              </div>
            ) : (
              <>
                {/* Desktop */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[650px]">
                    <thead>
                      <tr className="border-b border-black/[0.05]">
                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.12em] text-[#68705D]">
                          Employee
                        </th>
                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.12em] text-[#68705D]">
                          Role
                        </th>
                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.12em] text-[#68705D]">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentEmployees.map((employee, index) => (
                        <tr
                          key={
                            String(
                              (employee as Employee & { id?: string; _id?: string })
                                .id ??
                                (employee as Employee & { _id?: string })._id ??
                                index
                            )
                          }
                          className="border-b border-black/[0.04] last:border-0 hover:bg-black/[0.015]"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DFFF00]/60 text-sm font-black">
                                {getEmployeeName(employee)
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <span className="text-sm font-bold text-[#10130B]">
                                {getEmployeeName(employee)}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-sm text-[#68705D]">
                            {getEmployeeRole(employee)}
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-flex rounded-full bg-[#DFFF00]/60 px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em]">
                              {getEmployeeStatus(employee)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="divide-y divide-black/[0.05] md:hidden">
                  {recentEmployees.map((employee, index) => (
                    <div
                      key={
                        String(
                          (employee as Employee & { id?: string; _id?: string })
                            .id ??
                            (employee as Employee & { _id?: string })._id ??
                            index
                        )
                      }
                      className="p-5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#DFFF00]/60 font-black">
                          {getEmployeeName(employee)
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#10130B]">
                            {getEmployeeName(employee)}
                          </p>

                          <p className="mt-1 truncate text-xs text-[#68705D]">
                            {getEmployeeRole(employee)}
                          </p>
                        </div>

                        <span className="ml-auto shrink-0 rounded-full bg-[#DFFF00]/60 px-2.5 py-1 text-[9px] font-black uppercase">
                          {getEmployeeStatus(employee)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </HRGlassCard>
        </section>

        {/* HR modules */}
        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <ModuleCard
            href="/hr/attendance"
            icon={CalendarDays}
            label="Attendance"
          />

          <ModuleCard
            href="/hr/contracts"
            icon={FileText}
            label="Contracts"
          />

          <ModuleCard
            href="/hr/working-schedules"
            icon={Clock3}
            label="Schedules"
          />

          <ModuleCard
            href="/hr/time-off"
            icon={CalendarDays}
            label="Time Off"
          />

          {isPayrollRole(role) && (
            <ModuleCard
              href="/hr/payruns"
              icon={WalletCards}
              label="Payruns"
            />
          )}

          {isPayrollRole(role) && (
            <ModuleCard
              href="/hr/payslips"
              icon={FileText}
              label="Payslips"
            />
          )}
        </section>
      </div>
    </div>
  );
}

function ModuleCard({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Users;
  label: string;
}) {
  return (
    <a
      href={href}
      className="group rounded-2xl border border-black/[0.06] bg-white/55 p-4 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-[0_12px_30px_rgba(30,35,15,0.06)]"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/[0.04] transition group-hover:bg-[#DFFF00]">
        <Icon className="h-4 w-4" />
      </div>

      <p className="mt-3 text-xs font-bold text-[#10130B]">{label}</p>
    </a>
  );
}
