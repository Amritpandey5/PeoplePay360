import type { Contract } from "@/types/contract";

const CONTRACTS_KEY = "peoplepay360_contracts";

export function getContracts(): Contract[] {
    if (typeof window === "undefined") {
        return [];
    }

    const stored = localStorage.getItem(CONTRACTS_KEY);

    if (!stored) {
        return [];
    }

    try {
        return JSON.parse(stored);
    } catch {
        return [];
    }
}

export function saveContracts(contracts: Contract[]) {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.setItem(
        CONTRACTS_KEY,
        JSON.stringify(contracts)
    );

    window.dispatchEvent(
        new Event("peoplepay360-contracts-updated")
    );
}

export function getContractStatus(
    contract: Contract
) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(
        `${contract.startDate}T00:00:00`
    );

    const endDate = new Date(
        `${contract.endDate}T00:00:00`
    );

    if (today < startDate) {
        return "upcoming";
    }

    if (today > endDate) {
        return "expired";
    }

    return "active";
}

export function createContract(
    contractData: Omit<Contract, "id" | "createdAt">
) {
    const contracts = getContracts();

    const contract: Contract = {
        ...contractData,
        id: `CON-${String(
            contracts.length + 1
        ).padStart(4, "0")}`,
        createdAt: new Date().toISOString(),
    };

    saveContracts([
        ...contracts,
        contract,
    ]);

    return contract;
}

export function subscribeToContractChanges(
    listener: () => void
) {
    if (typeof window === "undefined") {
        return () => {};
    }

    const handler = () => listener();

    window.addEventListener(
        "peoplepay360-contracts-updated",
        handler
    );

    window.addEventListener(
        "storage",
        handler
    );

    return () => {
        window.removeEventListener(
            "peoplepay360-contracts-updated",
            handler
        );

        window.removeEventListener(
            "storage",
            handler
        );
    };
}