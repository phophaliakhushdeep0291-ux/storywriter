import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema({
    role: {
        type: String,
        enum: ["user", "assistant"],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    }
})

const ideaSessionSchema = new Schema(
    {
        // Which series this idea belongs to
        series: {
            type: Schema.Types.ObjectId,
            ref: "Series",
        },
        // Who created this session
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        // Your original raw idea
        raw_idea: {
            type: String,
            required: true,
        },
        // Full conversation history
        conversation: [messageSchema],

        // AI suggested theme and why
        suggested_theme: {
            type: String,
        },
        // Questions AI asked you
        ai_questions: [String],

        // Your answers to AI questions
        user_answers: [String],

        // AI self-questioning (internal debate)
        ai_internal_debate: [String],

        // Refined idea after debate
        refined_idea: {
            type: String,
        },
        // Final confirmed idea
        final_idea: {
            type: String,
        },
        // Current status
        status: {
            type: String,
            enum: ["brainstorming", "debating", "refining", "confirmed"],
            default: "brainstorming",
        },
        // How many debate rounds happened
        debate_rounds: {
            type: Number,
            default: 0,
        },
        // AI confidence score on the final idea
        confidence_score: {
            type: Number,
            min: 0,
            max: 100,
        },
        user_feedback: {
            rating: { type: Number, min: 1, max: 5 },
            liked_elements: [String],
            disliked_elements: [String],
            would_use_again: { type: Boolean }
        },
    },
    { timestamps: true }
);

export const IdeaSession = mongoose.model("IdeaSession", ideaSessionSchema);