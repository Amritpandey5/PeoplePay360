"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { adminSignin } from "@/lib/auth";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    ShieldCheck,
    Users,
} from "lucide-react";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setError("");

        if (!email || !password) {
            setError(
                "Please enter your work email and password."
            );
            return;
        }

        setIsLoading(true);

        try {
            const response = await adminSignin({
                email: email.trim(),
                password,
            });

            console.log("Login response:", response);

            if (!response.success) {
                setError(
                    response.message || "Login failed."
                );
                return;
            }

            // JWT is stored in the HTTP-only cookie by backend.
            // We don't store it in localStorage.

            router.push("/admin");
        } catch (error: any) {
            console.error("Login error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to sign in. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#f7f9f8] lg:grid lg:h-screen lg:grid-cols-[45%_55%] lg:overflow-hidden">
            <section className="relative hidden h-screen overflow-hidden bg-[#063d2f] px-10 py-8 text-white lg:flex lg:flex-col lg:justify-between xl:px-16 xl:py-10">
                <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/10" />
                <div className="absolute -bottom-48 -left-40 h-[32rem] w-[32rem] rounded-full border border-white/10" />
                <div className="absolute right-20 top-1/2 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />

                <Link
                    href="/"
                    className="relative z-10 flex items-center gap-3"
                >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#063d2f] shadow-lg">
                        <span className="text-xl font-bold">P</span>
                    </div>

                    <div>
                        <p className="text-lg font-bold tracking-tight">
                            PeoplePay360
                        </p>
                        <p className="text-xs text-emerald-100/70">
                            HR & Payroll Platform
                        </p>
                    </div>
                </Link>

                <div className="relative z-10 max-w-xl">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-white/5 px-4 py-2 text-sm text-emerald-100">
                        <ShieldCheck size={16} />
                        Secure workforce management
                    </div>

                    <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
                        Manage your people.
                        <span className="block text-emerald-300">
                            Simplify your payroll.
                        </span>
                    </h1>

                    <p className="mt-5 max-w-lg text-base leading-7 text-emerald-50/70">
                        One connected platform for employees, attendance, time
                        off, contracts and payroll operations.
                    </p>

                    <div className="mt-7 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                            <p className="text-sm font-semibold">
                                Employee Management
                            </p>
                            <p className="mt-1 text-xs leading-5 text-emerald-100/60">
                                Keep employee records organized in one place.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                            <p className="text-sm font-semibold">
                                Payroll Operations
                            </p>
                            <p className="mt-1 text-xs leading-5 text-emerald-100/60">
                                Process payruns and payslips with confidence.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                            <p className="text-sm font-semibold">
                                Attendance & Time Off
                            </p>
                            <p className="mt-1 text-xs leading-5 text-emerald-100/60">
                                Connect workforce activity with HR records.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                            <p className="text-sm font-semibold">
                                Role-Based Access
                            </p>
                            <p className="mt-1 text-xs leading-5 text-emerald-100/60">
                                Give every user access to what they need.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-xs text-emerald-100/50">
                    © {new Date().getFullYear()} PeoplePay360. All rights
                    reserved.
                </div>
            </section>

            <section className="flex min-h-screen items-center justify-center overflow-y-auto px-5 py-8 sm:px-8 lg:h-screen lg:min-h-0 lg:px-12 lg:py-6 xl:px-20">
                <div className="w-full max-w-md">
                    <Link
                        href="/"
                        className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#063d2f]"
                    >
                        <ArrowLeft size={17} />
                        Back to PeoplePay360
                    </Link>

                    <div className="mb-6">
                        <p className="mb-2 text-sm font-semibold text-emerald-700">
                            Admin Portal
                        </p>

                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                            Sign in as administrator
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 p-5 rounded-xl shadow-[0_0_3px_rgba(0,0,0,0.3)]">
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Work Email
                            </label>

                            <div className="relative">
                                <Mail
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    placeholder="you@company.com"
                                    autoComplete="email"
                                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-semibold text-slate-700"
                                >
                                    Password
                                </label>

                                <button
                                    type="button"
                                    className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <div className="relative">
                                <LockKeyhole
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword((value) => !value)
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-500">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(event) =>
                                        setRememberMe(event.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-slate-300 accent-emerald-700"
                                />
                                Remember me
                            </label>
                        </div>

                        {error && (
                            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex h-12 w-full items-center justify-center rounded-xl bg-[#063d2f] px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-950/10 transition hover:bg-[#07513e] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-sm font-semibold text-slate-800">
                            New to PeoplePay360?
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                            Your account is created by your company
                            administrator. Contact your administrator if you
                            need access.
                        </p>
                    </div>

                    <p className="mt-5 text-center text-xs leading-5 text-slate-400">
                        Access is controlled by your assigned company role and
                        permissions.
                    </p>
                </div>
            </section>
        </main>
    );
}
