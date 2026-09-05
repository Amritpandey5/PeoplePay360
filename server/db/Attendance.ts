import mongoose, { Schema } from "mongoose";

const AttendanceSchema = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    loginTime: {
      type: Date,
      default: null,
    },

    logoutTime: {
      type: Date,
      default: null,
    },

    totalWorkingMinutes: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["PRESENT", "HALF_DAY", "ABSENT"],
      default: "ABSENT",
    },
  },
  {
    timestamps: true,
  }
);

AttendanceSchema.index(
  { employee: 1, date: 1 },
  { unique: true }
);

export default mongoose.model("Attendance", AttendanceSchema);