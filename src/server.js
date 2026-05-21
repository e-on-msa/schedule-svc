// schedule-svc/src/server.js
require("dotenv").config();

const app = require("./app");
const { sequelize } = require("../models");

const PORT = process.env.PORT || 8082;

async function startServer() {
    try {
        await sequelize.authenticate();

        console.log("DB connected");

        await sequelize.sync({
            alter: true,
        });

        console.log("DB sync completed");

        app.listen(PORT, () => {
            console.log(`schedule-svc listening on ${PORT}`);
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

startServer();