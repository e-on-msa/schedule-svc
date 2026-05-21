// schedule-svc/src/routes/regionRouter.js
const express = require("express");
const regionController = require("../controllers/regionController");

const router = express.Router();

router.get("/", regionController.getAllRegions);
router.get("/search", regionController.searchRegionsByName);

module.exports = router;