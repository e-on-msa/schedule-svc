// schedule-svc/src/jobs/academicScheduleBatchJob.js
const cron = require("node-cron");
const { School } = require("../../models");
const {
    syncAcademicSchedulesBySchoolAndYear,
} = require("../services/academicScheduleSyncService");

let isAcademicScheduleBatchRunning = false;

function getDefaultBatchYears() {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear].map(String);
}

async function runAcademicScheduleBatch(options = {}) {
    if (isAcademicScheduleBatchRunning) {
        return {
            status: "skipped",
            reason: "이미 학사일정 batch가 실행 중입니다.",
        };
    }

    isAcademicScheduleBatchRunning = true;

    const startedAt = new Date();
    const years = options.years?.length
        ? options.years.map(String)
        : getDefaultBatchYears();

    const result = {
        status: "success",
        startedAt: startedAt.toISOString(),
        finishedAt: null,
        years,
        totalSyncCount: 0, // 학교 × 연도 조합의 총 개수
        successCount: 0,
        failedCount: 0,
        syncedCount: 0,
        failures: [],
    };

    try {
        const schools = await School.findAll({
            attributes: ["school_code", "school_name", "atpt_code"],
            order: [["id", "ASC"]],
        });

        result.totalSyncCount = schools.length * years.length;

        for (const school of schools) {
            for (const year of years) {
                try {
                    const syncResult =
                        await syncAcademicSchedulesBySchoolAndYear({
                            schoolCode: school.school_code,
                            year,
                        });

                    result.successCount += 1;
                    result.syncedCount += syncResult.syncedCount;
                } catch (error) {
                    result.failedCount += 1;
                    result.failures.push({
                        schoolCode: school.school_code,
                        schoolName: school.school_name,
                        atptCode: school.atpt_code,
                        year,
                        reason: error.message,
                    });

                    console.error("[academic schedule batch failed]", {
                        schoolCode: school.school_code,
                        schoolName: school.school_name,
                        year,
                        error: error.message,
                    });
                }
            }
        }

        if (result.failedCount > 0) {
            result.status = result.successCount > 0 ? "partial" : "failed";
        }

        return result;
    } catch (error) {
        result.status = "failed";
        result.failures.push({
            schoolCode: null,
            schoolName: null,
            atptCode: null,
            year: null,
            reason: error?.message ?? String(error),
        });
        return result;
    } finally {
        result.finishedAt = new Date().toISOString();
        isAcademicScheduleBatchRunning = false;

        console.log("[academic schedule batch completed]", result);
    }
}

function getAcademicScheduleCronTimezone() {
    return process.env.ACADEMIC_SCHEDULE_CRON_TIMEZONE || "Asia/Seoul";
}

function validateAcademicScheduleCronExpression(cronExpression) {
    const validationResult = cron.validateCronExpression(cronExpression);

    if (!validationResult.valid) {
        const errorMessage =
            validationResult.error?.message ||
            "유효하지 않은 cron 표현식입니다.";

        throw new Error(
            `ACADEMIC_SCHEDULE_CRON 설정이 올바르지 않습니다: ${errorMessage}`,
        );
    }
}

function startAcademicScheduleBatchJob() {
    if (process.env.ACADEMIC_SCHEDULE_CRON_ENABLED !== "true") {
        console.log("[academic schedule batch] cron disabled");
        return;
    }

    const cronExpression = process.env.ACADEMIC_SCHEDULE_CRON || "0 3 * * *";

    const timezone = getAcademicScheduleCronTimezone();

    try {
        validateAcademicScheduleCronExpression(cronExpression);
    } catch (error) {
        console.error(
            "[academic schedule batch] cron validation failed:",
            error.message,
        );
        console.warn(
            "[academic schedule batch] cron job not registered due to invalid expression",
        );
        return;
    }

    cron.schedule(
        cronExpression,
        async () => {
            console.log("[academic schedule batch] cron started");

            try {
                await runAcademicScheduleBatch();
            } catch (error) {
                console.error(
                    "[academic schedule batch] unexpected error:",
                    error,
                );
            }
        },
        {
            timezone,
        },
    );

    console.log(
        `[academic schedule batch] cron registered: ${cronExpression}, timezone: ${timezone}`,
    );
}

module.exports = {
    runAcademicScheduleBatch,
    startAcademicScheduleBatchJob,
};
