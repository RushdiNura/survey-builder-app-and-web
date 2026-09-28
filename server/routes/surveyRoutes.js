const express = require("express");
const {
  createSurvey,
  getMySurveys,
  getSurveyById,
  updateSurvey,
  updateStatus,
  deleteSurvey,
  getPublicSurvey,
} = require("../controllers/surveyController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Public (no auth) — must come before "/:id" to avoid collision
router.get("/public/:slug", getPublicSurvey);

router.use(protect);
router.post("/", createSurvey);
router.get("/", getMySurveys);
router.get("/:id", getSurveyById);
router.put("/:id", updateSurvey);
router.patch("/:id/status", updateStatus);
router.delete("/:id", deleteSurvey);

module.exports = router;
