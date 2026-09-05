import mongoose, { type InferSchemaType, Schema } from "mongoose";
import { BaseFields } from "./BaseModel";
import { EmploymentStatus } from "../types/enums";

const EmployeeSchema = new Schema(
  {
    ...BaseFields,

    employeeCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
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

    phone: String,

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
    },

    dateOfBirth: Date,

    joiningDate: {
      type: Date,
      required: true,
    },

    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    position: {
      type: Schema.Types.ObjectId,
      ref: "Position",
      required: true,
    },

    manager: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    workingSchedule: {
      type: Schema.Types.ObjectId,
      ref: "WorkingSchedule",
    },

    status: {
      type: String,
      enum: Object.values(EmploymentStatus),
      default: EmploymentStatus.ACTIVE,
    },

    bankDetails: {
      bankName: String,
      accountHolder: String,
      accountNumber: String,
      ifscCode: String,
    },

    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },

    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

EmployeeSchema.index({ employeeCode: 1 }, { unique: true });
EmployeeSchema.index({ email: 1 }, { unique: true });
EmployeeSchema.index({ department: 1 });
EmployeeSchema.index({ manager: 1 });

export type EmployeeDocument = InferSchemaType<typeof EmployeeSchema>;

export default mongoose.model("Employee", EmployeeSchema);