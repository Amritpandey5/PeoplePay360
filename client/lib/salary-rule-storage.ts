import type { SalaryRule } from "@/types/salary-rule";

const SALARY_RULES_KEY = "peoplepay360_salary_rules";

export function getSalaryRules(): SalaryRule[] {
    if (typeof window === "undefined") {
        return [];
    }

    const stored = localStorage.getItem(
        SALARY_RULES_KEY
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

export function saveSalaryRules(
    rules: SalaryRule[]
) {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.setItem(
        SALARY_RULES_KEY,
        JSON.stringify(rules)
    );

    window.dispatchEvent(
        new Event("peoplepay360-salary-rules-updated")
    );
}

export function getSalaryRuleById(
    id: string
): SalaryRule | null {
    return (
        getSalaryRules().find(
            (rule) => rule.id === id
        ) || null
    );
}

export function createSalaryRule(
    ruleData: Omit<
        SalaryRule,
        "id" | "createdAt"
    >
): SalaryRule {
    const rules = getSalaryRules();

    const rule: SalaryRule = {
        ...ruleData,
        id: `RULE-${String(
            rules.length + 1
        ).padStart(4, "0")}`,
        createdAt: new Date().toISOString(),
    };

    saveSalaryRules([
        ...rules,
        rule,
    ]);

    return rule;
}

export function updateSalaryRule(
    id: string,
    ruleData: Partial<
        Omit<SalaryRule, "id" | "createdAt">
    >
): SalaryRule | null {
    const rules = getSalaryRules();

    const index = rules.findIndex(
        (rule) => rule.id === id
    );

    if (index === -1) {
        return null;
    }

    const updatedRule = {
        ...rules[index],
        ...ruleData,
    };

    const updatedRules = [...rules];

    updatedRules[index] = updatedRule;

    saveSalaryRules(updatedRules);

    return updatedRule;
}

export function deleteSalaryRule(
    id: string
) {
    const rules = getSalaryRules();

    saveSalaryRules(
        rules.filter(
            (rule) => rule.id !== id
        )
    );
}

export function subscribeToSalaryRuleChanges(
    listener: () => void
) {
    if (typeof window === "undefined") {
        return () => {};
    }

    const handler = () => listener();

    window.addEventListener(
        "peoplepay360-salary-rules-updated",
        handler
    );
    window.addEventListener("storage", handler);

    return () => {
        window.removeEventListener(
            "peoplepay360-salary-rules-updated",
            handler
        );
        window.removeEventListener("storage", handler);
    };
}
