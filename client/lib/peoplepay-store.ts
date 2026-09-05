import type { Employee, User } from "@/types/employee";

const EMPLOYEES_KEY = "peoplepay360_employees";
const USERS_KEY = "peoplepay360_users";
const DATA_CHANGED_EVENT = "peoplepay360-data-changed";

const isBrowser = () => typeof window !== "undefined";

const notifyDataChanged = () => {
    if (!isBrowser()) {
        return;
    }

    window.dispatchEvent(new Event(DATA_CHANGED_EVENT));
};

export const getEmployees = (): Employee[] => {
    if (!isBrowser()) {
        return [];
    }

    try {
        const stored = window.localStorage.getItem(EMPLOYEES_KEY);

        if (!stored) {
            return [];
        }

        const parsed = JSON.parse(stored);

        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const saveEmployees = (employees: Employee[]) => {
    if (!isBrowser()) {
        return;
    }

    window.localStorage.setItem(
        EMPLOYEES_KEY,
        JSON.stringify(employees)
    );

    notifyDataChanged();
};

export const addEmployee = (employee: Employee) => {
    const employees = getEmployees();

    saveEmployees([
        ...employees,
        employee,
    ]);
};

export const getUsers = (): User[] => {
    if (!isBrowser()) {
        return [];
    }

    try {
        const stored = window.localStorage.getItem(USERS_KEY);

        if (!stored) {
            return [];
        }

        const parsed = JSON.parse(stored);

        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const saveUsers = (users: User[]) => {
    if (!isBrowser()) {
        return;
    }

    window.localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );

    notifyDataChanged();
};

export const addUser = (user: User) => {
    const users = getUsers();

    saveUsers([
        ...users,
        user,
    ]);
};

export const subscribeToDataChanges = (
    callback: () => void
) => {
    if (!isBrowser()) {
        return () => {};
    }

    window.addEventListener(
        DATA_CHANGED_EVENT,
        callback
    );

    window.addEventListener(
        "storage",
        callback
    );

    return () => {
        window.removeEventListener(
            DATA_CHANGED_EVENT,
            callback
        );

        window.removeEventListener(
            "storage",
            callback
        );
    };
};