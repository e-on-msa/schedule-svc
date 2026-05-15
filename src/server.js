// schedule-svc/src/server.js
require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 8082;

app.listen(PORT, () => {
  console.log(`schedule-svc running on port ${PORT}`);
});