// schedule-svc/src/controllers/averageScheduleController.js
const averageScheduleService = require("../services/averageScheduleService");

async function getAverageScheduleByRegion(req, res, next) {
    try {
        const { region } = req.params;
        const { year, grade } = req.query;

        const result = await averageScheduleService.getAverageScheduleByRegion({
            regionName: region,
            year,
            grade,
        });

        return res.json(result);
    } catch (error) {
        next(error);
    }
}

async function generateAllAverageSchedules(req, res, next) {
    try {
        const { year } = req.body || {};

        const result = await averageScheduleService.generateAllAverageSchedules(
            {
                year,
            },
        );

        return res.json({
            success: true,
            message: "전체 지역 평균 학사일정 생성이 완료되었습니다.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

async function generateAverageScheduleByRegion(req, res, next) {
    try {
        const { region } = req.params;
        const { year } = req.body || {};

        const result =
            await averageScheduleService.generateAverageScheduleByRegion({
                regionName: region,
                year,
            });

        return res.json({
            success: true,
            message: "지역 평균 학사일정 생성이 완료되었습니다.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAverageScheduleByRegion,
    generateAllAverageSchedules,
    generateAverageScheduleByRegion,
};
