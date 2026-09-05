"use client";

import { useState } from "react";
import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    X,
    XCircle,
    Plus,
} from "lucide-react";

type LeaveForm = {
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
};

export default function LeavePage() {
    const [showModal, setShowModal] = useState(false);

    const [form, setForm] = useState<LeaveForm>({
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: "",
    });

    const [formError, setFormError] = useState("");

    const handleChange = (
        field: keyof LeaveForm,
        value: string
    ) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));

        setFormError("");
    };

    const handleOpenModal = () => {
        setFormError("");
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormError("");
    };

    const handleSubmit = (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!form.leaveType) {
            setFormError("Please select a leave type.");
            return;
        }

        if (!form.startDate) {
            setFormError("Please select a start date.");
            return;
        }

        if (!form.endDate) {
            setFormError("Please select an end date.");
            return;
        }

        if (
            new Date(form.endDate) <
            new Date(form.startDate)
        ) {
            setFormError(
                "End date cannot be before start date."
            );
            return;
        }

        if (!form.reason.trim()) {
            setFormError("Please enter the reason for leave.");
            return;
        }

        /*
         * Backend integration will be connected later.
         * No fake request or fake success is performed here.
         */

        setFormError(
            "Leave submission will be connected when the backend API is ready."
        );
    };

    return (
        <div className="space-y-6">

            {/* PAGE HEADER */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>
                    <p className="text-sm font-semibold text-teal-700">
                        Employee Portal
                    </p>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                        Leave
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Apply for leave and track your leave requests.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleOpenModal}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0D665F]"
                >
                    <Plus size={18} />
                    Apply for Leave
                </button>
            </div>

            {/* SUMMARY */}
            <div className="grid gap-4 md:grid-cols-3">

                {/* PENDING */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                        <Clock3
                            size={21}
                            className="text-amber-600"
                        />
                    </div>

                    <p className="mt-4 text-sm text-slate-500">
                        Pending Requests
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-slate-900">
                        —
                    </h2>

                </div>

                {/* APPROVED */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                        <CheckCircle2
                            size={21}
                            className="text-emerald-600"
                        />
                    </div>

                    <p className="mt-4 text-sm text-slate-500">
                        Approved Requests
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-slate-900">
                        —
                    </h2>

                </div>

                {/* REJECTED */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                        <XCircle
                            size={21}
                            className="text-red-600"
                        />
                    </div>

                    <p className="mt-4 text-sm text-slate-500">
                        Rejected Requests
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-slate-900">
                        —
                    </h2>

                </div>

            </div>

            {/* LEAVE REQUESTS */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            My Leave Requests
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Your submitted leave requests will appear here.
                        </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50">
                        <CalendarDays
                            size={20}
                            className="text-teal-700"
                        />
                    </div>

                </div>

                {/* EMPTY STATE */}
                <div className="flex min-h-[300px] flex-col items-center justify-center text-center">

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
                        <CalendarDays
                            size={32}
                            className="text-slate-300"
                        />
                    </div>

                    <h3 className="mt-5 text-base font-semibold text-slate-700">
                        No leave requests
                    </h3>

                    <p className="mt-1 max-w-sm text-sm leading-6 text-slate-400">
                        Your leave requests will be displayed here once
                        they are submitted.
                    </p>

                    <button
                        type="button"
                        onClick={handleOpenModal}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-100"
                    >
                        <Plus size={16} />
                        Apply for Leave
                    </button>

                </div>

            </div>

            {/* APPLY LEAVE MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">

                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

                        {/* MODAL HEADER */}
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Apply for Leave
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Enter the details of your leave request.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        {/* FORM */}
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5 p-6"
                        >

                            {/* LEAVE TYPE */}
                            <div>
                                <label
                                    htmlFor="leaveType"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Leave Type
                                </label>

                                <select
                                    id="leaveType"
                                    value={form.leaveType}
                                    onChange={(event) =>
                                        handleChange(
                                            "leaveType",
                                            event.target.value
                                        )
                                    }
                                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                                >
                                    <option value="">
                                        Select leave type
                                    </option>

                                    <option value="casual">
                                        Casual Leave
                                    </option>

                                    <option value="sick">
                                        Sick Leave
                                    </option>

                                    <option value="earned">
                                        Earned Leave
                                    </option>

                                    <option value="emergency">
                                        Emergency Leave
                                    </option>
                                </select>
                            </div>

                            {/* DATES */}
                            <div className="grid gap-4 sm:grid-cols-2">

                                <div>
                                    <label
                                        htmlFor="startDate"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        From Date
                                    </label>

                                    <input
                                        id="startDate"
                                        type="date"
                                        value={form.startDate}
                                        onChange={(event) =>
                                            handleChange(
                                                "startDate",
                                                event.target.value
                                            )
                                        }
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="endDate"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        To Date
                                    </label>

                                    <input
                                        id="endDate"
                                        type="date"
                                        min={form.startDate || undefined}
                                        value={form.endDate}
                                        onChange={(event) =>
                                            handleChange(
                                                "endDate",
                                                event.target.value
                                            )
                                        }
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                                    />
                                </div>

                            </div>

                            {/* REASON */}
                            <div>
                                <label
                                    htmlFor="reason"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Reason
                                </label>

                                <textarea
                                    id="reason"
                                    rows={4}
                                    value={form.reason}
                                    onChange={(event) =>
                                        handleChange(
                                            "reason",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter the reason for your leave..."
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                                />
                            </div>

                            {/* VALIDATION MESSAGE */}
                            {formError && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-700">
                                    {formError}
                                </div>
                            )}

                            {/* ACTIONS */}
                            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="rounded-xl bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0D665F]"
                                >
                                    Submit Request
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}

        </div>
    );
}