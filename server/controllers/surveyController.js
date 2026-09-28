const Survey = require("../models/Survey");
const Response = require("../models/Response");

// POST /api/surveys
exports.createSurvey = async (req, res, next) => {
  try {
    const { title, description, category, questions, expiresAt, anonymousAllowed, scheduledPublishAt } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const survey = await Survey.create({
      owner: req.user._id,
      title,
      description,
      category,
      questions: questions || [],
      expiresAt: expiresAt || null,
      scheduledPublishAt: scheduledPublishAt || null,
      anonymousAllowed: anonymousAllowed !== undefined ? anonymousAllowed : true,
    });
    res.status(201).json(survey);
  } catch (err) {
    next(err);
  }
};

// GET /api/surveys  (owner's surveys, with search/filter)
exports.getMySurveys = async (req, res, next) => {
  try {
    const { search, category, status, sort } = req.query;
    const query = { owner: req.user._id };
    if (search) query.title = { $regex: search, $options: "i" };
    if (category) query.category = category;
    if (status) query.status = status;

    const sortMap = { newest: "-createdAt", oldest: "createdAt", title: "title" };
    const surveys = await Survey.find(query).sort(sortMap[sort] || "-createdAt");
    res.json(surveys);
  } catch (err) {
    next(err);
  }
};

// GET /api/surveys/:id  (owner view, includes questions + status + response count)
exports.getSurveyById = async (req, res, next) => {
  try {
    const survey = await Survey.findOne({ _id: req.params.id, owner: req.user._id });
    if (!survey) return res.status(404).json({ message: "Survey not found" });
    const responseCount = await Response.countDocuments({ survey: survey._id });
    res.json({ ...survey.toJSON(), responseCount });
  } catch (err) {
    next(err);
  }
};

// PUT /api/surveys/:id
exports.updateSurvey = async (req, res, next) => {
  try {
    const survey = await Survey.findOne({ _id: req.params.id, owner: req.user._id });
    if (!survey) return res.status(404).json({ message: "Survey not found" });

    const fields = ["title", "description", "category", "questions", "expiresAt", "anonymousAllowed", "scheduledPublishAt"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) survey[f] = req.body[f];
    });
    await survey.save();
    res.json(survey);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/surveys/:id/status  { status: "published" | "draft" | "closed" }
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["draft", "published", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const survey = await Survey.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { status },
      { new: true }
    );
    if (!survey) return res.status(404).json({ message: "Survey not found" });
    res.json(survey);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/surveys/:id
exports.deleteSurvey = async (req, res, next) => {
  try {
    const survey = await Survey.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!survey) return res.status(404).json({ message: "Survey not found" });
    await Response.deleteMany({ survey: survey._id });
    res.json({ message: "Survey deleted" });
  } catch (err) {
    next(err);
  }
};

// GET /api/surveys/public/:slug  (no auth — for respondents filling the survey)
exports.getPublicSurvey = async (req, res, next) => {
  try {
    const survey = await Survey.findOne({ shareSlug: req.params.slug });
    if (!survey) return res.status(404).json({ message: "Survey not found" });
    if (survey.status !== "published") {
      return res.status(403).json({ message: "This survey is not currently accepting responses" });
    }
    if (survey.isExpired) {
      return res.status(403).json({ message: "This survey has expired" });
    }
    res.json(survey);
  } catch (err) {
    next(err);
  }
};
