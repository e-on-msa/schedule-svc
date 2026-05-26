// schedule-svc/src/controllers/academicScheduleController.js
const academicScheduleSyncService = require("../services/academicScheduleSyncService");
const {
    runAcademicScheduleBatch,
} = require("../jobs/academicScheduleBatchJob");

async function syncAcademicSchedules(req, res, next) {
    try {
        const { schoolCode, year } = req.body;

        if (!schoolCode) {
            return res.status(400).json({
                success: false,
                message: "schoolCode는 필수입니다.",
            });
        }

        if (year != null && !/^\d{4}$/.test(String(year))) {
            return res.status(400).json({
                success: false,
                message: "year는 4자리 연도여야 합니다.",
            });
        }

        const result = await academicScheduleSyncService.syncAcademicSchedules({
            schoolCode,
            year,
        });

        return res.json({
            success: true,
            message: "학사일정 동기화가 완료되었습니다.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

async function runAcademicScheduleBatchController(req, res, next) {
    try {
        const { years, limit } = req.body || {};

        const result = await runAcademicScheduleBatch({
            years,
            limit,
        });

        return res.json({
            success: true,
            message: "학사일정 batch 실행이 완료되었습니다.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    syncAcademicSchedules,
    runAcademicScheduleBatchController,
};
