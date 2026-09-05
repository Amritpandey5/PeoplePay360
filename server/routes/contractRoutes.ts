import { Router } from "express";
import { randomUUID } from "crypto";

const router = Router();

type ContractType =
  | "permanent"
  | "temporary"
  | "contract"
  | "internship";

type WageType = "monthly" | "hourly" | "daily";

type ContractStatus =
  | "draft"
  | "active"
  | "expired"
  | "terminated";

type Contract = {
  id: string;

  employeeId: string;

  contractType: ContractType;

  startDate: string;
  endDate?: string;

  department?: string;
  position?: string;

  wage: number;
  wageType: WageType;
  currency: string;

  salaryStructureId?: string;

  status: ContractStatus;

  notes?: string;

  createdAt: string;
  updatedAt: string;
};

const contracts: Contract[] = [];

/**
 * CREATE CONTRACT
 * POST /api/contracts
 */
router.post("/", (req, res) => {
  try {
    const {
      employeeId,
      contractType,
      startDate,
      endDate,
      department,
      position,
      wage,
      wageType,
      currency = "INR",
      salaryStructureId,
      status = "active",
      notes,
    } = req.body ?? {};

    if (
      !employeeId ||
      !contractType ||
      !startDate ||
      wage === undefined ||
      !wageType
    ) {
      return res.status(400).json({
        success: false,
        message:
          "employeeId, contractType, startDate, wage and wageType are required",
      });
    }

    if (Number(wage) < 0) {
      return res.status(400).json({
        success: false,
        message: "Wage cannot be negative",
      });
    }

    if (endDate && new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    /**
     * Prevent overlapping active contracts
     * for the same employee.
     */
    if (status === "active") {
      const newStart = new Date(startDate).getTime();
      const newEnd = endDate
        ? new Date(endDate).getTime()
        : Infinity;

      const overlappingContract = contracts.find((contract) => {
        if (
          contract.employeeId !== employeeId ||
          contract.status !== "active"
        ) {
          return false;
        }

        const existingStart = new Date(
          contract.startDate
        ).getTime();

        const existingEnd = contract.endDate
          ? new Date(contract.endDate).getTime()
          : Infinity;

        return (
          newStart <= existingEnd &&
          newEnd >= existingStart
        );
      });

      if (overlappingContract) {
        return res.status(409).json({
          success: false,
          message:
            "Employee already has an overlapping active contract",
          existingContractId: overlappingContract.id,
        });
      }
    }

    const now = new Date().toISOString();

    const contract: Contract = {
      id: randomUUID(),

      employeeId,

      contractType,

      startDate,
      endDate,

      department,
      position,

      wage: Number(wage),
      wageType,
      currency: String(currency).toUpperCase(),

      salaryStructureId,

      status,

      notes,

      createdAt: now,
      updatedAt: now,
    };

    contracts.push(contract);

    return res.status(201).json({
      success: true,
      message: "Contract created successfully",
      contract,
    });
  } catch (error) {
    console.error("Create contract error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/**
 * GET ALL CONTRACTS
 * GET /api/contracts
 *
 * Optional filters:
 * ?employeeId=EMP001
 * ?status=active
 * ?department=Engineering
 * ?contractType=permanent
 */
router.get("/", (req, res) => {
  try {
    const {
      employeeId,
      status,
      department,
      contractType,
      search,
    } = req.query;

    let result = [...contracts];

    if (employeeId) {
      result = result.filter(
        (contract) =>
          contract.employeeId.toLowerCase() ===
          String(employeeId).toLowerCase()
      );
    }

    if (status) {
      result = result.filter(
        (contract) =>
          contract.status.toLowerCase() ===
          String(status).toLowerCase()
      );
    }

    if (department) {
      result = result.filter(
        (contract) =>
          contract.department?.toLowerCase() ===
          String(department).toLowerCase()
      );
    }

    if (contractType) {
      result = result.filter(
        (contract) =>
          contract.contractType.toLowerCase() ===
          String(contractType).toLowerCase()
      );
    }

    if (search) {
      const searchText = String(search).toLowerCase();

      result = result.filter(
        (contract) =>
          contract.employeeId
            .toLowerCase()
            .includes(searchText) ||
          contract.position
            ?.toLowerCase()
            .includes(searchText) ||
          contract.department
            ?.toLowerCase()
            .includes(searchText)
      );
    }

    return res.status(200).json({
      success: true,
      data: result,
      total: result.length,
    });
  } catch (error) {
    console.error("Get contracts error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/**
 * GET SINGLE CONTRACT
 * GET /api/contracts/:id
 */
router.get("/:id", (req, res) => {
  try {
    const contract = contracts.find(
      (contract) => contract.id === req.params.id
    );

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    return res.status(200).json({
      success: true,
      contract,
    });
  } catch (error) {
    console.error("Get contract error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/**
 * UPDATE CONTRACT
 * PATCH /api/contracts/:id
 */
router.patch("/:id", (req, res) => {
  try {
    const index = contracts.findIndex(
      (contract) => contract.id === req.params.id
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    const existingContract = contracts[index];
    if (!existingContract) {
  return res.status(404).json({
    success: false,
    message: "Contract not found",
  });
}

    const {
      employeeId,
      contractType,
      startDate,
      endDate,
      department,
      position,
      wage,
      wageType,
      currency,
      salaryStructureId,
      status,
      notes,
    } = req.body ?? {};

    const finalEmployeeId =
      employeeId ?? existingContract.employeeId;

    const finalStartDate =
      startDate ?? existingContract.startDate;

    const finalEndDate =
      endDate !== undefined
        ? endDate
        : existingContract.endDate;

    const finalStatus =
      status ?? existingContract.status;

    /**
     * Validate dates
     */
    if (
      finalEndDate &&
      new Date(finalEndDate) < new Date(finalStartDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    /**
     * Validate wage
     */
    if (wage !== undefined && Number(wage) < 0) {
      return res.status(400).json({
        success: false,
        message: "Wage cannot be negative",
      });
    }

    /**
     * Prevent overlapping active contracts
     */
    if (finalStatus === "active") {
      const newStart = new Date(finalStartDate).getTime();

      const newEnd = finalEndDate
        ? new Date(finalEndDate).getTime()
        : Infinity;

      const overlappingContract = contracts.find(
        (contract, contractIndex) => {
          if (contractIndex === index) {
            return false;
          }

          if (
            contract.employeeId !== finalEmployeeId ||
            contract.status !== "active"
          ) {
            return false;
          }

          const existingStart = new Date(
            contract.startDate
          ).getTime();

          const existingEnd = contract.endDate
            ? new Date(contract.endDate).getTime()
            : Infinity;

          return (
            newStart <= existingEnd &&
            newEnd >= existingStart
          );
        }
      );

      if (overlappingContract) {
        return res.status(409).json({
          success: false,
          message:
            "Employee already has another overlapping active contract",
          existingContractId: overlappingContract.id,
        });
      }
    }

    const updatedContract: Contract = {
      ...existingContract,

      ...(employeeId !== undefined && {
        employeeId,
      }),

      ...(contractType !== undefined && {
        contractType,
      }),

      ...(startDate !== undefined && {
        startDate,
      }),

      ...(endDate !== undefined && {
        endDate,
      }),

      ...(department !== undefined && {
        department,
      }),

      ...(position !== undefined && {
        position,
      }),

      ...(wage !== undefined && {
        wage: Number(wage),
      }),

      ...(wageType !== undefined && {
        wageType,
      }),

      ...(currency !== undefined && {
        currency: String(currency).toUpperCase(),
      }),

      ...(salaryStructureId !== undefined && {
        salaryStructureId,
      }),

      ...(status !== undefined && {
        status,
      }),

      ...(notes !== undefined && {
        notes,
      }),

      updatedAt: new Date().toISOString(),
    };

    contracts[index] = updatedContract;

    return res.status(200).json({
      success: true,
      message: "Contract updated successfully",
      contract: updatedContract,
    });
  } catch (error) {
    console.error("Update contract error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/**
 * DELETE CONTRACT
 * DELETE /api/contracts/:id
 */
router.delete("/:id", (req, res) => {
  try {
    const index = contracts.findIndex(
      (contract) => contract.id === req.params.id
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    const deletedContract = contracts.splice(index, 1)[0];

    return res.status(200).json({
      success: true,
      message: "Contract deleted successfully",
      contract: deletedContract,
    });
  } catch (error) {
    console.error("Delete contract error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;