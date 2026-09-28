const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true }, // string | string[] | number
  },
  { _id: false }
);

const responseSchema = new mongoose.Schema(
  {
    survey: { type: mongoose.Schema.Types.ObjectId, ref: "Survey", required: true },
    respondent: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // null = anonymous
    respondentToken: { type: String, required: true }, // browser-generated id, used to block duplicate submits
    answers: [answerSchema],
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent the same browser/token from submitting the same survey twice
responseSchema.index({ survey: 1, respondentToken: 1 }, { unique: true });

module.exports = mongoose.model("Response", responseSchema);
