import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Users, WalletCards } from "lucide-react";
const features = [
    {
        icon: Users,
        title: "Employee Management",
        description: "Manage employee profiles, contracts, departments, positions and employment history from one place.",
    },
    {
        icon: WalletCards,
        title: "Smart Payroll",
        description: "Calculate salaries, allowances, deductions and net pay with configurable salary rules.",
    },
    {
        icon: ShieldCheck,
        title: "Secure & Reliable",
        description: "Role-based access keeps employee, HR, payroll and administrative data protected.",
    },
];

const benefits = [
    "Centralized employee records",
    "Attendance and leave management",
    "Configurable salary structures",
    "Automated payroll calculations",
    "Payslip generation and delivery",
    "Reports and workforce analytics",
];

export default function Home() {
    return (
        <main className="min-h-screen bg-[#f7f9f8] text-[#17211c]">
            <header className="border-b border-[#e5e7eb] bg-white/90 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#064e3b] text-white">
                            <span className="text-lg font-bold">P</span>
                        </div>
                        <div>
                            <p className="text-lg font-bold tracking-tight">PeoplePay360</p>
                            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                                HR & Payroll
                            </p>
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
                        <a href="#features" className="transition hover:text-[#064e3b]">
                            Features
                        </a>
                        <a href="#benefits" className="transition hover:text-[#064e3b]">
                            Benefits
                        </a>
                        <a href="#about" className="transition hover:text-[#064e3b]">
                            About
                        </a>
                    </nav>

                    <Link
                        href="/login"
                        className="rounded-xl bg-[#064e3b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#053c2e]"
                    >
                        Sign In
                    </Link>
                </div>
            </header>

            <section className="relative overflow-hidden">
                <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-100/60 blur-3xl" />
                <div className="absolute -left-32 top-72 h-80 w-80 rounded-full bg-green-100/50 blur-3xl" />

                <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
                    <div>
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800">
                            <Sparkles className="h-4 w-4" />
                            Modern HR & Payroll Platform
                        </div>

                        <h1 className="max-w-3xl text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
                            Manage your people.
                            <span className="block text-[#047857]">Simplify your payroll.</span>
                        </h1>

                        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                            PeoplePay360 brings employee management, attendance, leave,
                            payroll and workforce insights together in one powerful platform.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#064e3b] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:-translate-y-0.5 hover:bg-[#053c2e]"
                            >
                                Get Started
                                <ArrowRight className="h-4 w-4" />
                            </Link>

                            <a
                                href="#features"
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-[#064e3b]"
                            >
                                Explore Features
                            </a>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                Employee-first
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                Payroll ready
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                Role-based access
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        Payroll Overview
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        September 2026
                                    </p>
                                </div>
                                <div className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                    Live
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-5">
                                <div className="rounded-2xl bg-[#f7f9f8] p-4">
                                    <p className="text-xs text-slate-500">Employees</p>
                                    <p className="mt-2 text-2xl font-bold">248</p>
                                    <p className="mt-1 text-xs text-emerald-600">+8 this month</p>
                                </div>

                                <div className="rounded-2xl bg-[#f7f9f8] p-4">
                                    <p className="text-xs text-slate-500">Payroll</p>
                                    <p className="mt-2 text-2xl font-bold">₹42.8L</p>
                                    <p className="mt-1 text-xs text-emerald-600">98.4% processed</p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-100 p-4">
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="text-sm font-semibold">Payroll Processing</p>
                                    <p className="text-xs text-slate-500">This month</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="mb-2 flex justify-between text-xs">
                                            <span className="text-slate-500">Completed</span>
                                            <span className="font-semibold">82%</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                            <div className="h-full w-[82%] rounded-full bg-emerald-600" />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="mb-2 flex justify-between text-xs">
                                            <span className="text-slate-500">Pending review</span>
                                            <span className="font-semibold">18%</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                            <div className="h-full w-[18%] rounded-full bg-amber-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-3">
                                <div className="rounded-xl bg-emerald-50 p-3 text-center">
                                    <p className="text-lg font-bold text-emerald-800">231</p>
                                    <p className="text-[11px] text-emerald-700">Processed</p>
                                </div>
                                <div className="rounded-xl bg-amber-50 p-3 text-center">
                                    <p className="text-lg font-bold text-amber-800">12</p>
                                    <p className="text-[11px] text-amber-700">Review</p>
                                </div>
                                <div className="rounded-xl bg-red-50 p-3 text-center">
                                    <p className="text-lg font-bold text-red-800">5</p>
                                    <p className="text-[11px] text-red-700">Warnings</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="features" className="border-y border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                            Everything in one place
                        </p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                            Built for modern HR teams
                        </h2>
                        <p className="mt-4 text-slate-600">
                            From your first employee record to the final payslip,
                            PeoplePay360 keeps your entire HR workflow connected.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 md:grid-cols-3">
                        {features.map((feature) => {
                            const Icon = feature.icon;

                            return (
                                <div
                                    key={feature.title}
                                    className="rounded-2xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-900/5"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-6 text-lg font-bold">{feature.title}</h3>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section id="benefits">
                <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                            One connected platform
                        </p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                            Less admin work.
                            <span className="block text-emerald-700">More control.</span>
                        </h2>
                        <p className="mt-5 max-w-xl leading-7 text-slate-600">
                            PeoplePay360 is designed around the employee as the central
                            hub, connecting contracts, attendance, leave and payroll data.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        {benefits.map((benefit) => (
                            <div
                                key={benefit}
                                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"
                            >
                                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                                <span className="text-sm font-medium text-slate-700">
                                    {benefit}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="about" className="bg-[#064e3b]">
                <div className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200">
                        PeoplePay360
                    </p>
                    <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        A smarter operating system for your people and payroll.
                    </h2>
                    <p className="mx-auto mt-5 max-w-2xl leading-7 text-emerald-100">
                        Designed to bring HR operations, payroll processing and workforce
                        intelligence into a single, connected experience.
                    </p>

                    <Link
                        href="/login"
                        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[#064e3b] transition hover:bg-emerald-50"
                    >
                        Enter PeoplePay360
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>

            <footer className="border-t border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
                    <p>© 2026 PeoplePay360. All rights reserved.</p>
                    <p>HR & Payroll Management Platform</p>
                </div>
            </footer>
        </main>
    );
}