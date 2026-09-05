import { Schema } from "mongoose";

export const BaseFields = {

    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },

    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },

    deletedAt: {
        type: Date,
        default: null,
    },
};

