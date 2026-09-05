import mongoose, { Schema } from "mongoose";
import type { InferSchemaType} from "mongoose"
import { BaseFields } from "./BaseModel";

const PositionSchema = new Schema(
  {
    ...BaseFields,

    title: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
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

PositionSchema.index(
  {
    department: 1,
    code: 1,
  },
  {
    unique: true,
  }
);

export type PositionDocument = InferSchemaType<typeof PositionSchema>;

export default mongoose.model("Position", PositionSchema);