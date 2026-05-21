// schedule-svc/src/app.js
const express = require("express");
const cors = require("cors");
const regionRouter = require("./routes/regionRouter");
const internalRegionRouter = require("./routes/internalRegionRouter");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/regions", regionRouter);
app.use("/internal/regions", internalRegionRouter);

app.get("/health", (req, res) => {
    return res.json({
        service: "schedule-svc",
        status: "ok",
    });
});

app.use((err, req, res, next) => {
    console.error("[schedule-svc error]", err);

    return res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

module.exports = app;
