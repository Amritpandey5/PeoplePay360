"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock3,
  CalendarDays,
  ReceiptText,
  UserRound,
  Megaphone,
  CircleHelp,
  LogOut,
  X,
} from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

type EmployeeSidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

const navigationItems = [
  {
    label: "Dashboard",
    href: "/employee",
    icon: LayoutDashboard,
  },
  {
    label: "Attendance",
    href: "/employee/attendance",
    icon: Clock3,
  },
  {
    label: "Leave",
    href: "/employee/leave",
    icon: CalendarDays,
  },
  {
    label: "My Payslip",
    href: "/employee/payslip",
    icon: ReceiptText,
  },
  {
    label: "Profile",
    href: "/employee/profile",
    icon: UserRound,
  },
  {
    label: "Announcements",
    href: "/employee/announcements",
    icon: Megaphone,
  },
  {
    label: "Help & Support",
    href: "/employee/support",
    icon: CircleHelp,
  },
];

export default function EmployeeSidebar({
  isOpen = true,
  onClose,
}: EmployeeSidebarProps) {
  const pathname = usePathname();
  const router = useRouter()

  const isActive = (href: string) => {
    if (href === "/employee") {
      return pathname === "/employee";
    }

    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-72 flex-col
          border-r border-slate-200 bg-white
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6">
          <Link href="/employee" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-lg font-bold text-white">
              P
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                PeoplePay
              </h1>

              <p className="text-xs text-slate-500">
                Employee Portal
              </p>
            </div>
          </Link>

          {/* Mobile Close */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 rounded-xl px-3 py-3
                    text-sm font-medium transition-all duration-200
                    ${
                      active
                        ? "bg-teal-50 text-teal-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }
                  `}
                >
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.4 : 2}
                  />

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-slate-200 p-4">
          <button
            onClick={async (e) => {
              e.preventDefault()
              await axios.post("http://localhost:5000/auth/logout",{},{
                withCredentials:true
              })
              await router.push("http://localhost:3000/auth")
            }}
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}