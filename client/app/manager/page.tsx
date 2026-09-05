"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardList, FolderKanban, LifeBuoy, Users } from "lucide-react";
import api from "@/lib/axios";

type ManagerDashboard = {
    manager?: {
        name: string;
        email: string;
        type: string;
    };
    employees: Array<{ id: number; name: string; email: string; status: string }>;
    tasks: Array<{ id: number; name: string; target: string; employee?: { name: string } }>;
    projects: Array<{ id: number; name: string; target: string; employees?: Array<{ name: string }> }>;
    tickets: Array<{ id: number; title: string; employee?: { name: string } }>;
    stats: {
        totalEmployees: number;
        activeEmployees: number;
        openTickets: number;
        assignedTasks: number;
        projects: number;
    };
};

const emptyDashboard: ManagerDashboard = {
    employees: [],
    tasks: [],
    projects: [],
    tickets: [],
    stats: {
        totalEmployees: 0,
        activeEmployees: 0,
        openTickets: 0,
        assignedTasks: 0,
        projects: 0,
    },
};

export default function ManagerDashboardPage() {
    const [dashboard, setDashboard] = useState<ManagerDashboard>(emptyDashboard);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get<ManagerDashboard>("/manager/dashboard")
            .then((response) => setDashboard(response.data))
            .catch(() => setError("Unable to load manager dashboard."));
    }, []);

    return (
        <main className="min-h-screen bg-slate-50 px-6 py-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-teal-700">
                            Manager Portal
                        </p>
                        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                            Good day, {dashboard.manager?.name || "Manager"}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Track your team, tasks, projects, and employee support tickets.
                        </p>
                    </div>

                    <Link
                        href="/auth"
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        Switch account
                    </Link>
                </header>

                {error && (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <Stat title="Team" value={dashboard.stats.totalEmployees} icon={Users} />
                    <Stat title="Active" value={dashboard.stats.activeEmployees} icon={Users} />
                    <Stat title="Tickets" value={dashboard.stats.openTickets} icon={LifeBuoy} />
                    <Stat title="Tasks" value={dashboard.stats.assignedTasks} icon={ClipboardList} />
                    <Stat title="Projects" value={dashboard.stats.projects} icon={FolderKanban} />
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                    <Panel title="Recent Tickets" empty="No open tickets">
                        {dashboard.tickets.map((ticket) => (
                            <Row
                                key={ticket.id}
                                title={ticket.title}
                                meta={ticket.employee?.name || "Employee"}
                            />
                        ))}
                    </Panel>

                    <Panel title="Upcoming Tasks" empty="No assigned tasks">
                        {dashboard.tasks.map((task) => (
                            <Row
                                key={task.id}
                                title={task.name}
                                meta={`${task.employee?.name || "Employee"} • ${new Date(task.target).toLocaleDateString("en-IN")}`}
                            />
                        ))}
                    </Panel>

                    <Panel title="Projects" empty="No projects assigned">
                        {dashboard.projects.map((project) => (
                            <Row
                                key={project.id}
                                title={project.name}
                                meta={`${project.employees?.length || 0} employee(s) • ${new Date(project.target).toLocaleDateString("en-IN")}`}
                            />
                        ))}
                    </Panel>

                    <Panel title="Team Members" empty="No team members">
                        {dashboard.employees.map((employee) => (
                            <Row
                                key={employee.id}
                                title={employee.name}
                                meta={`${employee.email} • ${employee.status}`}
                            />
                        ))}
                    </Panel>
                </section>
            </div>
        </main>
    );
}

function Stat({
    title,
    value,
    icon: Icon,
}: {
    title: string;
    value: number;
    icon: typeof Users;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );
}

function Panel({
    title,
    empty,
    children,
}: {
    title: string;
    empty: string;
    children: React.ReactNode;
}) {
    const items = Array.isArray(children) ? children.filter(Boolean) : children;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <div className="mt-4 divide-y divide-slate-100">
                {Array.isArray(items) && items.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-400">{empty}</p>
                ) : (
                    items
                )}
            </div>
        </div>
    );
}

function Row({ title, meta }: { title: string; meta: string }) {
    return (
        <div className="py-3">
            <p className="text-sm font-semibold text-slate-800">{title}</p>
            <p className="mt-1 text-xs text-slate-500">{meta}</p>
        </div>
    );
}
