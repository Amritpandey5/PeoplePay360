import mongoose, { Schema } from "mongoose";
import type {InferSchemaType } from "mongoose"

const CompanySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    Location: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    employees: Array({
        type: Schema.Types.ObjectId,
        ref: "User"
    }),
    managers: Array({
        type: Schema.Types.ObjectId,
        ref: "Manager"
    })
})



CompanySchema.index({ email: 1})

export type ManagerType = InferSchemaType<typeof CompanySchema>

export default mongoose.model("Manager", CompanySchema)