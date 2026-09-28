const express = require("express");
const { getAnalytics, exportResponses } = require("../controllers/analyticsController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/:surveyId", getAnalytics);
router.get("/:surveyId/export", exportResponses);

module.exports = router;
