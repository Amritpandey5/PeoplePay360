"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Bell,
  Building2,
  Check,
  Clock3,
  Globe2,
  Lock,
  Mail,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import HRPageHeader from "@/components/hr/HRPageHeader";
import HRGlassCard from "@/components/hr/HRGlassCard";
import HRPermissionBadge from "@/components/hr/HRPermissionBadge";

import type { HRRole } from "@/lib/hr-permissions";
import {
  HR_ROLE_DESCRIPTIONS,
  HR_ROLE_LABELS,
} from "@/lib/hr-helpers";

import {
  getHRSettings,
  resetHRSettings,
  saveHRSettings,
  subscribeToHRSettingsChanges,
} from "@/lib/hr-settings-storage";

import type { HRSettings } from "@/types/hr-settings";
import { recordAuditLog } from "@/lib/audit-log-helpers";

const ROLE: HRRole = "HR_MANAGER";

export default function HRSettingsPage() {
  const [settings, setSettings] = useState<HRSettings>(() =>
    getHRSettings()
  );
  const [saved, setSaved] = useState(false);

  const isPayrollManager = ROLE === "HR_PAYROLL_MANAGER";

  useEffect(() => {
    setSettings(getHRSettings());

    return subscribeToHRSettingsChanges((next) => {
      setSettings(next);
    });
  }, []);

  function update<K extends keyof HRSettings>(
    key: K,
    value: HRSettings[K]
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const next = saveHRSettings(settings);
    setSettings(next);
    setSaved(true);

    recordAuditLog({
      actorName: HR_ROLE_LABELS[ROLE],
      actorRole: ROLE,
      action: "update",
      entity: "system",
      description: "Updated HR settings",
    });

    window.setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    const next = resetHRSettings();
    setSettings(next);
    setSaved(true);

    recordAuditLog({
      actorName: HR_ROLE_LABELS[ROLE],
      actorRole: ROLE,
      action: "update",
      entity: "system",
      description: "Reset HR settings to defaults",
    });

    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <HRPageHeader
        title="Settings"
        description="Configure HR, payroll, notifications and company preferences."
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company */}
          <HRGlassCard>
            <SectionHeader
              icon={<Building2 size={19} />}
              title="Company Information"
              description="Basic organization details used across the HR system."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Input
                label="Company Name"
                value={settings.companyName}
                onChange={(value) => update("companyName", value)}
                placeholder="PeoplePay360"
              />

              <Input
                label="Company Email"
                type="email"
                value={settings.companyEmail}
                onChange={(value) => update("companyEmail", value)}
                placeholder="hr@company.com"
              />

              <Input
                label="Company Phone"
                value={settings.companyPhone}
                onChange={(value) => update("companyPhone", value)}
                placeholder="+91 98765 43210"
              />
            </div>
          </HRGlassCard>

          {/* Regional */}
          <HRGlassCard>
            <SectionHeader
              icon={<Globe2 size={19} />}
              title="Regional Settings"
              description="Control timezone and currency used by the HR workspace."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Select
                label="Timezone"
                value={settings.timezone}
                onChange={(value) => update("timezone", value)}
                options={[
                  ["Asia/Kolkata", "India — Asia/Kolkata"],
                  ["Asia/Dubai", "Dubai — Asia/Dubai"],
                  ["Europe/London", "London — Europe/London"],
                  ["America/New_York", "New York — America/New_York"],
                ]}
              />

              <Select
                label="Currency"
                value={settings.currency}
                onChange={(value) => update("currency", value)}
                options={[
                  ["INR", "INR — Indian Rupee"],
                  ["USD", "USD — US Dollar"],
                  ["EUR", "EUR — Euro"],
                  ["GBP", "GBP — British Pound"],
                ]}
              />
            </div>
          </HRGlassCard>

          {/* Payroll */}
          <HRGlassCard>
            <SectionHeader
              icon={<WalletCards size={19} />}
              title="Payroll Settings"
              description="Configure the default payroll behavior."
            />

            <div className="mt-6 space-y-4">
              <Toggle
                label="Enable Payroll"
                description="Allow payroll processing inside PeoplePay360."
                checked={settings.payrollEnabled}
                disabled={!isPayrollManager && ROLE !== "HR_MANAGER"}
                onChange={(value) => update("payrollEnabled", value)}
              />

              <div className="border-t border-black/[0.06] pt-5">
                <Select
                  label="Default Pay Frequency"
                  value={settings.defaultPayFrequency}
                  disabled={!isPayrollManager}
                  onChange={(value) =>
                    update(
                      "defaultPayFrequency",
                      value as HRSettings["defaultPayFrequency"]
                    )
                  }
                  options={[
                    ["monthly", "Monthly"],
                    ["weekly", "Weekly"],
                    ["daily", "Daily"],
                    ["yearly", "Yearly"],
                  ]}
                />
              </div>
            </div>

            {!isPayrollManager && (
              <RestrictedNotice text="Default payroll frequency can only be changed by an HR Payroll Manager." />
            )}
          </HRGlassCard>

          {/* HR Features */}
          <HRGlassCard>
            <SectionHeader
              icon={<Settings2 size={19} />}
              title="HR Features"
              description="Enable or disable major HR workflows."
            />

            <div className="mt-6 space-y-4">
              <Toggle
                label="Attendance Management"
                description="Enable attendance tracking and records."
                checked={settings.attendanceEnabled}
                onChange={(value) =>
                  update("attendanceEnabled", value)
                }
              />

              <Toggle
                label="Leave Management"
                description="Enable time-off and leave request workflows."
                checked={settings.leaveManagementEnabled}
                onChange={(value) =>
                  update("leaveManagementEnabled", value)
                }
              />
            </div>
          </HRGlassCard>

          {/* Notifications */}
          <HRGlassCard>
            <SectionHeader
              icon={<Bell size={19} />}
              title="Notifications"
              description="Choose which HR events should generate notifications."
            />

            <div className="mt-6 space-y-4">
              <Toggle
                label="Email Notifications"
                description="Receive important HR updates by email."
                checked={settings.emailNotifications}
                onChange={(value) =>
                  update("emailNotifications", value)
                }
              />

              <Toggle
                label="Payslip Notifications"
                description="Notify employees when their payslips are available."
                checked={settings.payslipNotifications}
                onChange={(value) =>
                  update("payslipNotifications", value)
                }
              />

              <Toggle
                label="Leave Notifications"
                description="Notify HR about leave request activity."
                checked={settings.leaveNotifications}
                onChange={(value) =>
                  update("leaveNotifications", value)
                }
              />
            </div>
          </HRGlassCard>

          {/* Actions */}
          <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border border-black/[0.06] bg-white/80 p-3 shadow-xl backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm font-semibold text-[#10130B] transition hover:bg-black/[0.03]"
            >
              <RotateCcw size={16} />
              Reset Defaults
            </button>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#DFFF00] px-5 py-2.5 text-sm font-bold text-[#10130B] shadow-[0_8px_25px_rgba(223,255,0,0.28)] transition hover:scale-[1.01]"
            >
              {saved ? <Check size={17} /> : <Save size={17} />}
              {saved ? "Saved" : "Save Changes"}
            </button>
          </div>
        </form>

        {/* Right panel */}
        <aside className="space-y-6">
          <HRGlassCard>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DFFF00] text-[#10130B]">
                <ShieldCheck size={21} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#68705D]">
                  Current Role
                </p>
                <h3 className="mt-1 text-lg font-bold">
                  {HR_ROLE_LABELS[ROLE]}
                </h3>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-[#68705D]">
              {HR_ROLE_DESCRIPTIONS[ROLE]}
            </p>

            <div className="mt-5">
              <HRPermissionBadge
                allowed
                label="Settings Access"
              />
            </div>
          </HRGlassCard>

          <HRGlassCard>
            <SectionHeader
              icon={<Lock size={18} />}
              title="Configuration Access"
              description="Settings permissions for the current role."
            />

            <div className="mt-5 space-y-3">
              <PermissionRow
                label="HR Preferences"
                allowed
              />

              <PermissionRow
                label="Company Information"
                allowed
              />

              <PermissionRow
                label="Payroll Configuration"
                allowed={isPayrollManager}
              />

              <PermissionRow
                label="System Notifications"
                allowed
              />
            </div>
          </HRGlassCard>

          <HRGlassCard>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-[#F4FF3F]/60 p-2">
                <Clock3 size={17} />
              </div>

              <div>
                <p className="text-sm font-bold">Last Updated</p>
                <p className="mt-1 text-xs leading-5 text-[#68705D]">
                  {formatDate(settings.updatedAt)}
                </p>
              </div>
            </div>
          </HRGlassCard>
        </aside>
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DFFF00]/60 text-[#10130B]">
        {icon}
      </div>

      <div>
        <h2 className="text-base font-bold">{title}</h2>
        <p className="mt-1 text-sm text-[#68705D]">{description}</p>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#10130B]">
        {label}
      </span>

      <div className="relative">
        {type === "email" && (
          <Mail
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#68705D]"
          />
        )}

        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-black/[0.08] bg-white/75 px-4 py-3 text-sm outline-none transition placeholder:text-[#9aa092] focus:border-[#DFFF00] focus:ring-4 focus:ring-[#DFFF00]/15 ${
            type === "email" ? "pl-10" : ""
          }`}
        />
      </div>
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#10130B]">
        {label}
      </span>

      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-black/[0.08] bg-white/75 px-4 py-3 text-sm outline-none transition focus:border-[#DFFF00] focus:ring-4 focus:ring-[#DFFF00]/15 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-2xl border border-black/[0.06] bg-white/45 p-4 ${
        disabled ? "opacity-60" : ""
      }`}
    >
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-1 text-xs leading-5 text-[#68705D]">
          {description}
        </p>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked ? "bg-[#10130B]" : "bg-black/15"
        } disabled:cursor-not-allowed`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full transition ${
            checked
              ? "left-6 bg-[#DFFF00]"
              : "left-1 bg-white"
          }`}
        />
      </button>
    </div>
  );
}

function PermissionRow({
  label,
  allowed,
}: {
  label: string;
  allowed: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-black/[0.06] bg-white/45 px-3 py-3">
      <span className="text-sm font-medium">{label}</span>

      <span
        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
          allowed
            ? "bg-[#DFFF00]/60 text-[#10130B]"
            : "bg-black/[0.05] text-[#68705D]"
        }`}
      >
        {allowed ? "Allowed" : "Restricted"}
      </span>
    </div>
  );
}

function RestrictedNotice({ text }: { text: string }) {
  return (
    <div className="mt-5 rounded-xl border border-black/[0.06] bg-black/[0.025] px-4 py-3 text-xs leading-5 text-[#68705D]">
      {text}
    </div>
  );
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "Not available";
  }
}
