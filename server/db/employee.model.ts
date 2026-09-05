import mongoose from "mongoose";
import type { Employee } from "../types/employee.types.ts";
import { EmploymentStatus, UserRole } from "../types/enums.ts";

const employeeSchema = new mongoose.Schema<Employee>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    dob: {
      type: Date,
      required: true,
    },

    doj: {
      type: Date,
      required: true,
    },

    payout: {
      type: Number,
      required: true,
      min: 0,
    },

    allocation: {
      hospital: {
        amount: {
          type: Number,
          default: 0,
        },
      },

      cab: {
        amount: {
          type: Number,
          default: 0,
        },
      },

      house: {
        amount: {
          type: Number,
          required: true,
        },
      },
    },

    location: {
      city: {
        type: String,
        trim: true,
      },

      state: {
        type: String,
        trim: true,
      },

      country: {
        type: String,
        trim: true,
      },
    },

    hr: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HR",
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.EMPLOYEE,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(EmploymentStatus),
      default: EmploymentStatus.ACTIVE,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const EmployeeModel = mongoose.model<Employee>("Employee", employeeSchema);

export default EmployeeModel;