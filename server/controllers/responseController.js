const Survey = require("../models/Survey");
const Response = require("../models/Response");
const { emitNewResponse } = require("../utils/socket");

// POST /api/responses/:slug
// body: { respondentToken, answers: [{ questionId, value }] }
exports.submitResponse = async (req, res, next) => {
  try {
    const survey = await Survey.findOne({ shareSlug: req.params.slug });
    if (!survey) return res.status(404).json({ message: "Survey not found" });
    if (survey.status !== "published") {
      return res.status(403).json({ message: "This survey is not currently accepting responses" });
    }
    if (survey.isExpired) {
      return res.status(403).json({ message: "This survey has expired" });
    }
    if (!survey.anonymousAllowed && !req.user) {
      return res.status(401).json({ message: "You must log in to respond to this survey" });
    }

    const { respondentToken, answers } = req.body;
    if (!respondentToken || !Array.isArray(answers)) {
      return res.status(400).json({ message: "respondentToken and answers[] are required" });
    }

    // Validate required questions were answered
    const requiredIds = survey.questions.filter((q) => q.required).map((q) => String(q._id));
    const answeredIds = new Set(answers.map((a) => String(a.questionId)));
    const missing = requiredIds.filter((id) => !answeredIds.has(id));
    if (missing.length) {
      return res.status(400).json({ message: "Missing required questions", missing });
    }

    const response = await Response.create({
      survey: survey._id,
      respondent: req.user ? req.user._id : null,
      respondentToken,
      answers,
    });

    emitNewResponse(String(survey._id), {
      responseId: response._id,
      submittedAt: response.submittedAt,
    });

    res.status(201).json(response);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "You have already submitted a response to this survey" });
    }
    next(err);
  }
};

// GET /api/responses/survey/:surveyId  (owner only — raw response list)
exports.getResponsesForSurvey = async (req, res, next) => {
  try {
    const survey = await Survey.findOne({ _id: req.params.surveyId, owner: req.user._id });
    if (!survey) return res.status(404).json({ message: "Survey not found" });

    const responses = await Response.find({ survey: survey._id }).sort("-submittedAt");
    res.json(responses);
  } catch (err) {
    next(err);
  }
};
