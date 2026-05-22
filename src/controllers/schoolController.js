// schedule-svc/src/controllers/schoolController.js
const schoolSyncService = require("../services/schoolSyncService");

async function searchSchools(req, res, next) {
    try {
        const query =
            typeof req.query.query === "string" ? req.query.query : "";
        const results = await schoolSyncService.searchSchools(query);

        return res.json(results);
    } catch (error) {
        next(error);
    }
}

async function searchSchoolBySchoolCode(req, res, next) {
    try {
        const query =
            typeof req.query.query === "string" ? req.query.query.trim() : "";

        if (!query) {
            return res.status(400).json({
                error: "학교 코드를 입력해주세요",
            });
        }

        const result = await schoolSyncService.searchSchoolBySchoolCode(query);

        return res.json(result);
    } catch (error) {
        next(error);
    }
}

async function syncSchools(req, res, next) {
    try {
        const result = await schoolSyncService.syncSchoolsFromNeis();

        return res.json({
            success: true,
            message: "학교 마스터 동기화가 완료되었습니다.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    searchSchools,
    searchSchoolBySchoolCode,
    syncSchools,
};
