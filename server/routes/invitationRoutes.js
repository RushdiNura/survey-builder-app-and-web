const express = require("express");
const { sendInvitations } = require("../controllers/invitationController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.post("/:surveyId", sendInvitations);

module.exports = router;
