import api from "./axios";

export type UserType = "EMPLOYEE" | "MANAGER";

export interface LoginData {
    email: string;
    password: string;
    userType: UserType;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    user?: {
        id: string;
        name: string;
        email: string;
        role: string;
        userType: UserType;
    };
}

export const signin = async (
    data: LoginData
): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(
        "/auth/signin",
        {
            email: data.email,
            password: data.password,
            type: data.userType === "MANAGER" ? "manager" : "employee",
            userType: data.userType,
        }
    );

    if (response.data.success && response.data.user?.id && typeof window !== "undefined") {
        localStorage.setItem("userId", response.data.user.id);
        localStorage.setItem("employeeId", response.data.user.id);
        localStorage.setItem("userType", response.data.user.userType);
    }

    return response.data;
};

export const getMe = async () => {
    const response = await api.get("/auth/me");

    return response.data;
};

export const logout = async () => {
    const response = await api.post("/auth/logout");

    if (typeof window !== "undefined") {
        localStorage.removeItem("userId");
        localStorage.removeItem("employeeId");
        localStorage.removeItem("employee_id");
        localStorage.removeItem("userType");
    }

    return response.data;
};

export const adminSignin = async ({
    email,
    password
}: {
    email: string,
    password: string
}) => {
    const response = await api.post("/admin/signin", {
        email,
        password,
    })
    return response.data
}
