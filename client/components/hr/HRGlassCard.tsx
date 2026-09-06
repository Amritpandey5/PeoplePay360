import type { ReactNode } from "react";

type HRGlassCardProps = {
  children: ReactNode;
  className?: string;
};

export default function HRGlassCard({
  children,
  className = "",
}: HRGlassCardProps) {
  return (
    <div
      className={[
        "rounded-2xl border border-black/[0.06] bg-white/65",
        "shadow-[0_18px_60px_rgba(30,35,15,0.06)] backdrop-blur-xl",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
