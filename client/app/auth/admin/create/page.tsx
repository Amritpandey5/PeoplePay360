"use client";

import { FormEvent, useState } from "react";

export default function CompanySignup() {
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch("http://localhost:5000/api/admin/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!data.success) {
                setMessage(data.message || "Unable to create company");
                return;
            }

            setMessage(`Company created successfully. ID: ${data.companyId}`);

            setFormData({
                name: "",
                location: "",
                email: "",
                password: ""
            });
        } catch (error) {
            setMessage("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md rounded-xl bg-white p-6 shadow-md"
            >
                <h1 className="mb-6 text-2xl font-semibold">
                    Company Signup
                </h1>

                <div className="mb-4">
                    <label
                        htmlFor="name"
                        className="mb-1 block text-sm font-medium"
                    >
                        Company Name
                    </label>

                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter company name"
                        className="w-full rounded-md border px-3 py-2 outline-none focus:border-black"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label
                        htmlFor="location"
                        className="mb-1 block text-sm font-medium"
                    >
                        Location
                    </label>

                    <input
                        id="location"
                        name="location"
                        type="text"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Enter company location"
                        className="w-full rounded-md border px-3 py-2 outline-none focus:border-black"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label
                        htmlFor="email"
                        className="mb-1 block text-sm font-medium"
                    >
                        Email
                    </label>

                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter company email"
                        className="w-full rounded-md border px-3 py-2 outline-none focus:border-black"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label
                        htmlFor="password"
                        className="mb-1 block text-sm font-medium"
                    >
                        Password
                    </label>

                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                        className="w-full rounded-md border px-3 py-2 outline-none focus:border-black"
                        required
                    />
                </div>

                {message && (
                    <p className="mb-4 text-sm text-gray-700">
                        {message}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-black px-4 py-2 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? "Creating..." : "Create Company"}
                </button>
            </form>
        </div>
    );
}