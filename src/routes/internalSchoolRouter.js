// schedule-svc/src/routes/internalSchoolRouter.js
const express = require("express");
const schoolController = require("../controllers/schoolController");
const requireInternalAccess = require("../middlewares/requireInternalAccess");

const router = express.Router();

router.use(requireInternalAccess);

router.post("/sync", schoolController.syncSchools);
router.get("/validate", schoolController.validateSchool);

module.exports = router;
