import mongoose, { Schema } from "mongoose";
import type {InferSchemaType } from "mongoose"

const ProjectSchema = new Schema({
    initiated_by: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: "Manager",
    },
    to: Array({
        required: true,
        type: Schema.Types.ObjectId,
        ref: "Employee",
    }),
    status: {
        type: String,
        enum: ["init", "completed", "process", "abroted", "paused"]
    },
    date: {
        required: true,
        type: Date
    },
    duration: {
        type:String,
        required:true
    },

}, {
        timestamps: true
    }
)


export type ProjectType = InferSchemaType<typeof ProjectSchema>

export default mongoose.model("Transaction", ProjectSchema)