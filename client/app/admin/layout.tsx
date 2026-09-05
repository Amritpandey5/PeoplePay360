"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-[#f7f9f8]">
            <AdminSidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
            />

            <div
                className={`min-h-screen transition-all duration-300 ${
                    collapsed
                        ? "lg:pl-[82px]"
                        : "lg:pl-[270px]"
                }`}
            >
                {children}
            </div>
        </div>
    );
}