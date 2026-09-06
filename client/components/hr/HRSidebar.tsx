"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { LucideIcon } from "lucide-react";

import type { HRModule, HRRole } from "@/lib/hr-permissions";
import { canAccessModule, HR_ROLE_LABELS } from "@/lib/hr-helpers";

type HRSidebarProps = {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
  role: HRRole;
};

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  module?: HRModule;
};

const navigation: NavItem[] = [
  { label: "Dashboard", href: "/hr", icon: LayoutDashboard },
  { label: "Employees", href: "/hr/employees", icon: Users, module: "employees" },
  { label: "Attendance", href: "/hr/attendance", icon: ClipboardCheck, module: "attendance" },
  { label: "Contracts", href: "/hr/contracts", icon: FileText, module: "contracts" },
  { label: "Schedules", href: "/hr/working-schedules", icon: Clock3, module: "workingSchedules" },
  { label: "Time Off", href: "/hr/time-off", icon: CalendarDays, module: "timeOff" },
  { label: "Payruns", href: "/hr/payruns", icon: WalletCards, module: "payruns" },
  { label: "Payslips", href: "/hr/payslips", icon: Receipt, module: "payslips" },
];

const secondaryNavigation: NavItem[] = [
  { label: "Audit Logs", href: "/hr/audit-logs", icon: ShieldCheck, module: "auditLogs" },
  { label: "Settings", href: "/hr/settings", icon: Settings },
];

export default function HRSidebar({
  collapsed,
  setCollapsed,
  role,
}: HRSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleNavigation = navigation.filter(
    (item) => !item.module || canAccessModule(role, item.module)
  );

  const visibleSecondaryNavigation = secondaryNavigation.filter(
    (item) => !item.module || canAccessModule(role, item.module)
  );

  const isActive = (href: string) =>
    href === "/hr" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-50 hidden h-screen border-r border-black/[0.06] bg-white/70 shadow-[10px_0_50px_rgba(30,35,10,0.04)] backdrop-blur-2xl transition-all duration-300 lg:block ${
          collapsed ? "w-[82px]" : "w-[270px]"
        }`}
      >
        <div className="flex h-full flex-col">
          <SidebarBrand collapsed={collapsed} />

          {!collapsed && (
            <div className="mx-4 mb-5 rounded-2xl border border-black/[0.06] bg-white/70 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DFFF00] text-[#10130B]">
                  <UserRound size={19} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black">{HR_ROLE_LABELS[role]}</p>
                  <p className="mt-0.5 text-xs text-[#68705D]">HR Workspace</p>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto px-3 pb-5">
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#8A9182]">
                Workspace
              </p>
            )}

            <div className="space-y-1">
              {visibleNavigation.map((item) => (
                <SidebarItem
                  key={item.href}
                  item={item}
                  active={isActive(item.href)}
                  collapsed={collapsed}
                />
              ))}
            </div>

            {!collapsed && (
              <p className="mb-2 mt-7 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#8A9182]">
                System
              </p>
            )}

            <div className="space-y-1">
              {visibleSecondaryNavigation.map((item) => (
                <SidebarItem
                  key={item.href}
                  item={item}
                  active={isActive(item.href)}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </nav>

          <div className="border-t border-black/[0.06] p-3">
            <button
              type="button"
              className={`group flex w-full items-center rounded-2xl text-[#68705D] transition hover:bg-black/[0.04] hover:text-[#10130B] ${
                collapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-3"
              }`}
            >
              <LogOut size={19} className="shrink-0" />
              {!collapsed && <span className="text-sm font-bold">Sign Out</span>}
            </button>

            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className={`mt-1 flex w-full items-center rounded-2xl bg-[#10130B] text-white transition hover:bg-[#20251A] ${
                collapsed ? "justify-center px-2 py-3" : "justify-between px-3 py-3"
              }`}
            >
              {!collapsed && <span className="text-xs font-bold">Collapse Menu</span>}
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </div>
      </aside>

      <div className="fixed left-0 right-0 top-0 z-40 flex h-[70px] items-center justify-between border-b border-black/[0.06] bg-white/70 px-4 shadow-sm backdrop-blur-xl lg:hidden">
        <Link href="/hr" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10130B] text-[#DFFF00]">
            <span className="font-black">P</span>
          </div>
          <span className="text-base font-black">
            PeoplePay<span className="text-[#8CA900]">360</span>
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10130B] text-white"
        >
          <Menu size={20} />
        </button>
      </div>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`fixed bottom-0 left-0 top-0 z-[60] w-[285px] border-r border-black/[0.06] bg-white/90 shadow-[20px_0_60px_rgba(0,0,0,0.10)] backdrop-blur-2xl transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-[82px] items-center justify-between border-b border-black/[0.06] px-5">
            <Link href="/hr" onClick={() => setMobileOpen(false)} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10130B] text-[#DFFF00]">
                <span className="font-black">P</span>
              </div>
              <div>
                <p className="font-black">
                  PeoplePay<span className="text-[#8CA900]">360</span>
                </p>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#8A9182]">
                  HR Workspace
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/[0.04]"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-5">
            {[...visibleNavigation, ...visibleSecondaryNavigation].map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`mb-1 flex items-center gap-3 rounded-2xl px-3 py-3 ${
                    isActive(item.href)
                      ? "bg-[#DFFF00] font-black text-[#10130B]"
                      : "font-semibold text-[#68705D] hover:bg-black/[0.04]"
                  }`}
                >
                  <Icon size={19} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}

function SidebarBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={`flex h-[82px] shrink-0 items-center border-b border-black/[0.06] ${
        collapsed ? "justify-center px-3" : "px-5"
      }`}
    >
      <Link href="/hr" className="flex items-center gap-3">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#10130B] text-[#DFFF00] shadow-[0_0_25px_rgba(223,255,0,0.18)]">
          <span className="text-lg font-black">P</span>
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#DFFF00] shadow-[0_0_14px_rgba(223,255,0,0.9)]" />
        </div>

        {!collapsed && (
          <div>
            <p className="text-lg font-black tracking-tight">
              PeoplePay<span className="text-[#8CA900]">360</span>
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8A9182]">
              HR Workspace
            </p>
          </div>
        )}
      </Link>
    </div>
  );
}

function SidebarItem({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`group relative flex items-center rounded-2xl transition-all duration-200 ${
        collapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-3"
      } ${
        active
          ? "bg-[#DFFF00] text-[#10130B] shadow-[0_8px_25px_rgba(223,255,0,0.20)]"
          : "text-[#68705D] hover:bg-black/[0.04] hover:text-[#10130B]"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#10130B]" />
      )}
      <Icon size={19} strokeWidth={active ? 2.5 : 2} className="shrink-0" />
      {!collapsed && (
        <span className={`truncate text-sm ${active ? "font-black" : "font-semibold"}`}>
          {item.label}
        </span>
      )}
      {!collapsed && active && <ChevronRight size={15} className="ml-auto shrink-0" />}
    </Link>
  );
}
