"use client";

import type { LucideIcon } from "lucide-react";

type HREmptyStateAction = {
  label: string;
  onClick: () => void;
};

type HREmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: HREmptyStateAction;
};

export default function HREmptyState({
  icon: Icon,
  title,
  description,
  action,
}: HREmptyStateProps) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-10 text-center">
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-black/[0.06] bg-white/70 text-[#68705D] shadow-sm backdrop-blur-xl">
          <Icon className="h-6 w-6" />
        </div>
      )}

      <h3 className="mt-5 text-base font-bold text-[#10130B]">
        {title}
      </h3>

      {description && (
        <p className="mt-2 max-w-md text-sm leading-6 text-[#68705D]">
          {description}
        </p>
      )}

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-[#DFFF00] px-5 text-sm font-bold text-[#10130B] shadow-[0_8px_25px_rgba(223,255,0,0.25)] transition hover:bg-[#F4FF3F] hover:shadow-[0_10px_30px_rgba(223,255,0,0.35)]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
