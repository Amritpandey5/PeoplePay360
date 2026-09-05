import mongoose, { Schema } from "mongoose";
import type {InferSchemaType } from "mongoose"
import { BaseFields, BaseOptions } from "./BaseModel";
import { UserRole } from "../types/enums";

const UserSchema = new Schema(
  {
    ...BaseFields,

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

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.EMPLOYEE,
    },

    employee: {
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

UserSchema.index({ email: 1 }, { unique: true });

export type UserDocument = InferSchemaType<typeof UserSchema>;

export default mongoose.model("User", UserSchema);