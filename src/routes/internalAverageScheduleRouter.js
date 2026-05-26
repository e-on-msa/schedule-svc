// schedule-svc/src/routes/internalAverageScheduleRouter.js
const express = require("express");
const averageScheduleController = require("../controllers/averageScheduleController");
const requireInternalAccess = require("../middlewares/requireInternalAccess");

const router = express.Router();

router.use(requireInternalAccess);

router.post("/generate", averageScheduleController.generateAllAverageSchedules);

router.post(
    "/region/:region/generate",
    averageScheduleController.generateAverageScheduleByRegion,
);

module.exports = router;
