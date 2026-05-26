// schedule-svc/src/routes/averageScheduleRouter.js
const express = require("express");
const averageScheduleController = require("../controllers/averageScheduleController");

const router = express.Router();

router.get(
    "/region/:region/schedule",
    averageScheduleController.getAverageScheduleByRegion,
);

module.exports = router;
