// schedule-svc/src/app.js
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  return res.json({
    service: "schedule-svc",
    status: "ok",
  });
});

module.exports = app;