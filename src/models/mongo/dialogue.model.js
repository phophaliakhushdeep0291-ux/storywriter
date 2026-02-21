import mongoose, { Schema } from "mongoose";

const dialogueSchema = new Schema(
    {
        character: {
            type: Schema.Types.ObjectId,
            ref: "Character",
            required: true,
        },
        line: {
            type: String,
            required: true,
        },
        emotion: {
            type: String,
        },
        scene: {
            type: Schema.Types.ObjectId,
            ref: "Scene",
            required: true,
        },
    },
    { timestamps: true }
);

export const Dialogue = mongoose.model("Dialogue", dialogueSchema);