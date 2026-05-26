// schedule-svc/src/routes/schoolScheduleRouter.js
const express = require("express");
const schoolController = require("../controllers/schoolController");

const router = express.Router();

router.get("/schools", schoolController.searchSchools);
router.get("/schools/code", schoolController.searchSchoolBySchoolCode);
router.get("/schools/:schoolCode/schedule", schoolController.getSchedule);
router.get("/schools/:schoolCode/:atptCode/schedule", schoolController.getAllSchedule);

module.exports = router;