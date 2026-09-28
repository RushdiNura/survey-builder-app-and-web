const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const QUESTION_TYPES = [
  "short-answer",
  "long-answer",
  "multiple-choice",
  "checkboxes",
  "dropdown",
  "rating",
  "yes-no",
  "image", // TODO: image-based questions (bonus feature)
  "file-upload", // TODO: file upload questions (bonus feature)
];

const questionSchema = new mongoose.Schema({
  type: { type: String, enum: QUESTION_TYPES, required: true },
  question: { type: String, required: true, trim: true },
  options: [{ type: String }], // used by multiple-choice / checkboxes / dropdown
  imageUrl: { type: String, default: null }, // used by "image" type — asset the survey owner uploaded
  required: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  // TODO: conditional logic — showIf: { questionId, equals }
});

const surveySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    category: { type: String, trim: true, default: "General" },
    questions: [questionSchema],
    status: { type: String, enum: ["draft", "published", "closed"], default: "draft" },
    shareSlug: { type: String, unique: true, default: () => nanoid(10) },
    anonymousAllowed: { type: Boolean, default: true },
    scheduledPublishAt: { type: Date, default: null }, // when set, scheduler auto-publishes a draft at this time
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

surveySchema.virtual("isExpired").get(function () {
  return this.expiresAt ? Date.now() > this.expiresAt.getTime() : false;
});

surveySchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Survey", surveySchema);
module.exports.QUESTION_TYPES = QUESTION_TYPES;
