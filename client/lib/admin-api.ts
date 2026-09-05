import api from "./axios";
import type { Employee, User } from "@/types/employee";

export type AdminDashboardData = {
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    totalUsers: number;
    activeUsers: number;
    stats: {
        totalEmployees: number;
        activeEmployees: number;
        activeUsers: number;
        inactiveEmployees: number;
    };
};

export async function getAdminDashboard() {
    const response = await api.get<AdminDashboardData>("/admin/dashboard");
    return response.data;
}

export async function getAdminEmployees() {
    const response = await api.get<{ success: boolean; employees: Employee[] }>(
        "/admin/employees"
    );
    return response.data.employees;
}

export async function createAdminEmployee(data: Omit<Employee, "id" | "createdAt" | "status">) {
    const response = await api.post("/admin/employees", data);
    return response.data;
}

export async function updateAdminEmployee(id: string, data: Partial<Employee>) {
    const response = await api.patch(`/admin/employees/${id}`, data);
    return response.data;
}

export async function getAdminUsers() {
    const response = await api.get<{ success: boolean; users: User[] }>(
        "/admin/users"
    );
    return response.data.users;
}
