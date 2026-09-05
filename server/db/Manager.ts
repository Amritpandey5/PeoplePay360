import mongoose, { Schema } from "mongoose";
import type { InferSchemaType } from "mongoose";
import {
  ManagerRole,
  Department,
} from "../types/enums";

const ManagerSchema = new Schema(
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
      select: false,
    },

    userType: {
      type: String,
      enum: ["MANAGER"],
      default: "MANAGER",
      required: true,
    },

    role: {
      type: String,
      enum: Object.values(ManagerRole),
      default: ManagerRole.HR,
    },

    dob: {
      type: Date,
    },

    joining: {
      type: Date,
    },

    department: {
      type: String,
      enum: Object.values(Department),
    },

    company: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Company",
    },

    employees: [
      {
        type: Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],
  },

  {
    timestamps: true,
  }
);

// ManagerSchema.index({ email: 1 }, { unique: true });

export type ManagerType = InferSchemaType<typeof ManagerSchema>;

export default mongoose.model("Manager", ManagerSchema);