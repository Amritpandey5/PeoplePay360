import mongoose, { Schema } from "mongoose";
import type {InferSchemaType } from "mongoose"

const TranactionSchema = new Schema({
    initiated_by: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: "Manager",
    },
    to: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: "Employee",
    },
    utr: {
        required: true,
        type: String
    },
    status: {
        type: String,
        enum: ["init", ""]
    },
    date: {
        required: true,
        type: Date
    }

}, {
        timestamps: true
})


export type TransactionType = InferSchemaType<typeof TranactionSchema>

export default mongoose.model("Transaction", TranactionSchema)