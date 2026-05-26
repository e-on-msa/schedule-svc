// schedule-svc/src/routes/internalAcademicScheduleRouter.js
const express = require("express");
const academicScheduleController = require("../controllers/academicScheduleController");
const requireInternalAccess = require("../middlewares/requireInternalAccess");

const router = express.Router();

router.use(requireInternalAccess);

router.post("/sync", academicScheduleController.syncAcademicSchedules);
router.post(
    "/batch",
    academicScheduleController.runAcademicScheduleBatchController,
);

module.exports = router;
