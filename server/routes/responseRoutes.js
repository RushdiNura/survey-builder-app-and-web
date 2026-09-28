const express = require("express");
const { submitResponse, getResponsesForSurvey } = require("../controllers/responseController");
const { protect, optionalAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/:slug", optionalAuth, submitResponse); // public submission, identifies user if logged in
router.get("/survey/:surveyId", protect, getResponsesForSurvey); // owner only

module.exports = router;
