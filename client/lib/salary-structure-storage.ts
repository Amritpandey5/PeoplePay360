import type { SalaryStructure } from "@/types/salary-structure";

const SALARY_STRUCTURES_KEY =
    "peoplepay360_salary_structures";

export function getSalaryStructures(): SalaryStructure[] {
    if (typeof window === "undefined") {
        return [];
    }

    const stored = localStorage.getItem(
        SALARY_STRUCTURES_KEY
    );

    if (!stored) {
        return [];
    }

    try {
        return JSON.parse(stored);
    } catch {
        return [];
    }
}

export function saveSalaryStructures(
    structures: SalaryStructure[]
) {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.setItem(
        SALARY_STRUCTURES_KEY,
        JSON.stringify(structures)
    );

    window.dispatchEvent(
        new Event("peoplepay360-salary-structures-updated")
    );
}

export function getSalaryStructureById(
    id: string
): SalaryStructure | null {
    return (
        getSalaryStructures().find(
            (structure) => structure.id === id
        ) || null
    );
}

export function createSalaryStructure(
    structureData: Omit<
        SalaryStructure,
        "id" | "createdAt"
    >
): SalaryStructure {
    const structures = getSalaryStructures();

    const structure: SalaryStructure = {
        ...structureData,
        id: `SAL-${String(
            structures.length + 1
        ).padStart(4, "0")}`,
        createdAt: new Date().toISOString(),
    };

    saveSalaryStructures([
        ...structures,
        structure,
    ]);

    return structure;
}

export function updateSalaryStructure(
    id: string,
    structureData: Partial<
        Omit<SalaryStructure, "id" | "createdAt">
    >
): SalaryStructure | null {
    const structures = getSalaryStructures();

    const index = structures.findIndex(
        (structure) => structure.id === id
    );

    if (index === -1) {
        return null;
    }

    const updatedStructure = {
        ...structures[index],
        ...structureData,
    };

    const updatedStructures = [...structures];

    updatedStructures[index] =
        updatedStructure;

    saveSalaryStructures(updatedStructures);

    return updatedStructure;
}

export function deleteSalaryStructure(id: string): boolean {
    const structures = getSalaryStructures();
    const nextStructures = structures.filter(
        (structure) => structure.id !== id
    );

    if (nextStructures.length === structures.length) {
        return false;
    }

    saveSalaryStructures(nextStructures);

    return true;
}

export function subscribeToSalaryStructureChanges(
    listener: () => void
) {
    if (typeof window === "undefined") {
        return () => {};
    }

    const handler = () => listener();

    window.addEventListener(
        "peoplepay360-salary-structures-updated",
        handler
    );
    window.addEventListener("storage", handler);

    return () => {
        window.removeEventListener(
            "peoplepay360-salary-structures-updated",
            handler
        );
        window.removeEventListener("storage", handler);
    };
}
