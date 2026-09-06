"use client";

import { useState } from "react";
import HRSidebar from "@/components/hr/HRSidebar";
import type { HRRole } from "@/lib/hr-permissions";

export default function HRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  // Temporary until authentication/session is connected.
  const role: HRRole = "HR_PAYROLL_USER";
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F7F2] text-[#10130B]">
      {/* Ambient neon background */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-[#DFFF00]/20 blur-[120px]" />
        <div className="absolute right-[-120px] top-[20%] h-[380px] w-[380px] rounded-full bg-[#B7FF00]/15 blur-[120px]" />
        <div className="absolute bottom-[-150px] left-[35%] h-[400px] w-[400px] rounded-full bg-[#F4FF3F]/15 blur-[130px]" />
      </div>

      <HRSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        role={role}
      />

      <main
        className={`relative min-h-screen transition-[margin] duration-300 ${
          collapsed ? "lg:ml-[82px]" : "lg:ml-[270px]"
        }`}
      >
        {children}
      </main>
    </div>
  );
}