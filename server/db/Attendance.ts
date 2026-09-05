import mongoose from "mongoose";

const attendanceSchema =
    new mongoose.Schema(
        {
            employeeId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Employee",
                required: true,
                index: true,
            },

            date: {
                type: String,
                required: true,
                index: true,
            },

            checkIn: {
                type: Date,
                default: null,
            },

            checkOut: {
                type: Date,
                default: null,
            },

            workedHours: {
                type: Number,
                default: 0,
                min: 0,
            },

            overtimeHours: {
                type: Number,
                default: 0,
                min: 0,
            },

            status: {
                type: String,
                enum: [
                    "present",
                    "late",
                    "half_day",
                    "absent",
                    "incomplete",
                    "early_checkout",
                ],
                required: true,
            },

            lateMinutes: {
                type: Number,
                default: 0,
                min: 0,
            },

            earlyCheckoutMinutes: {
                type: Number,
                default: 0,
                min: 0,
            },

            verification: {
                officeNetwork: {
                    type: Boolean,
                    default: false,
                },

                deviceVerified: {
                    type: Boolean,
                    default: false,
                },

                presenceVerified: {
                    type: Boolean,
                    default: false,
                },

                clientIp: {
                    type: String,
                    default: null,
                },

                verifiedAt: {
                    type: Date,
                    default: null,
                },
            },

            notes: {
                type: String,
                default: null,
            },
        },
        {
            timestamps: true,
        }
    );

/*
  One employee can have only one attendance
  record per date.
*/

attendanceSchema.index(
    {
        employeeId: 1,
        date: 1,
    },
    {
        unique: true,
    }
);

const AttendanceModel =
    mongoose.models.Attendance ||
    mongoose.model(
        "Attendance",
        attendanceSchema
    );

export default AttendanceModel;