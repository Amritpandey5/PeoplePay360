import mongoose, { Schema } from "mongoose";
import type { InferSchemaType } from "mongoose";
import {
  EmployeeRole,
  EmployeeStatus,
  Gender,
} from "../types/enums";

const EmployeeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: Object.values(Gender),
      required: true,
    },

    phone: {
      type: String,
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
      select: false,
    },

    userType: {
      type: String,
      enum: ["EMPLOYEE"],
      default: "EMPLOYEE",
      required: true,
    },

    role: {
      type: String,
      enum: Object.values(EmployeeRole),
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(EmployeeStatus),
      default: EmployeeStatus.ACTIVE,
      required: true,
    },

    dob: {
      type: Date,
      required: true,
    },

    joining: {
      type: Date,
      required: true,
    },

    payout: {
      ctc: {
        type: Number,
        required: true,
        min: 0,
      },

      basicSalary: {
        type: Number,
        required: true,
        min: 0,
      },

      allowances: [
        {
          name: {
            type: String,
            required: true,
            trim: true,
          },

          amount: {
            type: Number,
            required: true,
            min: 0,
          },
        },
      ],

      deductions: [
        {
          name: {
            type: String,
            required: true,
            trim: true,
          },

          amount: {
            type: Number,
            required: true,
            min: 0,
          },
        },
      ],
    },

    allocation: {
      type: Number,
      min: 0,
      max: 100,
    },

    location: {
      type: String,
      trim: true,
    },

    manager: {
      type: Schema.Types.ObjectId,
      ref: "Manager",
    },
  },

  {
    timestamps: true,
  }
);

// EmployeeSchema.index({ email: 1 }, { unique: true });

export type EmployeeType = InferSchemaType<typeof EmployeeSchema>;

export default mongoose.model("Employee", EmployeeSchema);