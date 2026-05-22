// schedule-svc/src/routes/schoolScheduleRouter.js
const express = require("express");
const schoolController = require("../controllers/schoolController");

const router = express.Router();

router.get("/schools", schoolController.searchSchools);
router.get("/schools/code", schoolController.searchSchoolBySchoolCode);

module.exports = router;
