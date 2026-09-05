import mongoose, {type InferSchemaType, Schema } from "mongoose";
import { BaseFields } from "./BaseModel";

const DaySchema = new Schema(
  {
    day: {
      type: String,
      required: true,
      enum: [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ],
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    breakMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const WorkingScheduleSchema = new Schema(
  {
    ...BaseFields,

    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["FULL_TIME", "PART_TIME", "SHIFT"],
      default: "FULL_TIME",
    },

    weeklyHours: {
      type: Number,
      default: 0,
    },

    days: [DaySchema],

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


// WorkingScheduleSchema.pre("save", function (next) {
//   let totalMinutes = 0;

//   this.days.forEach((day: any) => {
//     const [sh, sm] = day.startTime.split(":").map(Number);
//     const [eh, em] = day.endTime.split(":").map(Number);

//     const start = sh * 60 + sm;
//     const end = eh * 60 + em;

//     totalMinutes += end - start - day.breakMinutes;
//   });

//   this.weeklyHours = totalMinutes / 60;

//   next();
// });

// export type WorkingScheduleDocument = InferSchemaType<
//   typeof WorkingScheduleSchema
// >;

export default mongoose.model(
  "WorkingSchedule",
//   WorkingScheduleSchema
);