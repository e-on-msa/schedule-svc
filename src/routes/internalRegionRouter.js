// schedule-svc/src/routes/internalRegionRouter.js
const express = require("express");
const regionController = require("../controllers/regionController");

const router = express.Router();

router.post("/sync", regionController.syncRegions);

module.exports = router;