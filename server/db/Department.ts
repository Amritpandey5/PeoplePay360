import mongoose, { Schema } from "mongoose";
import type {InferSchemaType} from "mongoose"
import { BaseFields, BaseOptions } from "./BaseModel";

const DepartmentSchema = new Schema(
  {
    ...BaseFields,

    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    head: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
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

DepartmentSchema.index({ code: 1 }, { unique: true });

export type DepartmentDocument = InferSchemaType<typeof DepartmentSchema>;

export default mongoose.model("Department", DepartmentSchema);