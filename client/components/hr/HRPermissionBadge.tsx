import type { ReactNode } from "react";

type HRPermissionBadgeProps = {
  children?: ReactNode;
  label?: ReactNode;
  allowed?: boolean;
  variant?: "read" | "write" | "admin";
};

const variants: Record<
  NonNullable<HRPermissionBadgeProps["variant"]>,
  string
> = {
  read: "bg-black/[0.05] text-[#68705D]",
  write: "bg-[#DFFF00]/70 text-[#10130B]",
  admin: "bg-[#10130B] text-[#DFFF00]",
};

export default function HRPermissionBadge({
  children,
  label,
  allowed,
  variant,
}: HRPermissionBadgeProps) {
  const resolvedVariant =
    variant ?? (allowed ? "write" : "read");

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1",
        "text-[9px] font-black uppercase tracking-[0.12em]",
        variants[resolvedVariant],
      ].join(" ")}
    >
      {children ?? label}
    </span>
  );
}
