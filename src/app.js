// schedule-svc/src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const regionRouter = require("./routes/regionRouter");
const internalRegionRouter = require("./routes/internalRegionRouter");
const schoolScheduleRouter = require("./routes/schoolScheduleRouter");
const internalSchoolRouter = require("./routes/internalSchoolRouter");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    return res.json({
        service: "schedule-svc",
        status: "ok",
    });
});

app.use("/api/regions", regionRouter);
app.use("/api/schoolSchedule", schoolScheduleRouter);

app.use("/internal/regions", internalRegionRouter);
app.use("/internal/schools", internalSchoolRouter);

app.use((err, req, res, next) => {
    console.error("[schedule-svc error]", err);

    const rawStatus = Number(err.status ?? err.statusCode);
    const status =
        Number.isInteger(rawStatus) && rawStatus >= 400 && rawStatus < 600
            ? rawStatus
            : 500;
    return res.status(status).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

module.exports = app;
