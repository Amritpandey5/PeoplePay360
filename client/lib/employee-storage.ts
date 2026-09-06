import type { Employee, User } from "@/types/employee";

const EMPLOYEES_KEY = "peoplepay360_employees";
const USERS_KEY = "peoplepay360_users";

type DataListener = () => void;

const listeners = new Set<DataListener>();

function notifyDataChanges() {
    listeners.forEach((listener) => listener());
}

export function getEmployees(): Employee[] {
    if (typeof window === "undefined") {
        return [];
    }

    const storedEmployees = localStorage.getItem(EMPLOYEES_KEY);

    if (!storedEmployees) {
        return [];
    }

    try {
        return JSON.parse(storedEmployees);
    } catch {
        return [];
    }
}

export function saveEmployees(employees: Employee[]) {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.setItem(
        EMPLOYEES_KEY,
        JSON.stringify(employees)
    );

    notifyDataChanges();
}

export function getEmployeeById(
    id: string
): Employee | null {
    const employees = getEmployees();

    return (
        employees.find(
            (employee) => employee.id === id
        ) || null
    );
}

export function updateEmployee(
    id: string,
    employeeData: Partial<
        Omit<Employee, "id" | "createdAt">
    >
): Employee | null {
    const employees = getEmployees();

    const employeeIndex = employees.findIndex(
        (employee) => employee.id === id
    );

    if (employeeIndex === -1) {
        return null;
    }

    const updatedEmployee = {
        ...employees[employeeIndex],
        ...employeeData,
    };

    const updatedEmployees = [...employees];

    updatedEmployees[employeeIndex] =
        updatedEmployee;

    saveEmployees(updatedEmployees);

    return updatedEmployee;
}

export function deleteEmployee(id: string): boolean {
    const employees = getEmployees();
    const nextEmployees = employees.filter(
        (employee) => employee.id !== id
    );

    if (nextEmployees.length === employees.length) {
        return false;
    }

    saveEmployees(nextEmployees);

    return true;
}

export function getUsers(): User[] {
    if (typeof window === "undefined") {
        return [];
    }

    const storedUsers = localStorage.getItem(USERS_KEY);

    if (!storedUsers) {
        return [];
    }

    try {
        return JSON.parse(storedUsers);
    } catch {
        return [];
    }
}

export function saveUsers(users: User[]) {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );

    notifyDataChanges();
}

export function subscribeToDataChanges(
    listener: DataListener
) {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}

export function createEmployee(
    employeeData: Omit<
        Employee,
        "id" | "createdAt" | "status"
    >
): Employee {
    const employees = getEmployees();

    const employee: Employee = {
        ...employeeData,
        id: `EMP-${String(
            employees.length + 1
        ).padStart(4, "0")}`,
        status: "active",
        createdAt: new Date().toISOString(),
    };

    saveEmployees([
        ...employees,
        employee,
    ]);

    return employee;
}

export function createUser(
    userData: Omit<User, "id" | "createdAt">
): User {
    const users = getUsers();

    const user: User = {
        ...userData,
        id: `USR-${String(
            users.length + 1
        ).padStart(4, "0")}`,
        createdAt: new Date().toISOString(),
    };

    saveUsers([
        ...users,
        user,
    ]);

    return user;
}
