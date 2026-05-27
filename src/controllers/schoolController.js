// schedule-svc/src/controllers/schoolController.js
const schoolSyncService = require("../services/schoolSyncService");
const mySchoolService = require("../services/mySchoolService");

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
                success: false,
                message: "학교 코드를 필수로 입력해야 합니다.",
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

async function getSchedule(req, res, next) {
    try {
        const { schoolCode } = req.params;
        const { year, grade } = req.query;

        if (!schoolCode) {
            return res.status(400).json({
                success: false,
                message: "학교 코드를 필수로 입력해야 합니다.",
            });
        }

        const schedule = await schoolSyncService.getSchoolSchedule(schoolCode, {
            year,
            grade,
        });

        return res.json(schedule);
    } catch (error) {
        next(error);
    }
}

async function getAllSchedule(req, res, next) {
    try {
        const { schoolCode, atptCode } = req.params;
        const { year, grade } = req.query;

        if (!schoolCode || !atptCode) {
            return res.status(400).json({
                success: false,
                message: "학교 코드와 교육청 코드는 필수입니다",
            });
        }

        const schedule = await schoolSyncService.getAllSchoolSchedule(
            schoolCode,
            atptCode,
            { year, grade },
        );

        return res.json(schedule);
    } catch (error) {
        next(error);
    }
}

async function validateSchool(req, res, next) {
    try {
        const schoolCode =
            typeof req.query.schoolCode === "string"
                ? req.query.schoolCode.trim()
                : null;

        if (!schoolCode) {
            return res.status(400).json({
                success: false,
                message: "학교 코드를 필수로 입력해야 합니다.",
            });
        }

        const result = await schoolSyncService.validateSchool(schoolCode);

        return res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

async function getMySchoolSchedule(req, res, next) {
    try {
        const userId = req.header("x-user-id");
        const { year, grade } = req.query;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "x-user-id 헤더가 필요합니다.",
            });
        }

        const { source, school } =
            await mySchoolService.getMySchoolByUserId(userId);

        const schedule = await schoolSyncService.getAllSchoolSchedule(
            school.schoolCode,
            school.atptCode,
            { year, grade },
        );

        return res.json({
            success: true,
            data: {
                source,
                school,
                schedule,
            },
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    searchSchools,
    searchSchoolBySchoolCode,
    syncSchools,
    getSchedule,
    getAllSchedule,
    validateSchool,
    getMySchoolSchedule,
};
