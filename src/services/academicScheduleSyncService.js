// schedule-svc/src/services/academicScheduleSyncService.js
const { School, AcademicSchedule } = require("../../models");
const { fetchAcademicSchedulesFromNeis } = require("./neisClient");
const {
    normalizeAcademicSchedule,
} = require("../utils/academicScheduleNormalizer");

function getDefaultSyncYears() {
    const currentYear = new Date().getFullYear();

    return [currentYear - 1, currentYear].map(String);
}

async function syncAcademicSchedulesBySchoolAndYear({ schoolCode, year }) {
    const school = await School.findOne({
        where: {
            school_code: schoolCode,
        },
    });

    if (!school) {
        const error = new Error("학교를 찾을 수 없습니다.");
        error.status = 404;
        throw error;
    }

    const rawSchedules = await fetchAcademicSchedulesFromNeis({
        atptCode: school.atpt_code,
        schoolCode: school.school_code,
        year: String(year),
    });

    const schedules = rawSchedules
        .filter((raw) => raw.AA_YMD && raw.EVENT_NM)
        .map(normalizeAcademicSchedule)
        .filter((schedule) => schedule.schedule_date);

    if (schedules.length > 0) {
        await AcademicSchedule.bulkCreate(schedules, {
            updateOnDuplicate: [
                "schedule_date",
                "event_content",
                "subtracted_day_name",
                "one_grade_event_yn",
                "tw_grade_event_yn",
                "three_grade_event_yn",
                "fr_grade_event_yn",
                "fiv_grade_event_yn",
                "six_grade_event_yn",
                "neis_load_dtm",
                "updated_at",
            ],
        });
    }

    return {
        schoolCode: school.school_code,
        atptCode: school.atpt_code,
        year: String(year),
        syncedCount: schedules.length,
    };
}

async function syncAcademicSchedules({ schoolCode, year }) {
    const years = year ? [String(year)] : getDefaultSyncYears();

    const results = [];
    const failedYears = [];

    for (const targetYear of years) {
        try {
            const result = await syncAcademicSchedulesBySchoolAndYear({
                schoolCode,
                year: targetYear,
            });

            results.push({
                year: targetYear,
                status: "success",
                ...result,
            });
        } catch (error) {
            failedYears.push({
                year: targetYear,
                status: "failed",
                reason: error.message,
            });
        }
    }

    const syncedCount = results.reduce(
        (sum, item) => sum + item.syncedCount,
        0,
    );

    const status =
        failedYears.length === 0
            ? "success"
            : results.length === 0
              ? "failed"
              : "partial";

    return {
        schoolCode,
        years,
        status,
        syncedCount,
        successCount: results.length,
        failedCount: failedYears.length,
        results,
        failedYears,
    };
}

module.exports = {
    syncAcademicSchedules,
    syncAcademicSchedulesBySchoolAndYear,
};
