"use client";

import type { LucideIcon } from "lucide-react";

type HRStatCardProps = {
  title?: string;
  label?: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  accent?: "lime" | "yellow" | "dark";
};

const accentStyles: Record<
  NonNullable<HRStatCardProps["accent"]>,
  string
> = {
  lime: "bg-[#DFFF00] text-[#10130B]",
  yellow: "bg-[#F4FF3F] text-[#10130B]",
  dark: "bg-[#10130B] text-[#DFFF00]",
};

export default function HRStatCard({
  title,
  label,
  value,
  description,
  icon: Icon,
  accent = "lime",
}: HRStatCardProps) {
  const heading = title ?? label;

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white/65 p-5 shadow-[0_18px_60px_rgba(30,35,15,0.06)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {heading && (
            <p className="truncate text-[10px] font-black uppercase tracking-[0.14em] text-[#68705D]">
              {heading}
            </p>
          )}

          <p className="mt-3 text-3xl font-black tracking-tight text-[#10130B]">
            {value}
          </p>
        </div>

        <div
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
            accentStyles[accent],
          ].join(" ")}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {description && (
        <p className="mt-3 text-sm leading-5 text-[#68705D]">
          {description}
        </p>
      )}
    </div>
  );
}
