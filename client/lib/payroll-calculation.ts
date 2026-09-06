import type { Employee } from "@/types/employee";
import type {
  SalaryComponent,
  SalaryFrequency,
  SalaryStructure,
} from "@/types/salary-structure";
import type {
  SalaryRule,
  SalaryRuleCalculation,
} from "@/types/salary-rule";
import type { PayRunEmployee } from "@/types/pay-run";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type PayrollCalculationInput = {
  employee: Employee;
  contractId: string;
  salaryStructure: SalaryStructure;
  salaryRules: SalaryRule[];
  payRunFrequency: SalaryFrequency;
};

export type AppliedSalaryRule = {
  ruleId: string;
  ruleName: string;
  code: string;
  type: SalaryRule["type"];
  amount: number;
  isStatutory: boolean;
};

export type PayrollCalculationResult = {
  employee: PayRunEmployee;
  appliedRules: AppliedSalaryRule[];
  warnings: string[];
};

export type PayRunTotals = {
  basic: number;
  earnings: number;
  gross: number;
  deductions: number;
  employerContributions: number;
  net: number;
  employerCost: number;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function safeNumber(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

/**
 * Converts a recurring amount into an annual amount.
 *
 * Assumption:
 * - monthly = 12 periods/year
 * - weekly = 52 periods/year
 * - daily = 365 periods/year
 * - yearly = 1 period/year
 */
function annualizeAmount(
  amount: number,
  frequency: SalaryFrequency
): number {
  const value = safeNumber(amount);

  switch (frequency) {
    case "monthly":
      return value * 12;

    case "weekly":
      return value * 52;

    case "daily":
      return value * 365;

    case "yearly":
      return value;

    default:
      return value;
  }
}

function convertAnnualToFrequency(
  annualAmount: number,
  frequency: SalaryFrequency
): number {
  const value = safeNumber(annualAmount);

  switch (frequency) {
    case "monthly":
      return value / 12;

    case "weekly":
      return value / 52;

    case "daily":
      return value / 365;

    case "yearly":
      return value;

    default:
      return value;
  }
}

function convertAmountToPayRunFrequency(
  amount: number,
  sourceFrequency: SalaryFrequency,
  payRunFrequency: SalaryFrequency
): number {
  const annualAmount = annualizeAmount(
    amount,
    sourceFrequency
  );

  return convertAnnualToFrequency(
    annualAmount,
    payRunFrequency
  );
}

/* -------------------------------------------------------------------------- */
/* Salary Structure                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Calculates a single Salary Structure component.
 */
function calculateStructureComponent(
  component: SalaryComponent,
  basicSalary: number,
  grossSalary: number,
  annualCtc: number,
  structureFrequency: SalaryFrequency,
  payRunFrequency: SalaryFrequency
): number {
  const value = safeNumber(component.value);

  switch (component.calculationType) {
    case "fixed":
      return convertAmountToPayRunFrequency(
        value,
        structureFrequency,
        payRunFrequency
      );

    case "percentage_basic":
      return basicSalary * (value / 100);

    case "percentage_gross":
      return grossSalary * (value / 100);

    case "percentage_ctc": {
      const annualAmount =
        annualCtc * (value / 100);

      return convertAnnualToFrequency(
        annualAmount,
        payRunFrequency
      );
    }

    default:
      return 0;
  }
}

/**
 * Finds the Basic component.
 */
function findBasicComponent(
  structure: SalaryStructure
): SalaryComponent | undefined {
  return structure.components.find(
    (component) =>
      component.type === "earning" &&
      component.name
        .trim()
        .toLowerCase()
        .includes("basic")
  );
}

/**
 * Calculates Basic Salary.
 *
 * If the structure contains a Basic component,
 * that component takes priority.
 *
 * Otherwise employee.basicSalary is used.
 */
function calculateBasicSalary(
  employee: Employee,
  structure: SalaryStructure,
  payRunFrequency: SalaryFrequency
): number {
  const basicComponent =
    findBasicComponent(structure);

  if (!basicComponent) {
    return roundCurrency(
      convertAmountToPayRunFrequency(
        employee.basicSalary,
        employee.paymentBasis,
        payRunFrequency
      )
    );
  }

  const basic = calculateStructureComponent(
    basicComponent,
    employee.basicSalary,
    employee.basicSalary,
    structure.annualCtc,
    structure.frequency,
    payRunFrequency
  );

  return roundCurrency(basic);
}

/* -------------------------------------------------------------------------- */
/* Salary Structure Components                                                 */
/* -------------------------------------------------------------------------- */

function calculateStructureEarnings(
  structure: SalaryStructure,
  basicSalary: number,
  payRunFrequency: SalaryFrequency
): number {
  let grossSalary = basicSalary;
  let totalEarnings = 0;

  const earningComponents =
    structure.components.filter(
      (component) =>
        component.type === "earning" &&
        !component.name
          .trim()
          .toLowerCase()
          .includes("basic")
    );

  for (const component of earningComponents) {
    const amount =
      calculateStructureComponent(
        component,
        basicSalary,
        grossSalary,
        structure.annualCtc,
        structure.frequency,
        payRunFrequency
      );

    const roundedAmount =
      roundCurrency(amount);

    totalEarnings += roundedAmount;

    /*
     * Gross-dependent earnings should be able
     * to use the earnings calculated before them.
     */
    grossSalary += roundedAmount;
  }

  return roundCurrency(totalEarnings);
}

function calculateStructureDeductions(
  structure: SalaryStructure,
  basicSalary: number,
  grossSalary: number,
  payRunFrequency: SalaryFrequency
): number {
  let totalDeductions = 0;

  const deductionComponents =
    structure.components.filter(
      (component) =>
        component.type === "deduction"
    );

  for (const component of deductionComponents) {
    const amount =
      calculateStructureComponent(
        component,
        basicSalary,
        grossSalary,
        structure.annualCtc,
        structure.frequency,
        payRunFrequency
      );

    totalDeductions += roundCurrency(amount);
  }

  return roundCurrency(totalDeductions);
}

function calculateStructureEmployerContributions(
  structure: SalaryStructure,
  basicSalary: number,
  grossSalary: number,
  payRunFrequency: SalaryFrequency
): number {
  let total = 0;

  const contributionComponents =
    structure.components.filter(
      (component) =>
        component.type ===
        "employer_contribution"
    );

  for (const component of contributionComponents) {
    const amount =
      calculateStructureComponent(
        component,
        basicSalary,
        grossSalary,
        structure.annualCtc,
        structure.frequency,
        payRunFrequency
      );

    total += roundCurrency(amount);
  }

  return roundCurrency(total);
}

/* -------------------------------------------------------------------------- */
/* Salary Rules                                                                */
/* -------------------------------------------------------------------------- */

function calculateRuleAmount(
  rule: SalaryRule,
  basicSalary: number,
  grossSalary: number,
  payRunFrequency: SalaryFrequency
): number {
  const value = safeNumber(rule.value);

  switch (rule.calculation) {
    case "fixed":
      return convertAmountToPayRunFrequency(
        value,
        rule.frequency,
        payRunFrequency
      );

    case "percentage_basic":
      return basicSalary * (value / 100);

    case "percentage_gross":
      return grossSalary * (value / 100);

    case "percentage_ctc":
      /*
       * SalaryRule does not contain annual CTC.
       * Therefore percentage_ctc cannot be
       * independently calculated here.
       */
      return 0;

    case "slab":
      /*
       * Current SalaryRule model has no slab
       * brackets/ranges, so we safely skip it.
       */
      return 0;

    default:
      return 0;
  }
}

function applyRuleCaps(
  amount: number,
  rule: SalaryRule
): number {
  let result = Math.max(0, amount);

  if (
    rule.maximumCap !== null &&
    Number.isFinite(rule.maximumCap)
  ) {
    result = Math.min(
      result,
      rule.maximumCap
    );
  }

  return roundCurrency(result);
}

function isRuleApplicable(
  rule: SalaryRule,
  grossSalary: number
): boolean {
  if (rule.status !== "active") {
    return false;
  }

  if (
    rule.minimumSalary !== null &&
    Number.isFinite(rule.minimumSalary) &&
    grossSalary < rule.minimumSalary
  ) {
    return false;
  }

  return true;
}

/**
 * Applies active Salary Rules in priority order.
 */
function calculateSalaryRules(
  rules: SalaryRule[],
  basicSalary: number,
  grossSalary: number,
  payRunFrequency: SalaryFrequency
): {
  deductions: number;
  employerContributions: number;
  earnings: number;
  appliedRules: AppliedSalaryRule[];
  warnings: string[];
} {
  let deductions = 0;
  let employerContributions = 0;
  let earnings = 0;

  const appliedRules: AppliedSalaryRule[] = [];
  const warnings: string[] = [];

  const sortedRules = [...rules]
    .filter(
      (rule) => rule.status === "active"
    )
    .sort(
      (a, b) => a.priority - b.priority
    );

  for (const rule of sortedRules) {
    if (
      !isRuleApplicable(
        rule,
        grossSalary
      )
    ) {
      continue;
    }

    if (
      rule.calculation === "slab"
    ) {
      warnings.push(
        `${rule.name} (${rule.code}) was skipped because slab calculation is not configured yet.`
      );

      continue;
    }

    if (
      rule.calculation ===
      "percentage_ctc"
    ) {
      warnings.push(
        `${rule.name} (${rule.code}) was skipped because SalaryRule percentage_ctc requires annual CTC context.`
      );

      continue;
    }

    const rawAmount =
      calculateRuleAmount(
        rule,
        basicSalary,
        grossSalary,
        payRunFrequency
      );

    const amount =
      applyRuleCaps(
        rawAmount,
        rule
      );

    if (amount <= 0) {
      continue;
    }

    appliedRules.push({
      ruleId: rule.id,
      ruleName: rule.name,
      code: rule.code,
      type: rule.type,
      amount,
      isStatutory: rule.isStatutory,
    });

    switch (rule.type) {
      case "earning":
        earnings += amount;
        break;

      case "deduction":
      case "tax":
        deductions += amount;
        break;

      case "employer_contribution":
        employerContributions += amount;
        break;
    }
  }

  return {
    deductions: roundCurrency(deductions),
    employerContributions:
      roundCurrency(
        employerContributions
      ),
    earnings: roundCurrency(earnings),
    appliedRules,
    warnings,
  };
}

/* -------------------------------------------------------------------------- */
/* Main Employee Payroll Calculation                                           */
/* -------------------------------------------------------------------------- */

export function calculateEmployeePayroll(
  input: PayrollCalculationInput
): PayrollCalculationResult {
  const {
    employee,
    contractId,
    salaryStructure,
    salaryRules,
    payRunFrequency,
  } = input;

  const warnings: string[] = [];

  /*
   * 1. Basic Salary
   */
  const basicSalary =
    calculateBasicSalary(
      employee,
      salaryStructure,
      payRunFrequency
    );

  /*
   * 2. Salary Structure Earnings
   */
  const structureEarnings =
    calculateStructureEarnings(
      salaryStructure,
      basicSalary,
      payRunFrequency
    );

  /*
   * 3. Initial Gross
   */
  const structureGross =
    roundCurrency(
      basicSalary +
        structureEarnings
    );

  /*
   * 4. Salary Structure Deductions
   */
  const structureDeductions =
    calculateStructureDeductions(
      salaryStructure,
      basicSalary,
      structureGross,
      payRunFrequency
    );

  /*
   * 5. Employer Contributions
   */
  const structureEmployerContributions =
    calculateStructureEmployerContributions(
      salaryStructure,
      basicSalary,
      structureGross,
      payRunFrequency
    );

  /*
   * 6. Global Salary Rules
   */
  const ruleResult =
    calculateSalaryRules(
      salaryRules,
      basicSalary,
      structureGross,
      payRunFrequency
    );

  warnings.push(
    ...ruleResult.warnings
  );

  /*
   * 7. Final totals
   */
  const totalEarnings =
    roundCurrency(
      structureEarnings +
        ruleResult.earnings
    );

  const grossSalary =
    roundCurrency(
      basicSalary +
        totalEarnings
    );

  const totalDeductions =
    roundCurrency(
      structureDeductions +
        ruleResult.deductions
    );

  const totalEmployerContributions =
    roundCurrency(
      structureEmployerContributions +
        ruleResult.employerContributions
    );

  const netSalary =
    roundCurrency(
      grossSalary -
        totalDeductions
    );

  const employerCost =
    roundCurrency(
      grossSalary +
        totalEmployerContributions
    );

  const payRunEmployee: PayRunEmployee = {
    employeeId: employee.id,
    employeeName: employee.name,
    contractId,
    salaryStructureId:
      salaryStructure.id,

    basicSalary,
    earnings: totalEarnings,
    deductions: totalDeductions,
    employerContributions:
      totalEmployerContributions,

    grossSalary,
    netSalary,
    employerCost,

    status: "calculated",
  };

  return {
    employee: payRunEmployee,
    appliedRules:
      ruleResult.appliedRules,
    warnings,
  };
}

/* -------------------------------------------------------------------------- */
/* PayRun Totals                                                               */
/* -------------------------------------------------------------------------- */

export function calculatePayRunTotals(
  employees: PayRunEmployee[]
): PayRunTotals {
  const totals = employees.reduce<PayRunTotals>(
    (result, employee) => {
      result.basic += employee.basicSalary;
      result.earnings += employee.earnings;
      result.gross += employee.grossSalary;
      result.deductions += employee.deductions;
      result.employerContributions +=
        employee.employerContributions;
      result.net += employee.netSalary;
      result.employerCost += employee.employerCost;

      return result;
    },
    {
      basic: 0,
      earnings: 0,
      gross: 0,
      deductions: 0,
      employerContributions: 0,
      net: 0,
      employerCost: 0,
    }
  );

  return {
    basic: roundCurrency(totals.basic),
    earnings: roundCurrency(totals.earnings),
    gross: roundCurrency(totals.gross),
    deductions: roundCurrency(
      totals.deductions
    ),
    employerContributions:
      roundCurrency(
        totals.employerContributions
      ),
    net: roundCurrency(totals.net),
    employerCost: roundCurrency(
      totals.employerCost
    ),
  };
}