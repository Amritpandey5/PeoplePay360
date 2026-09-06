type HRGlassCardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function HRGlassCard({
  children,
  className = "",
}: HRGlassCardProps) {
  return (
    <div
      className={[
        "rounded-3xl border border-black/[0.06]",
        "bg-white/65 backdrop-blur-2xl",
        "shadow-[0_12px_40px_rgba(30,35,15,0.06)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}