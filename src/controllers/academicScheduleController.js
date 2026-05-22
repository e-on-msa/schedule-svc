// schedule-svc/src/controllers/academicScheduleController.js
const academicScheduleSyncService = require("../services/academicScheduleSyncService");

async function syncAcademicSchedules(req, res, next) {
    try {
        const { schoolCode, year } = req.body;

        if (!schoolCode) {
            return res.status(400).json({
                success: false,
                message: "schoolCode는 필수입니다.",
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

module.exports = {
    syncAcademicSchedules,
};
