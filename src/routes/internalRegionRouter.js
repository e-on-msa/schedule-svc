// schedule-svc/src/routes/internalRegionRouter.js
const express = require("express");
const regionController = require("../controllers/regionController");
const requireInternalAccess = require("../middlewares/requireInternalAccess");

const router = express.Router();

router.use(requireInternalAccess);

router.post("/sync", regionController.syncRegions);

module.exports = router;