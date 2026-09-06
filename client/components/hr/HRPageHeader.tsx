"use client";

import type { LucideIcon } from "lucide-react";

type HRPageHeaderAction = {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
};

type HRPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: HRPageHeaderAction;
};

export default function HRPageHeader({
  eyebrow,
  title,
  description,
  action,
}: HRPageHeaderProps) {
  const ActionIcon = action?.icon;

  return (
    <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#68705D]">
            {eyebrow}
          </p>
        )}

        <h1 className="text-2xl font-bold tracking-tight text-[#10130B] sm:text-3xl">
          {title}
        </h1>

        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68705D]">
            {description}
          </p>
        )}
      </div>

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#DFFF00] px-5 text-sm font-bold text-[#10130B] shadow-[0_8px_30px_rgba(223,255,0,0.25)] transition hover:bg-[#F4FF3F] hover:shadow-[0_10px_35px_rgba(223,255,0,0.35)]"
        >
          {ActionIcon && <ActionIcon className="h-4 w-4" />}
          {action.label}
        </button>
      )}
    </div>
  );
}
