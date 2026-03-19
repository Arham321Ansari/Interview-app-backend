const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    questions: [String],
    answers: [{
        type: String
    }],
    aiScore: String,
    aiFeedback: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Interview",interviewSchema);
